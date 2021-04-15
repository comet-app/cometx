import { LoginResponse } from '@/resolver/user'
import { Context } from '@/types'
import { Field, InputType } from 'type-graphql'
import isEmail from 'validator/lib/isEmail'
import { User } from '@/entity'
import * as argon2 from 'argon2'
import { CustomError } from '@/types/CustomError'
import { createAccessToken } from '@/util'

@InputType()
export class LoginInput {
  @Field()
  email: string

  @Field()
  password: string
}

export async function login(
  { em }: Context,
  { email, password }: LoginInput
): Promise<LoginResponse> {
  email = email.toLowerCase()
  if (!isEmail(email)) throw new Error('error.login.invalidEmail')
  const user = await em.findOne(User, { email })
  if (!user) throw new Error('error.login.invalid')
  const match = await argon2.verify(user.passwordHash, password)
  if (!match) throw new Error('error.login.invalid')
  if (user.isBanned)
    throw new CustomError(
      'error.login.banned',
      user.banReason ? `: ${user.banReason}` : ''
    )
  user.lastLoginAt = new Date()
  await em.persistAndFlush(user)
  return {
    accessToken: createAccessToken(user),
    user
  } as LoginResponse
}