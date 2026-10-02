import jwt, { type JwtPayload } from 'jsonwebtoken'
import fs from 'fs/promises'
import createHttpError from 'http-errors'
import { Config } from '../config/env.js'
import type { User } from '../entities/User.js'
import type { Repository } from 'typeorm'
import type { RefreshToken } from '../entities/RefreshToken.js'

class TokenService {
    constructor(private refreshTokenRepo: Repository<RefreshToken>) {}

    async generateAccessToken(payload: JwtPayload) {
        const PRIVATE_KEY = await fs.readFile('./certs/private.pem', 'utf8')

        if (!PRIVATE_KEY) {
            const err = createHttpError(500, 'SECRET_KEY is not set')
            throw err
        }

        return jwt.sign(payload, PRIVATE_KEY, {
            algorithm: 'RS256',
            expiresIn: '1h',
            issuer: 'auth-service',
        })
    }

    generateRefreshToken(payload: JwtPayload) {
        const SECRET_KEY: string = Config.JWT_SECRET_KEY!

        return jwt.sign(payload, SECRET_KEY, {
            algorithm: 'HS256',
            expiresIn: '1y',
            issuer: 'auth-service',
        })
    }

    async persistRefreshToken(user: User) {
        // create 365 days or 1 year gap
        const MS_IN_YEAR = 1000 * 60 * 60 * 24 * 365

        // expires in will be the current date  from now + 365 days
        const newRefreshToken = await this.refreshTokenRepo.save({
            user: user,
            expiresIn: new Date(Date.now() + MS_IN_YEAR),
        })

        return newRefreshToken
    }

    async deleteRefreshToken(id: number) {
        return await this.refreshTokenRepo.delete(id)
    }
}

export default TokenService
