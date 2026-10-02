import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { User } from '../entities/User.js'
import { Config } from './env.js'

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: Config.DB_HOST!,
    port: Number(Config.DB_PORT)!,
    username: Config.DB_USERNAME!,
    password: Config.DB_PASSWORD!,
    database: Config.DB_NAME!,
    // dont keep this in production...
    synchronize: ['dev', 'production', 'test'].includes(Config.NODE_ENV),
    logging: false,
    entities: [User],
    migrations: [],
    subscribers: [],
})
