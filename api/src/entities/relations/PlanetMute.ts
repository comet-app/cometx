import { Field, ID, ObjectType } from 'type-graphql'
import { CreateDateColumn, Entity, ManyToOne, PrimaryColumn } from 'typeorm'
import { Lazy } from '@/Lazy'
import { User } from '@/entities/User'
import { Planet } from '@/entities/Planet'

@ObjectType()
@Entity()
export class PlanetMute {
  @ManyToOne(() => User, user => user.mutedPlanets)
  user: Lazy<User>

  @Field(() => ID)
  @PrimaryColumn('bigint')
  userId: number

  @ManyToOne(() => Planet, planet => planet.mutes)
  planet: Lazy<Planet>

  @Field(() => ID)
  @PrimaryColumn('bigint')
  planetId: number

  @Field()
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date
}