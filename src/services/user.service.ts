import type { Repository } from 'typeorm'
import type { User } from '../entities/User.js'
import type { UserData } from '../types/index.js'

class UserService {
    constructor(private userRepository: Repository<User>) {}

    async create({ firstName, lastName, email, password, role }: UserData) {
        return await this.userRepository.save({
            firstName,
            lastName,
            email,
            password,
            role,
        })
    }
}

export default UserService
