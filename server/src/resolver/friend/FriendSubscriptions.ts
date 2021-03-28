import { Resolver, Subscription } from 'type-graphql'
import { SubscriptionTopic } from '@/types'

@Resolver()
export class FriendSubscriptions {
  @Subscription(() => Boolean, {
    topics: SubscriptionTopic.RefetchFriends,
    filter: ({ payload: userId, context: { user } }) => userId === user.id
  })
  refetchFriends() {
    return true
  }
}