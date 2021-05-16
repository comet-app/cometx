import { Field, ObjectType } from 'type-graphql'
import {
  Channel,
  Folder,
  Post,
  ServerCategory,
  ServerFolder,
  ServerPermission,
  User
} from '@/entity'
import { BaseEntity } from '@/entity/BaseEntity'
import {
  Collection,
  Entity,
  Enum,
  ManyToOne,
  OneToMany,
  OneToOne,
  Property,
  QueryOrder
} from '@mikro-orm/core'
import { ServerUser } from '@/entity/server/ServerUser'
import { Role } from '@/entity/server/Role'
import { GraphQLNonNegativeInt } from 'graphql-scalars'

@ObjectType({ implements: BaseEntity })
@Entity()
export class Server extends BaseEntity {
  @Field()
  @Property({ columnType: 'text' })
  name: string

  @Field()
  @Property({ columnType: 'text' })
  displayName: string

  @Field({ nullable: true })
  @Property({ nullable: true, columnType: 'text' })
  description?: string

  @Field(() => User)
  @ManyToOne(() => User)
  owner: User

  @OneToMany(() => Post, 'server')
  posts = new Collection<Post>(this)

  @Field(() => [Role])
  @OneToMany(() => Role, 'server', {
    orderBy: { position: QueryOrder.ASC }
  })
  roles = new Collection<Role>(this)

  @OneToMany(() => ServerUser, 'server', {
    orderBy: { position: QueryOrder.ASC }
  })
  userJoins = new Collection<ServerUser>(this)

  @OneToMany(() => ServerFolder, 'server', {
    orderBy: { position: QueryOrder.ASC }
  })
  serverFolders = new Collection<ServerFolder>(this)

  @Field(() => [Folder])
  folders: Folder[]

  @Field(() => ServerCategory)
  @Enum({ items: () => ServerCategory })
  category: ServerCategory = ServerCategory.Other

  @Field(() => GraphQLNonNegativeInt)
  @Property({ unsigned: true })
  userCount: number = 0

  @Field(() => GraphQLNonNegativeInt)
  onlineCount: number = 0

  @Field({ nullable: true })
  @Property({ nullable: true, columnType: 'text' })
  avatarUrl?: string

  @Field({ nullable: true })
  @Property({ nullable: true, columnType: 'text' })
  bannerUrl?: string

  @Field()
  @Property()
  isBanned: boolean = false

  @Field()
  @Property()
  isDeleted: boolean = false

  @Field(() => [Channel])
  @OneToMany(() => Channel, 'server', {
    orderBy: { position: QueryOrder.ASC }
  })
  channels = new Collection<Channel>(this)

  @Field(() => [ServerPermission])
  permissions: ServerPermission[]

  @Field(() => Channel)
  @OneToOne(() => Channel, undefined, { nullable: true })
  systemMessagesChannel?: Channel

  @Field()
  @Property()
  isFeatured: boolean = false

  @Field()
  isJoined: boolean

  @Property({ nullable: true, columnType: 'text' })
  featuredPosition?: string
}
