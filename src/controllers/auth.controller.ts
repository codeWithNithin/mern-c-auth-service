import type { CookieOptions, NextFunction, Request, Response } from 'express'
import type UserService from '../services/user.service.js'
import type { Logger } from 'winston'
import { Roles } from '../constants/index.js'
import { validationResult } from 'express-validator'
import type TokenService from '../services/token.service.js'
import type { JwtPayload } from 'jsonwebtoken'
import createHttpError from 'http-errors'
import type CredentialService from '../services/credential.service.js'

class AuthController {
    constructor(
        private userService: UserService,
        private logger: Logger,
        private tokenService: TokenService,
        private credentialService: CredentialService,
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

            this.setCookie(res, 'accessToken', accessToken)
            this.setCookie(res, 'refreshToken', refreshToken)

            res.status(201).json({ id: user.id })
        } catch (err) {
            next(err)
            return
        }
    }

    async login(req: Request, res: Response, next: NextFunction) {
        const result = validationResult(req)

        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() })
        }

        const { email, password } = req.body

        const user = await this.userService.findEmail(email)

        if (!user) {
            const error = createHttpError(
                400,
                'Email or password does not exist',
            )
            next(error)
            return
        }

        const passwordMatch = await this.credentialService.comparePassword(
            password,
            user.password,
        )

        if (!passwordMatch) {
            const error = createHttpError(
                400,
                'Email or password does not exist',
            )
            next(error)
            return
        }

        const payload: JwtPayload = {
            sub: String(user.id),
            role: user.role,
        }

        // generate access token
        const accessToken = await this.tokenService.generateAccessToken(payload)

        // save refresh token in DB
        const newRefreshToken =
            await this.tokenService.persistRefreshToken(user)

        // generate refresh token by passing the refresh token id
        const refreshToken = this.tokenService.generateRefreshToken({
            ...payload,
            id: newRefreshToken.id,
        })

        this.setCookie(res, 'accessToken', accessToken)
        this.setCookie(res, 'refreshToken', refreshToken)

        this.logger.info('user has been loggedIn', { id: user.id })

        res.status(200).json({
            id: user.id,
        })
    }

    setCookie(res: Response, label: string, token: string) {
        const ACCESS_TOKEN_MAX_AGE = 1000 * 60 * 60 * 1
        const REFRESH_TOKEN_MAX_AGE = 1000 * 60 * 60 * 24 * 365

        const cookieOptions: CookieOptions = {
            httpOnly: true,
            sameSite: 'strict',
            maxAge:
                label === 'accessToken'
                    ? ACCESS_TOKEN_MAX_AGE
                    : REFRESH_TOKEN_MAX_AGE,
            domain: 'localhost',
        }

        return res.cookie(label, token, cookieOptions)
    }
}

export default AuthController
