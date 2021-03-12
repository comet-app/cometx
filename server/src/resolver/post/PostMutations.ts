import {
  Arg,
  Args,
  Authorized,
  Ctx,
  ID,
  Mutation,
  Resolver
} from 'type-graphql'
import { Post, Server, PostVote } from '@/entity'
import { CreatePostArgs } from '@/resolver/post'
import { Context, ServerPermission } from '@/types'
import { uploadImage, scrapeMetadata, handleText, Auth } from '@/util'

@Resolver()
export class PostMutations {
  @Authorized(ServerPermission.CreatePost)
  @Mutation(() => Post, {
    description:
      'Create a post in a server (requires ServerPermission.CreatePost)'
  })
  async createPost(
    @Args()
    { title, linkUrl, text, serverId, images }: CreatePostArgs,
    @Ctx() { user, em }: Context
  ) {
    if (text) {
      text = handleText(text)
      if (!text) text = null
    }

    const server = await em.findOne(Server, serverId)

    const imageUrls = []

    if (images && images.length > 0) {
      for (const image of images) {
        const imageUrl = await uploadImage(image)
        imageUrls.push(imageUrl)
      }
    }

    const post = em.create(Post, {
      title,
      linkUrl,
      author: user,
      server,
      linkMetadata: linkUrl ? await scrapeMetadata(linkUrl) : null,
      imageUrls,
      text: text,
      rocketers: [user],
      rocketCount: 1,
      isRocketed: true
    })

    await em.persistAndFlush(post)

    return post
  }

  @Authorized(Auth.Author)
  @Mutation(() => Boolean, {
    description: 'Edit a post (requires Auth.Author)'
  })
  async editPost(
    @Arg('postId', () => ID, { description: 'ID of post to edit' })
    postId: string,
    @Arg('text') text: string,
    @Ctx() { user, em }: Context
  ) {
    const post = await em.findOne(Post, postId)

    text = handleText(text)
    if (!text) text = null

    post.text = text
    post.editedAt = new Date()

    await em.persistAndFlush(post)

    return true
  }

  @Authorized(Auth.Author)
  @Mutation(() => Boolean, {
    description: 'Delete a post (requires Auth.Author)'
  })
  async deletePost(
    @Arg('postId', () => ID) postId: string,
    @Ctx() { user, em }: Context
  ) {
    const post = await em.findOne(Post, postId)
    post.isDeleted = true
    post.isPinned = false
    await em.persistAndFlush(post)
    return true
  }

  @Authorized(ServerPermission.VotePost)
  @Mutation(() => Boolean, { description: 'Add vote to post' })
  async votePost(
    @Arg('postId', () => ID, {
      description: 'ID of post to vote (requires ServerPermission.VotePost)'
    })
    postId: string,
    @Ctx() { user, em }: Context
  ) {
    const post = await em.findOneOrFail(Post, postId)
    let vote = await em.findOne(PostVote, { user, post })
    if (vote) throw new Error('You have already voted this post')
    vote = em.create(PostVote, { user, post })
    post.voteCount++
    await em.persistAndFlush([post, vote])
    return true
  }

  @Authorized(ServerPermission.VotePost)
  @Mutation(() => Boolean, { description: 'Remove vote from post' })
  async unvotePost(
    @Arg('postId', () => ID, {
      description:
        'ID of post to remove vote (requires ServerPermission.VotePost)'
    })
    postId: string,
    @Ctx() { user, em }: Context
  ) {
    const post = await em.findOneOrFail(Post, postId)
    const vote = await em.findOneOrFail(PostVote, { user, post })
    vote.isActive = false
    post.voteCount--
    await em.persistAndFlush([post, vote])
    return true
  }

  @Authorized(ServerPermission.ManagePosts)
  @Mutation(() => Boolean, {
    description: 'Remove a post (requires ServerPermission.ManagePosts)'
  })
  async removePost(
    @Arg('postId', () => ID) postId: string,
    @Arg('reason') reason: string,
    @Ctx() { em }: Context
  ) {
    const post = await em.findOne(Post, postId)

    em.assign(post, {
      isRemoved: true,
      removedReason: reason,
      isPinned: false,
      pinPosition: null
    })
    await em.persistAndFlush(post)
    return true
  }

  @Authorized(ServerPermission.ManagePosts)
  @Mutation(() => Boolean, {
    description: 'Pin a post (requires ServerPermission.ManagePosts)'
  })
  async pinPost(
    @Arg('postId', () => ID, { description: 'ID of post to pin' })
    postId: string,
    @Ctx() { em }: Context
  ) {
    const post = await em.findOne(Post, postId)
    if (post.isPinned) throw new Error('Post is already pinned')
    post.isPinned = true
    await em.persistAndFlush(post)
    return true
  }

  @Authorized(ServerPermission.ManagePosts)
  @Mutation(() => Boolean, {
    description: 'Unpin a post (requires ServerPermission.ManagePosts)'
  })
  async unpinPost(
    @Arg('postId', () => ID, { description: 'ID of post to unpin' })
    postId: string,
    @Ctx() { em }: Context
  ) {
    const post = await em.findOne(Post, postId)
    if (!post.isPinned) throw new Error('Post is not pinned')
    post.isPinned = false
    await em.persistAndFlush(post)
    return true
  }
}
