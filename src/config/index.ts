import { config } from 'dotenv'

config({ path: '.env' })

const { NODE_ENV, PORT } = process.env

export const Config = {
    PORT,
    NODE_ENV,
}
