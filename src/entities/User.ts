import { IsEmail, Length } from "class-validator"; // 检查是否合法
import {Entity as TOENTITY, Column, Index, BeforeInsert, OneToMany, CreateDateColumn, UpdateDateColumn} from "typeorm";
import bcrypt from 'bcrypt'; // 对密码进行加密
import { classToPlain, Exclude } from 'class-transformer'; // 隐藏reseponse中的密码和id
// 在reseponse中 隐藏password 和id
import Entity from './Entity';
import Post from "./Post";
import Vote from "./Vote";


@TOENTITY('users')
    // 将表重命名为users
    // 继承BaseEntity可以使用 active enetiy approach
export default class User extends Entity{
    // Partial 类型可空
    // 结构函数用来方便初始化 
    constructor(user: Partial<User>) {
        super();
        // 将实例传递给调用的user
        Object.assign(this, user);
    }

    // 添加Index 可以让Query的时候 速度更快
    @Index()
    @IsEmail(undefined, { message: 'Must be a valid email' })
    @Length(1, 255, {message: 'Email is empty'})
    @Column({unique: true})
    email: string;

    @Index()
    @Column({ unique: true })
    @Length(3, 255, {message: "Must at least 3 characters long"})
    username: string;

    @Exclude()
    @Column()
    @Length(6, 255, {message: "Must at least 6 characters long"})
    password: string;
    // 映射关系 一个user有多个post
    @OneToMany(() => Post, post => post.user)
    posts: Post[];

    @OneToMany(() => Vote, vote => vote.user)
    votes: Vote[];

    // 在数据进入数据库之前使用
    @BeforeInsert()
    async hashPassword() {
        this.password = await bcrypt.hash(this.password, 6); 
    }


}
