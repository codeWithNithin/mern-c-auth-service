import express from 'express'
import AuthController from '../controllers/auth.controller.js'
import UserService from '../services/user.service.js'
import { AppDataSource } from '../config/data-source.js'
import { User } from '../entities/User.js'
import logger from '../config/logger.js'
import CredentialService from '../services/credential.service.js'
import registerValidator from '../validators/register.validator.js'

const authRouter = express.Router()

// repositories
const userRepository = AppDataSource.getRepository(User)

// services
const credentialService = new CredentialService()
const userService = new UserService(userRepository, credentialService)

// controllers
const authController = new AuthController(userService, logger)

authRouter.post(
    '/register',
    registerValidator,
    authController.register.bind(authController),
)

export default authRouter
