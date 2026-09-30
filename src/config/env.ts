import dotenv from 'dotenv'
// .env.dev || prod || test

dotenv.config({ path: `./.env.${process.env.NODE_ENV || 'dev'}` })

const { NODE_ENV, PORT } = process.env

export const Config = {
    port: PORT || 3000,
    env: NODE_ENV || 'dev',
}
