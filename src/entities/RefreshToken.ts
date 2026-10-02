import {
    Column,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm'
import { User } from './User.js'

@Entity({ name: 'refreshtokens' })
export class RefreshToken {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({ type: 'timestamp with time zone' })
    expiresIn!: Date

    @ManyToOne(() => User)
    user!: User

    @UpdateDateColumn()
    createdAt!: Date

    @UpdateDateColumn()
    updatedAt!: Date
}
