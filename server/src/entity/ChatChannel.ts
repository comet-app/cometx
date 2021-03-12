import { Field, ObjectType } from 'type-graphql'
import { ChatMessage, ChatGroup, Server, BaseEntity } from '@/entity'
import {
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  Property
} from '@mikro-orm/core'
import { Lexico } from '@/util/Lexico'
import { DirectMessage } from '@/entity/DirectMessage'

@ObjectType({ implements: BaseEntity })
@Entity()
export class ChatChannel extends BaseEntity {
  @Field({ nullable: true })
  @Property({ nullable: true })
  name?: string

  @Field({ nullable: true })
  @Property({ nullable: true })
  description?: string

  @OneToMany(() => ChatMessage, 'channel')
  messages = new Collection<ChatMessage>(this)

  @ManyToOne({ entity: () => Server, nullable: true, inversedBy: 'channels' })
  server?: Server

  @OneToOne({ entity: () => ChatGroup, nullable: true, inversedBy: 'channel' })
  group?: ChatGroup

  @OneToOne({
    entity: () => DirectMessage,
    nullable: true,
    inversedBy: 'channel'
  })
  directMessage?: DirectMessage

  @Property({ default: Lexico.FIRST_POSITION })
  position: string
}
