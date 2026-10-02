import express from 'express'
import AuthController from '../controllers/auth.js'
import UserService from '../services/user.service.js'
import { AppDataSource } from '../config/data-source.js'
import { User } from '../entities/User.js'
import logger from '../config/logger.js'

const authRouter = express.Router()

// repositories
const userRepository = AppDataSource.getRepository(User)

// services
const userService = new UserService(userRepository)

// controllers
const authController = new AuthController(userService, logger)

authRouter.post('/register', authController.register.bind(authController))

export default authRouter
