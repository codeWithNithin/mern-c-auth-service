import { describe, it, beforeEach, before, after } from 'node:test'
import request from 'supertest'
import app from '../../src/app.js'
import assert from 'node:assert'
import { DataSource } from 'typeorm'
import { AppDataSource } from '../../src/config/data-source.js'
import { User } from '../../src/entities/User.js'
import { Roles } from '../../src/constants'
import { isJwtValid } from '../utils/index.js'
import { RefreshToken } from '../../src/entities/RefreshToken.js'

describe('POST /auth/register', () => {
    let connection: DataSource

    before(async () => {
        connection = await AppDataSource.initialize()
    })

    beforeEach(async () => {
        // Database truncate/reset
        await connection.dropDatabase()
        await connection.synchronize()
    })

    after(async () => {
        await connection.destroy()
    })

    describe('all fields are given', () => {
        it('should return 201 status code', async () => {
            // Arrange
            const userData = {
                firstName: 'Nithin',
                lastName: 'V Kumar',
                email: 'something@something.com',
                password: 'secret-password',
                //  role: Roles.CUSTOMER,
            }

            // Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData)

            // assert
            assert.strictEqual(response.status, 201)
        })

        it('should return a valid json response', async () => {
            // AAA

            // Arrange
            const userData = {
                firstName: 'Nithin',
                lastName: 'V Kumar',
                email: 'something@something.com',
                password: 'secret-password',
                role: Roles.CUSTOMER,
            }

            // Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData)

            // Assert
            // i dont want this content type header to be undefined
            assert.ok(response.headers['content-type'])
            // i want to match this content type to json
            assert.match(response.headers['content-type'], /json/)
        })

        it('should persist the user in the database', async () => {
            // AAA

            // Arrange
            const userData = {
                firstName: 'Nithin',
                lastName: 'V Kumar',
                email: 'something@something.com',
                password: 'secret-password',
                role: Roles.CUSTOMER,
            }

            // Act
            await request(app).post('/auth/register').send(userData)

            // Assert
            const userRepo = connection.getRepository(User)
            const users = await userRepo.find()

            // if teh data already present, then user data is stored...
            assert.strictEqual(users.length, 1)
        })

        it('should assign a customer role', async () => {
            // Arrange
            const userData = {
                firstName: 'Nithin',
                lastName: 'V Kumar',
                email: 'something@something.com',
                password: 'secret-password',
                role: Roles.CUSTOMER,
            }

            // Act
            await request(app).post('/auth/register').send(userData)

            // Assert
            const userRepository = connection.getRepository(User)
            const users = await userRepository.find()

            // check if role is in database
            assert.ok('role' in users[0])
            // check that role should contain customer value
            assert.strictEqual(users[0].role, Roles.CUSTOMER)
        })

        it('should store hashed password in database', async () => {
            // Arrange
            const userData = {
                firstName: 'Nithin',
                lastName: 'V Kumar',
                email: 'something@something.com',
                password: 'secret-password',
                role: Roles.CUSTOMER,
            }

            // Act
            await request(app).post('/auth/register').send(userData)

            // assert
            const userRepository = connection.getRepository(User)
            const users = await userRepository.find({
                select: { password: true },
            })

            // check if the user entered password is not same as password stored in DB
            assert.notStrictEqual(users[0].password, userData.password)
            assert.strictEqual(users[0].password.length, 60)
            assert.match(users[0].password, /^\$2[ab]\$\d+\$/)
        })

        it('should return 400 if email is already present', async () => {
            // Arrange
            const userData = {
                firstName: 'Nithin',
                lastName: 'V Kumar',
                email: 'something@something.com',
                password: 'secret-password',
                role: Roles.CUSTOMER,
            }

            // Act

            const userRepository = connection.getRepository(User)
            await userRepository.save({ ...userData })

            const response = await request(app)
                .post('/auth/register')
                .send(userData)

            const users = await userRepository.find()

            assert.strictEqual(response.status, 400)
            assert.strictEqual(users.length, 1)
        })

        it('should persist refresh token in database', async () => {
            // Arrange
            const userData = {
                firstName: 'Nithin',
                lastName: 'V Kumar',
                email: 'something@something.com',
                password: 'secret-password',
                role: Roles.CUSTOMER,
            }

            // Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData)

            // assert
            const refreshTokenRepo = connection.getRepository(RefreshToken)
            const refreshTokens = await refreshTokenRepo
                .createQueryBuilder('refreshToken')
                .where('refreshToken.userId = :userId', {
                    userId: (response.body as Record<string, string>).id,
                })
                .getMany()

            assert.strictEqual(refreshTokens.length, 1)
        })
    })

    describe('fields missing', () => {
        it('should return status code 400 if email field is empty', async () => {
            // Arrange
            const userData = {
                firstName: 'Nithin',
                lastName: 'V Kumar',
                email: '',
                password: 'secret-password',
                role: Roles.CUSTOMER,
            }

            const response = await request(app)
                .post('/auth/register')
                .send(userData)

            assert.strictEqual(response.statusCode, 400)

            const userRepository = connection.getRepository(User)
            const users = await userRepository.find()

            assert.strictEqual(users.length, 0)
        })

        it('it should return status code 400 if firstName is missing', async () => {
            // ARRANGE
            const userData = {
                firstName: '',
                lastName: 'V Kumar',
                email: 'something@something.com',
                password: 'secret-password',
                role: Roles.CUSTOMER,
            }
            // ACT
            const response = await request(app)
                .post('/auth/register')
                .send(userData)

            // ASSERT
            assert.strictEqual(response.statusCode, 400)

            // Make sure that when bad request err is thrown, no user data should be created in database
            const userRepository = connection.getRepository(User)
            const users = await userRepository.find()

            assert.strictEqual(users.length, 0)
        })

        it('it should return status code 400 if lastName is missing', async () => {
            // ARRANGE
            const userData = {
                firstName: 'Nithin',
                lastName: '',
                email: 'something@something.com',
                password: 'secret-password',
                role: Roles.CUSTOMER,
            }
            // ACT
            const response = await request(app)
                .post('/auth/register')
                .send(userData)

            // ASSERT
            assert.strictEqual(response.statusCode, 400)

            // Make sure that when bad request err is thrown, no user data should be created in database
            const userRepository = connection.getRepository(User)
            const users = await userRepository.find()

            assert.strictEqual(users.length, 0)
        })

        it('it should return status code 400 if password is missing', async () => {
            // ARRANGE
            const userData = {
                firstName: 'Nithin',
                lastName: 'V Kumar',
                email: 'something@something.com',
                password: '',
                role: Roles.CUSTOMER,
            }

            // ACT
            const response = await request(app)
                .post('/auth/register')
                .send(userData)

            // ASSERT
            assert.strictEqual(response.statusCode, 400)

            // Make sure that when bad request err is thrown, no user data should be created in database
            const userRepository = connection.getRepository(User)
            const users = await userRepository.find()

            assert.strictEqual(response.statusCode, 400)
            assert.strictEqual(users.length, 0)
        })
    })

    describe('all fields are not in format', () => {
        it('should trim the email field', async () => {
            // Arrange
            const userData = {
                firstName: 'Nithin',
                lastName: 'V Kumar',
                email: ' something@something.com ',
                password: 'secret-password',
                role: Roles.CUSTOMER,
            }

            // act
            await request(app).post('/auth/register').send(userData)

            // assert
            const userRepository = connection.getRepository(User)
            const users = await userRepository.find()
            assert.strictEqual(users[0].email, 'something@something.com')
        })

        it('should trim the first name field', async () => {
            // Arrange
            const userData = {
                firstName: ' Nithin  ',
                lastName: 'V Kumar',
                email: ' something@something.com ',
                password: 'secret-password',
                role: Roles.CUSTOMER,
            }

            // act
            await request(app).post('/auth/register').send(userData)

            // assert
            const userRepository = connection.getRepository(User)
            const users = await userRepository.find()
            assert.strictEqual(users[0]?.firstName, 'Nithin')
        })

        it('should trim the last name field', async () => {
            // Arrange
            const userData = {
                firstName: 'Nithin',
                lastName: ' V Kumar ',
                email: 'something@something.com',
                password: 'secret-password',
                role: Roles.CUSTOMER,
            }

            // act
            await request(app).post('/auth/register').send(userData)

            // assert
            const userRepository = connection.getRepository(User)
            const users = await userRepository.find()
            assert.strictEqual(users[0]?.lastName, 'V Kumar')
        })

        it('should return 400 status code if password length is less than 8 charecters', async () => {
            // Arrange
            const userData = {
                firstName: 'Nithin',
                lastName: 'V Kumar',
                email: 'something@something.com',
                password: 'secret',
                role: Roles.CUSTOMER,
            }

            // act
            const response = await request(app)
                .post('/auth/register')
                .send(userData)
            assert.strictEqual(response.status, 400)

            // Assert
            const userRepository = connection.getRepository(User)
            const users = await userRepository.find()

            assert.strictEqual(users.length, 0)
        })

        it('should return accessToken and refreshToken inside a cookie', async () => {
            // Arrange
            const userData = {
                firstName: 'Nithin',
                lastName: 'V Kumar',
                email: 'something@something.com',
                password: 'secret-password',
                role: Roles.CUSTOMER,
            }

            // Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData)

            interface Headers {
                'set-cookie': string[]
            }

            // Assert
            let accessToken = ''
            let refreshToken = ''
            const cookies =
                (response.headers as unknown as Headers)['set-cookie'] || []
            // accessToken=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6ImFkbWluIiwiaWF0IjoxNjkzOTA5Mjc2LCJleHAiOjE2OTM5MDkzMzYsImlzcyI6Im1lcm5zcGFjZSJ9.KetQMEzY36vxhO6WKwSR-P_feRU1yI-nJtp6RhCEZQTPlQlmVsNTP7mO-qfCdBr0gszxHi9Jd1mqf-hGhfiK8BRA_Zy2CH9xpPTBud_luqLMvfPiz3gYR24jPjDxfZJscdhE_AIL6Uv2fxCKvLba17X0WbefJSy4rtx3ZyLkbnnbelIqu5J5_7lz4aIkHjt-rb_sBaoQ0l8wE5KzyDNy7mGUf7cI_yR8D8VlO7x9llbhvCHF8ts6YSBRBt_e2Mjg5txtfBaDq5auCTXQ2lmnJtMb75t1nAFu8KwQPrDYmwtGZDkHUcpQhlP7R-y3H99YnrWpXbP8Zr_oO67hWnoCSw; Max-Age=43200; Domain=localhost; Path=/; Expires=Tue, 05 Sep 2023 22:21:16 GMT; HttpOnly; SameSite=Strict
            cookies.forEach((cookie) => {
                if (cookie.startsWith('accessToken=')) {
                    accessToken = cookie.split(';')[0].split('=')[1]
                }

                if (cookie.startsWith('refreshToken=')) {
                    refreshToken = cookie.split(';')[0].split('=')[1]
                }
            })

            // accesstoken and refreshtoken should not be null
            assert.notEqual(accessToken, null)
            assert.notEqual(refreshToken, null)

            // and jwt while converting to original, should be true...
            assert.equal(isJwtValid(accessToken), true)
            assert.equal(isJwtValid(refreshToken), true)
        })
    })
})
