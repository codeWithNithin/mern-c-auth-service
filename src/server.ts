import app from './app.js'
import { AppDataSource } from './config/data-source.js'
import { Config } from './config/env.js'
import logger from './config/logger.js'

async function startServer() {
    try {
        await AppDataSource.initialize()

        logger.info('database has been connected')

        const PORT: number = Number(Config.port)

        app.listen(PORT, () => {
            logger.info('server running at PORT', { port: PORT })
        })
    } catch (err) {
        logger.error('err from server', { err: err })
    }
}

startServer()
