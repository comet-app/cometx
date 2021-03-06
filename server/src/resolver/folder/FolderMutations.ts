import {
  Arg,
  Authorized,
  Ctx,
  ID,
  Mutation,
  Query,
  Resolver
} from 'type-graphql'
import { Context } from '@/types'
import { Folder, Post, Server } from '@/entity'
import { handleUnderscore } from '@/util/text'

@Resolver()
export class FolderMutations {
  @Authorized()
  @Mutation(() => Boolean)
  async addPostToFolder(
    @Arg('postId', () => ID) postId: string,
    @Arg('folderId', () => ID) folderId: string,
    @Ctx() { user, em }: Context
  ) {
    const folder = await em.findOne(Folder, folderId, ['creator', 'server'])
    if (!folder) throw new Error('Invalid folder')
    if (folder.deleted) throw new Error('Folder has been deleted')
    if (folder.owner !== user) throw new Error('You do not own this folder')
    const post = await em.findOne(Post, postId)
    folder.posts.add(post)
    folder.updatedAt = new Date()
    await em.persistAndFlush(folder)
    return true
  }

  @Authorized()
  @Mutation(() => Boolean)
  async removePostFromFolder(
    @Arg('postId', () => ID) postId: string,
    @Arg('folderId', () => ID) folderId: string,
    @Ctx() { user, em }: Context
  ) {
    const folder = await em.findOne(Folder, folderId, ['creator'])
    if (!folder) throw new Error('Invalid folder')
    if (folder.deleted) throw new Error('Folder has been deleted')
    if (folder.owner !== user) throw new Error('You do not own this folder')
    const post = await em.findOne(Post, postId)
    folder.posts.remove(post)
    folder.updatedAt = new Date()
    await em.persistAndFlush(folder)
    return true
  }

  @Authorized()
  @Mutation(() => Boolean)
  async createUserFolder(
    @Arg('name') name: string,
    @Ctx() { user, em }: Context
  ) {
    if (name.length > 300)
      throw new Error('Name cannot be longer than 300 characters')
    if (
      await em.findOne(Folder, {
        $and: [{ name: { $ilike: handleUnderscore(name) } }, { owner: user }]
      })
    )
      throw new Error('You already have a folder with that name')
    const folder = em.create(Folder, {
      owner: user,
      name
    })
    await em.persistAndFlush(folder)
    return true
  }
}