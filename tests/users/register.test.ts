import { describe, it } from 'node:test'
import request from 'supertest'
import app from '../../src/app'
import assert from 'node:assert'

describe('POST /auth/register', () => {
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
    })

    describe('fields missing', () => {})
})
