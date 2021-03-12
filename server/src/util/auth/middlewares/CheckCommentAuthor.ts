import { Context } from '@/types'
import { MiddlewareFn } from 'type-graphql'
import { ChatGroup, ChatMessage, Comment, DirectMessage, Post } from '@/entity'

/**
 * Expects groupId arg
 * Check if user is member of group
 */
export const CheckCommentAuthor: MiddlewareFn<Context> = async (
  { args: { commentId }, context: { em, user } },
  next
) => {
  if (!user) throw new Error('Not logged in')
  // if (!commentId) throw new Error('Args must include commentId')
  if (!commentId) return next()
  const message = await em.findOneOrFail(Comment, commentId, ['author'])
  if (message.author !== user)
    throw new Error('You are not the author of this post')
  return next()
}
