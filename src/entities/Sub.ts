import {Entity as TOENTITY, Column, Index, ManyToOne, JoinColumn, OneToMany} from "typeorm";

import Entity from './Entity';
import User from "./User";
import Post from "./Post";


@TOENTITY('subs')

export default class Sub extends Entity{
    // Partial 类型可空
    constructor(sub: Partial<Sub>) {
        super();
        Object.assign(this, sub);
    }

    @Index()
    @Column({ unique: true })
    name: string

    @Column({ type: 'text', nullable: true })
    description: string

    @Column()
    title: string

    @Column({ nullable: true })
    imageUrn: string

    @Column({ nullable: true })
    bannerUrn: string

    @ManyToOne(() => User, user => user.posts)
    @JoinColumn({name: 'username', referencedColumnName:'username'})
    user: User

    @OneToMany(() => Post, post => post.sub)
    posts: Post[]
}
