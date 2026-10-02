import bcrypt from 'bcryptjs'

class CredentialService {
    async createHashPassword(userPassword: string) {
        return await bcrypt.hash(userPassword, 10)
    }

    async comparePassword(userPassword: string, hashedPassword: string) {
        return await bcrypt.compare(userPassword, hashedPassword)
    }
}

export default CredentialService
