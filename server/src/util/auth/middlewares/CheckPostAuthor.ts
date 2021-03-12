import { Context } from '@/types'
import { createMethodDecorator } from 'type-graphql'
import { Post } from '@/entity'

/**
 * Expects groupId arg
 * Check if user is member of group
 */
export const CheckPostAuthor = () =>
  createMethodDecorator<Context>(
    async ({ args: { postId }, context: { em, user } }, next) => {
      if (!user) throw new Error('Not logged in')
      // if (!postId) throw new Error('Args must include postId')
      if (!postId) return next()
      const message = await em.findOneOrFail(Post, postId, ['author'])
      if (message.author !== user)
        throw new Error('You are not the author of this post')
      return next()
    }
  )
