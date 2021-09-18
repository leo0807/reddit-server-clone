import { PrimaryGeneratedColumn, BaseEntity, CreateDateColumn} from "typeorm";
import { classToPlain, Exclude } from 'class-transformer';

// 创建命令

export default abstract class Entity extends BaseEntity{

    @Exclude()
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    createdAt: Date

    @CreateDateColumn()
    updatedAt: Date

    // 用来做transformation，当浏览到Exclude关键字的时候就隐藏对应的col
    toJSON () {
        return classToPlain(this)
    }
}
