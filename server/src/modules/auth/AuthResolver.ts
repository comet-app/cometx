import { Arg, Authorized, Ctx, Mutation, Resolver } from 'type-graphql'
import { LoginResponse } from '@/modules/auth/LoginResponse'
import { Context } from '@/types/Context'
import { User } from '@/entity/User'
import { createAccessToken } from '@/modules/auth/AuthTokens'
import * as argon2 from 'argon2'
import { handleUnderscore } from '@/util/handleUnderscore'
import { Server } from '@/entity/Server'
import { customAlphabet } from 'nanoid'
import isEmail from 'validator/lib/isEmail'
import { Folder } from '@/entity/Folder'

const tagGenerator = customAlphabet('0123456789', 4)

@Resolver()
export class AuthResolver {
  @Mutation(() => LoginResponse)
  async signUp(
    @Ctx() { em }: Context,
    @Arg('name') name: string,
    @Arg('password') password: string,
    @Arg('email') email: string
  ) {
    email = email.toLowerCase()
    if (!isEmail(email)) throw new Error('Invalid email address')

    name = name
      .replace(/ +(?= )/g, '') // remove repeated spaces
      .replace(/[\u200B-\u200D\uFEFF]/g, '') // remove zero-width characters
      .trim() // remove leading and trailing whitespace
    if (name.length < 2 || name.length > 32)
      throw new Error('Username must be 2-32 characters')

    const bannedSubstrings = ['@', '#', ':', '```']

    for (const s of bannedSubstrings) {
      if (name.includes(s)) throw new Error(`Username cannot contain '${s}'`)
    }

    const foundUser = await em.findOne(User, {
      email: handleUnderscore(email)
    })
    if (foundUser) throw new Error('Email already in use')

    const passwordHash = await argon2.hash(password)

    let tag = tagGenerator()

    while (
      await em.findOne(User, {
        $and: [{ name: { $ilike: handleUnderscore(name) } }, { tag }]
      })
    ) {
      tag = tagGenerator()
    }

    const user = em.create(User, {
      name,
      tag,
      passwordHash,
      lastLogin: new Date(),
      email
    })

    const favoritesFolder = em.create(Folder, {
      name: 'Favorites',
      owner: user
    })

    const readLaterFolder = em.create(Folder, {
      name: 'Read Later',
      owner: user
    })
    await em.persistAndFlush([user, favoritesFolder, readLaterFolder])
    user.foldersSort = [favoritesFolder.id, readLaterFolder.id]
    await em.persistAndFlush(user)

    const accessToken = createAccessToken(user)
    return {
      accessToken,
      user
    } as LoginResponse
  }

  @Mutation(() => LoginResponse)
  async login(
    @Ctx() { em }: Context,
    @Arg('email') email: string,
    @Arg('password') password: string
  ) {
    email = email.toLowerCase()
    if (!isEmail(email)) throw new Error('Invalid email')
    const user = await em.findOne(User, { email })
    if (!user) throw new Error('Invalid Login')
    const match = await argon2.verify(user.passwordHash, password)
    if (!match) throw new Error('Invalid Login')
    if (user.banned) throw new Error('Banned: ' + user.banReason)
    user.lastLogin = new Date()
    await em.persistAndFlush(user)
    const accessToken = createAccessToken(user)
    return {
      accessToken,
      user
    } as LoginResponse
  }

  @Authorized()
  @Mutation(() => LoginResponse)
  async changePassword(
    @Arg('currentPassword') currentPassword: string,
    @Arg('newPassword') newPassword: string,
    @Ctx() { user, em }: Context
  ) {
    const match = await argon2.verify(user.passwordHash, currentPassword)
    if (!match) throw new Error('Current password incorrect!')

    user.passwordHash = await argon2.hash(newPassword)
    await em.persistAndFlush(user)
    return {
      accessToken: createAccessToken(user),
      user
    } as LoginResponse
  }
}