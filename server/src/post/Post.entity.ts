import { Field, Int, ObjectType } from 'type-graphql'
import { Comment } from '@/comment/Comment.Entity'
import { User } from '@/user/User.entity'
import { Server } from '@/server/Server.entity'
import { URL } from 'url'
import { isUrl } from '@/util/IsUrl'
import { Metadata } from '@/metascraper/Metadata.entity'
import { Folder } from '@/folder/Folder.entity'
import {
  ArrayType,
  Collection,
  Embedded,
  Entity,
  Formula,
  ManyToMany,
  ManyToOne,
  OneToMany,
  Property
} from '@mikro-orm/core'
import { BaseEntity } from '@/types/Base.entity'

@ObjectType({ implements: BaseEntity })
@Entity()
export class Post extends BaseEntity {
  @Field({ nullable: true })
  @Property({ nullable: true })
  title: string

  @Field({ nullable: true })
  @Property({ nullable: true })
  text?: string

  @Field({ nullable: true })
  @Property({ nullable: true })
  linkUrl?: string

  @Field(() => Metadata, { nullable: true })
  @Embedded({ entity: () => Metadata, nullable: true, object: true })
  meta?: Metadata

  @Field({ nullable: true })
  get thumbnailUrl(): string | null {
    if (this.imageUrls && this.imageUrls.length > 0) return this.imageUrls[0]
    if (!this.linkUrl) return null
    if (this.meta && this.meta.image) return this.meta.image
    if (this.meta && this.meta.logo) return this.meta.logo
    return null
  }

  @Field({ nullable: true })
  get logoUrl(): string | null {
    if (!this.linkUrl) return null
    if (this.meta && this.meta.logo) return this.meta.logo
    return null
  }

  @Field(() => [String])
  @Property({ type: ArrayType, default: [] })
  imageUrls: string[]

  @Field({ nullable: true })
  get domain(): string | null {
    if (isUrl(this.linkUrl)) {
      let domain = new URL(this.linkUrl).hostname
      if (domain.startsWith('www.')) domain = domain.substring(4)
      return domain
    }
    return null
  }

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User)
  author: User

  @Field()
  @Property({ default: false })
  pinned: boolean

  @Field({ nullable: true })
  @Property({ nullable: true })
  pinRank?: number

  @OneToMany(() => Comment, 'post')
  comments = new Collection<Comment>(this)

  @Field(() => Server)
  @ManyToOne({ entity: () => Server })
  server: Server

  @ManyToMany(() => User)
  rocketers = new Collection<User>(this)

  @Field(() => Int)
  @Property({ default: 1 })
  rocketCount: number

  @Field(() => Int)
  @Property({ default: 0 })
  commentCount: number

  @Field()
  isRocketed: boolean

  @Field()
  get relativeUrl(): string {
    /*const slug = this.title
      .toLowerCase()
      .trim()
      .split(' ')
      .slice(0, 9)
      .join('-')
      .replace(/[^a-z0-9-]+/gi, '')
      .replace(/[-](.)\1+/g, '$1')*/
    const server = this.server as Server
    return `/server/${server.id}/post/${this.id}`
  }

  @Field(() => [Folder])
  @ManyToMany(() => Folder, 'posts')
  folders = new Collection<Folder>(this)

  @Formula(
    '(CAST(rocket_count AS float) + 1)/((CAST((CAST(EXTRACT(EPOCH FROM CURRENT_TIMESTAMP) AS int) -' +
      ' CAST(EXTRACT(EPOCH FROM created_at) AS int)+5000) AS FLOAT)/100.0)^(1.618))'
  )
  hotRank: number

  @Field({ nullable: true })
  @Property({ nullable: true })
  editedAt?: Date

  @Field()
  @Property({ default: false })
  deleted: boolean

  @Field()
  @Property({ default: false })
  removed: boolean

  @Field({ nullable: true })
  @Property({ nullable: true })
  removedReason?: string
}
