import express, { type Request, type Response } from 'express'
import type { HttpError } from 'http-errors'
import createHttpError from 'http-errors'
import logger from './config/logger.js'

const app = express()

app.get('/', (req, res, next) => {
    const err = createHttpError(400, 'err testing')
    next(err)
    // res.json({ message: 'Welcome to Auth service' })
})

app.use((err: HttpError, req: Request, res: Response) => {
    logger.error('error in global err handler', err.message)
    const statusCode = err.statusCode || 500

    res.status(statusCode).json({
        errors: [
            {
                message: err.message,
                type: err.name,
                path: '',
                location: '',
            },
        ],
    })
})

export default app
