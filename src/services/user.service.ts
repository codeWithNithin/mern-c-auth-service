import type { Repository } from 'typeorm'
import type { User } from '../entities/User.js'
import type { UserData } from '../types/index.js'
import type CredentialService from './credential.service.js'
import createHttpError from 'http-errors'

class UserService {
    constructor(
        private userRepository: Repository<User>,
        private credentialService: CredentialService,
    ) {}

    async create({ firstName, lastName, email, password, role }: UserData) {
        const existingUser = await this.userRepository.findOne({
            where: {
                email,
            },
        })

        // check if user already existss
        if (existingUser) {
            const err = createHttpError(
                400,
                'user with same email id already exists!!',
            )
            throw err
        }

        const hashedPassword =
            await this.credentialService.createHashPassword(password)

        return await this.userRepository.save({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role,
        })
    }

    async findEmail(email: string) {
        try {
            return await this.userRepository.findOne({
                where: {
                    email,
                },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    password: true,
                    role: true,
                },
            })
        } catch {
            const error = createHttpError(
                500,
                'failed to fetch email from database',
            )
            throw error
        }
    }

    // async findById(id: number) {
    //     return await this.userRepository.findOne({
    //         where: {
    //             id,
    //         },
    //         relations: {
    //             tenant: true,
    //         },
    //     })
    // }

    // async find() {
    //     return await this.userRepository.find()
    // }

    // async update(id: number, userData: limitedUser) {
    //     return await this.userRepository.update(id, userData)
    // }

    // async delete(id: number) {
    //     return await this.userRepository.delete(id)
    // }
}

export default UserService
