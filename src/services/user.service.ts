import type { Repository } from 'typeorm'
import type { User } from '../entities/User.js'
import type { UserData } from '../types/index.js'
import type CredentialService from './credential.service.js'

class UserService {
    constructor(
        private userRepository: Repository<User>,
        private credentialService: CredentialService,
    ) {}

    async create({ firstName, lastName, email, password, role }: UserData) {
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
}

export default UserService
