import {Entity as TOENTITY, Column, ManyToOne, JoinColumn} from "typeorm";
import Comment from "./Comment";
import Entity from './Entity';
import Post from "./Post";
import User from './User';

@TOENTITY('votes')
export default class Vote  extends Entity{

    constructor(vote: Partial<Vote>) {
        super();
        Object.assign(this,vote)
    }

    @Column()
    value: number

    @ManyToOne(() => User)
    @JoinColumn({ name: 'usernmae', referencedColumnName: 'username' })
    user: User
    
    @Column()
    username: string

    @ManyToOne(() => Post)
    post: Post

    @ManyToOne(() => Comment)
    comment: Comment


}
