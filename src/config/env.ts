import dotenv from 'dotenv'
// .env.dev || prod || test

dotenv.config({ path: `./.env.${process.env.NODE_ENV || 'dev'}` })

const {
    NODE_ENV,
    PORT,
    DB_HOST,
    DB_PORT,
    DB_USERNAME,
    DB_PASSWORD,
    DB_NAME,
    JWT_SECRET_KEY,
} = process.env

export const Config = {
    port: PORT || 3000,
    NODE_ENV: NODE_ENV || 'dev',
    DB_HOST: DB_HOST,
    DB_PORT: DB_PORT,
    DB_USERNAME: DB_USERNAME,
    DB_PASSWORD: DB_PASSWORD,
    DB_NAME: DB_NAME,
    JWT_SECRET_KEY: JWT_SECRET_KEY,
}
