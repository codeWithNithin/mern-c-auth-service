import type { NextFunction, Request, Response } from 'express'
import type UserService from '../services/user.service.js'
import type { Logger } from 'winston'
import { Roles } from '../constants/index.js'
import { validationResult } from 'express-validator'
import type TokenService from '../services/token.service.js'
import type { JwtPayload } from 'jsonwebtoken'

class AuthController {
    constructor(
        private userService: UserService,
        private logger: Logger,
        private tokenService: TokenService,
    ) {}

    async register(req: Request, res: Response, next: NextFunction) {
        const result = validationResult(req)

        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() })
        }

        const { firstName, lastName, email, password } = req.body

        this.logger.info('new request to register a user', {
            firstName,
            lastName,
            email,
            password: '*******',
        })

        try {
            const user = await this.userService.create({
                firstName,
                lastName,
                email,
                password,
                role: Roles.CUSTOMER,
            })

            this.logger.info('user created successfully', { id: user.id })

            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
            }

            const accessToken =
                await this.tokenService.generateAccessToken(payload)

            // save refresh token in DB
            const newRefreshToken =
                await this.tokenService.persistRefreshToken(user)

            // generate refresh token by passing the refresh token id
            const refreshToken = this.tokenService.generateRefreshToken({
                ...payload,
                id: newRefreshToken.id,
            })

            res.cookie('accessToken', accessToken, {
                httpOnly: true,
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60 * 1,
                domain: 'localhost',
            })

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60 * 365,
                domain: 'localhost',
            })

            res.status(201).json({ id: user.id })
        } catch (err) {
            next(err)
            return
        }
    }
}

export default AuthController
