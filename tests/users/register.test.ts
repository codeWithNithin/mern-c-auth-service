import { describe, it, beforeEach, before, after } from 'node:test'
import request from 'supertest'
import app from '../../src/app'
import assert from 'node:assert'
import { DataSource } from 'typeorm'
import { AppDataSource } from '../../src/config/data-source'
import { User } from '../../src/entities/User'
import { Roles } from '../../src/constants'

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
    })
})
