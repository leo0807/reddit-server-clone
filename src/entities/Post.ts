import {
  Entity as TOEntity,
  Column,
  Index,
  BeforeInsert,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm'

import Entity from './Entity'
import User from './User'
import { makeId, slugfy } from '../util/helpers'
import Sub from './Sub'
import Comment from './Comment'
import { Exclude, Expose } from 'class-transformer'
import Vote from './Vote'

@TOEntity('posts')
export default class Post extends Entity {
  constructor(post: Partial<Post>) {
    super()
    Object.assign(this, post)
  }

  @Index()
  @Column()
  identifier: string // 7 Character Id

  @Column()
  title: string

  @Index()
  @Column()
  slug: string

  @Column({ nullable: true, type: 'text' })
  body: string

  @Column()
  subName: string

  @Column()
  username:string

  @ManyToOne(() => User, (user) => user.posts)
  @JoinColumn({ name: 'username', referencedColumnName: 'username' })
  user: User

  @ManyToOne(() => Sub, (sub) => sub.posts)
  @JoinColumn({ name: 'subName', referencedColumnName: 'name' })
  sub: Sub

  @Exclude()
  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[]

  @Exclude()
  @OneToMany(() => Vote, vote => vote.comment)
  votes: Vote[]


// Expose 类似于 protected
  @Expose() get url(): string{
    return `/r/${this.subName}/${this.identifier}/${this.slug}`;
  }

  @Expose() get comentsCount(): number{
    return this.comments?.length;
  }

  @Expose() getvoteScore(): number{
    return this.votes?.reduce((prev, cur)=> prev + (cur.value|| 0), 0);
  }
  // 用于 前端页面链接
  // url: string
  // @AfterLoad()
  // createFileds() {
  //   this.url = `/r/${this.subName}/${this.identifier}/${this.slug}`
  // }

  protected userVote: number
  setUserVote(user: User) {
    // 取评论和用户的交集， 找到用户是否有对该Post进行vote的行为
    const index = this.votes?.findIndex(v => v.username === user.username);
    this.userVote = index > -1 ? this.votes[index].value : 0;
  }
    

  @BeforeInsert()
  makeIdAndSlug() {
    this.identifier = makeId(7)
    this.slug = slugfy(this.title)
  }
}