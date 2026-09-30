import request from 'supertest'
import { calculateDiscount } from './src/utils.js'
import app from './src/app.js'
import { describe, it } from 'node:test'
import assert from 'node:assert'

describe('app test', () => {
    describe('app test', () => {
        it('should return discount amount', () => {
            const discount = calculateDiscount(100, 10)
            assert.strictEqual(discount, 10)
        })

        it('should return status code 200', async () => {
            const response = await request(app).get('/')
            assert.strictEqual(response.statusCode, 200)
        })
    })
})
