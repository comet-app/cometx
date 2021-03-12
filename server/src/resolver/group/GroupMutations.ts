import {
  Arg,
  Authorized,
  Ctx,
  ID,
  Mutation,
  Publisher,
  PubSub,
  Resolver
} from 'type-graphql'
import { Context, SubscriptionTopic } from '@/types'
import { ChatChannel, ChatGroup, User } from '@/entity'
import { Auth } from '@/util/auth/Auth'
import { FileUpload, GraphQLUpload } from 'graphql-upload'
import { uploadImage } from '@/util/s3'

@Resolver()
export class GroupMutations {
  @Authorized()
  @Mutation(() => Boolean, { description: 'Create group with users' })
  async createGroup(
    @Ctx() { user, em }: Context,
    @Arg('usernames', () => [String]) usernames: string[],
    @PubSub(SubscriptionTopic.GroupAdded) groupAdded: Publisher<ChatGroup>
  ) {
    if (usernames.length > 9) throw new Error('Max group size is 10 users')
    const users = [user]
    for (const username of usernames) {
      users.push(await em.findOneOrFail(User, { username }))
    }
    const group = em.create(ChatGroup, {
      users,
      owner: user
    })
    const channel = em.create(ChatChannel, {
      group
    })
    await em.persistAndFlush([group, channel])
    await groupAdded(group)
    return true
  }

  @Authorized(Auth.Group)
  @Mutation(() => Boolean, { description: 'Leave a group' })
  async leaveGroup(
    @Ctx() { user, em }: Context,
    @Arg('groupId', () => ID, { description: 'ID of group to leave' })
    groupId: string,
    @PubSub(SubscriptionTopic.UserLeftGroup)
    userLeftGroup: Publisher<{ userId: string; groupId: string }>
  ) {
    const group = await em.findOneOrFail(ChatGroup, groupId, ['users'])
    group.users.remove(user)
    if (group.owner === user) group.owner = group.users.getItems()[0]
    await em.persistAndFlush(group)
    await userLeftGroup({ userId: user.id, groupId: group.id })
    return true
  }

  @Authorized(Auth.GroupOwner)
  @Mutation(() => Boolean, { description: 'Rename a group' })
  async renameGroup(
    @Ctx() { user, em }: Context,
    @PubSub(SubscriptionTopic.UserLeftGroup)
    groupUpdated: Publisher<ChatGroup>,
    @Arg('groupId', () => ID, { description: 'ID of group to rename' })
    groupId: string,
    @Arg('name', {
      nullable: true,
      description:
        'New name of group, or null to use default name (list of users)'
    })
    name?: string
  ) {
    const group = await em.findOneOrFail(ChatGroup, groupId, ['users'])
    group.name = name
    await em.persistAndFlush(group)
    await groupUpdated(group)
    return true
  }

  @Authorized(Auth.GroupOwner)
  @Mutation(() => Boolean, { description: 'Change avatar image of group' })
  async changeGroupAvatar(
    @Ctx() { em }: Context,
    @PubSub(SubscriptionTopic.UserLeftGroup)
    groupUpdated: Publisher<ChatGroup>,
    @Arg('groupId', () => ID, { description: 'ID of group to update' })
    groupId: string,
    @Arg('avatarFile', () => GraphQLUpload, {
      nullable: true,
      description: 'Avatar file upload for group, or null to remove avatar'
    })
    avatarFile?: FileUpload
  ) {
    const group = await em.findOneOrFail(ChatGroup, groupId, ['users'])
    group.avatarUrl = avatarFile
      ? await uploadImage(avatarFile, {
          width: 256,
          height: 256
        })
      : null
    await em.persistAndFlush(group)
    await groupUpdated(group)
    return true
  }
}
