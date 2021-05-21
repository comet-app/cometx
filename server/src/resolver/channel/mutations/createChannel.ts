import { Context } from '@/types'
import { Field, ID, InputType } from 'type-graphql'
import {
  Channel,
  ChannelType,
  Message,
  MessageType,
  Server,
  ServerPermission,
  ServerUser,
  ServerUserStatus,
  User
} from '@/entity'
import { handleUnderscore, ReorderUtils } from '@/util'
import { Matches, MaxLength } from 'class-validator'

@InputType()
export class CreateChannelInput {
  @Field(() => ID)
  serverId: string

  @Field()
  @MaxLength(100)
  @Matches(/^[a-z0-9-_]+/)
  name: string

  @Field({ nullable: true })
  @MaxLength(500)
  description?: string

  @Field(() => ChannelType, { defaultValue: ChannelType.Public })
  type: ChannelType = ChannelType.Public
}

export async function createChannel(
  { em, userId, liveQueryStore }: Context,
  { serverId, name, description, type }: CreateChannelInput
): Promise<Channel> {
  const user = await em.findOneOrFail(User, userId)
  const server = await em.findOneOrFail(Server, serverId, [
    'systemMessagesChannel'
  ])
  const serverUser = await em.findOneOrFail(ServerUser, {
    user,
    server,
    status: ServerUserStatus.Joined
  })

  await user.checkServerPermission(
    em,
    serverId,
    ServerPermission.ManageChannels
  )

  const foundChannel = await em.findOne(Channel, {
    server,
    isDeleted: false,
    name: { $ilike: handleUnderscore(name) }
  })
  if (foundChannel) throw new Error('Channel with that name already exists')

  const firstChannel = await em.findOne(
    Channel,
    { server, isDeleted: false },
    { orderBy: { position: 'ASC' } }
  )

  const channel = em.create(Channel, {
    name,
    description,
    server,
    type,
    position: firstChannel
      ? ReorderUtils.positionBefore(firstChannel.position)
      : ReorderUtils.FIRST_POSITION
  })
  const initialMessage = em.create(Message, {
    type: MessageType.Initial,
    author: user,
    channel
  })

  if (!server.systemMessagesChannel) server.systemMessagesChannel = channel

  await em.persistAndFlush([channel, server, initialMessage])
  liveQueryStore.invalidate(`Server:${serverId}`)
  return channel
}
