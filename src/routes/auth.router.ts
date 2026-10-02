import express from 'express'
import AuthController from '../controllers/auth.controller.js'
import UserService from '../services/user.service.js'
import { AppDataSource } from '../config/data-source.js'
import { User } from '../entities/User.js'
import logger from '../config/logger.js'
import CredentialService from '../services/credential.service.js'
import registerValidator from '../validators/register.validator.js'
import TokenService from '../services/token.service.js'
import { RefreshToken } from '../entities/RefreshToken.js'
import loginValidator from '../validators/login.validator.js'

const authRouter = express.Router()

// repositories
const userRepository = AppDataSource.getRepository(User)
const tokenRepository = AppDataSource.getRepository(RefreshToken)

// services
const credentialService = new CredentialService()
const userService = new UserService(userRepository, credentialService)
const tokenService = new TokenService(tokenRepository)

// controllers
const authController = new AuthController(
    userService,
    logger,
    tokenService,
    credentialService,
)

authRouter.post(
    '/register',
    registerValidator,
    authController.register.bind(authController),
)

authRouter.post(
    '/login',
    loginValidator,
    authController.login.bind(authController),
)

export default authRouter
