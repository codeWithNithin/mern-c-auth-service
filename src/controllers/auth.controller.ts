import type { NextFunction, Request, Response } from 'express'
import type UserService from '../services/user.service.js'
import type { Logger } from 'winston'
import { Roles } from '../constants/index.js'
import { validationResult } from 'express-validator'

class AuthController {
    constructor(
        private userService: UserService,
        private logger: Logger,
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
            res.status(201).json({ message: 'user register successful' })
        } catch (err) {
            next(err)
            return
        }
    }
}

export default AuthController
