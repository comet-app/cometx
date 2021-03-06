import { Arg, Authorized, Ctx, ID, Mutation, Resolver } from 'type-graphql'
import { Notification } from '@/entity'
import { Context } from '@/types'

@Resolver()
export class NotificationMutations {
  @Authorized()
  @Mutation(() => Boolean)
  async markNotificationRead(
    @Arg('id', () => ID) id: string,
    @Ctx() { user, em }: Context
  ) {
    const notif = await em.findOne(Notification, id)
    if (!notif) throw new Error('Notification not found')
    if (notif.user !== user) throw new Error('This is not your notification')
    notif.read = true
    await em.persistAndFlush(notif)
    return true
  }

  @Authorized()
  @Mutation(() => Boolean)
  async markAllNotificationsRead(@Ctx() { user, em }: Context) {
    await em
      .createQueryBuilder(Notification)
      .update({ read: true })
      .where({ user })
      .execute()
    return true
  }
}