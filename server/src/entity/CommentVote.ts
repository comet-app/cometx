import { Entity, ManyToOne, PrimaryKeyType, Property } from '@mikro-orm/core'
import { BaseEntity, Comment, User } from '@/entity'

@Entity()
export class CommentVote {
  @ManyToOne({ entity: () => User, primary: true })
  user: User

  @ManyToOne({ entity: () => Comment, primary: true })
  comment: Comment;

  [PrimaryKeyType]: [string, string]

  @Property({ default: true })
  isActive: boolean

  @Property()
  createdAt: Date = new Date()
}
