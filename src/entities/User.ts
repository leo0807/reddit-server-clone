import { IsEmail, Length } from "class-validator";
import {Entity as TOENTITY, Column, Index, BeforeInsert, OneToMany} from "typeorm";
import bcrypt from 'bcrypt';
import { Exclude } from 'class-transformer';
// 在reseponse中 隐藏password 和id
import Entity from './Entity';
import Post from "./Post";


@TOENTITY('users')
    // 将表重命名为users
    // 继承BaseEntity可以使用 active enetiy approach
export default class User extends Entity{
    // Partial 类型可空
    constructor(user: Partial<User>) {
        super();
        Object.assign(this, user);
    }

    // 添加Index 可以让Query的时候 速度更快
    @Index()
    @IsEmail()
    @Column({unique: true})
    email: string;

    @Index()
    @Column({ unique: true })
    @Length(3, 255, {message: "Username must at least 3 characters long"})
    username: string;

    @Exclude()
    @Column()
    @Length(3, 255)
    password: string;

    @OneToMany(() => Post, post => post.user)
    posts: Post[];

    // 在数据进入数据库之前使用
    @BeforeInsert()
    async hashPassword() {
        this.password = await bcrypt.hash(this.password, 6); 
    }
}
