import {
  Entity,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
  OneToMany
} from 'typeorm';

import MyEntity from './MyEntity';
import User from './User';
import Post from './Post';
import { Expose } from 'class-transformer';

@Entity('subs')
export default class Sub extends MyEntity {
  // digunakan untuk memudahkan dalam create new User
  constructor(sub: Partial<Sub>) {
    super();
    Object.assign(this, sub);
  }

  @Index()
  @Column({ unique: true })
  name: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  imageUrn: string;

  @Column({ nullable: true })
  bannerUrn: string;

  @Column()
  username: string;

  @ManyToOne(() => User, (user) => user.posts)
  @JoinColumn({ name: 'username', referencedColumnName: 'username' })
  user: User;

  @OneToMany(() => Post, (post) => post.sub)
  posts: Post[];

  // 用于将URN链接到IMAGE的URL，
  // DB的地址是动态的，未知的，所以不适用
  // 如果没有图片，则显示默认图片
  @Expose()
  get imageUrl(): string {
    return this.imageUrn
      ? `${process.env.APP_URL}/images/${this.imageUrn}`
      : 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
  }

  @Expose()
  get bannerUrl(): string | undefined {
    return this.bannerUrn
      ? `${process.env.APP_URL}/images/${this.bannerUrn}`
      : undefined;
  }
}
