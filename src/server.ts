import { Config } from './config/env.js'

console.log('Welcome to Auth service')

function welcome(name: string, age: number) {
    console.log(`Hello ${name}, you are ${age} years old`)
}

welcome('nithin', 20)

function test() {
    const obj = {
        name: 'John',
        age: 30,
        city: 'New York',
    }
    console.log(obj.age)
}

test()

console.log(Config.port)
