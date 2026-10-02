import { checkSchema } from 'express-validator'

export default checkSchema({
    email: {
        trim: true,
        notEmpty: {
            errorMessage: 'Email is required',
        },
        isEmail: {
            errorMessage: 'Email should be a valid email',
        },
    },
    firstName: {
        errorMessage: 'First Name is required !!',
        notEmpty: true,
        trim: true,
    },
    lastName: {
        errorMessage: 'Last Name is required !!',
        notEmpty: true,
        trim: true,
    },
    password: {
        trim: true,
        errorMessage: 'Password is missing !!!',
        notEmpty: true,
        isLength: {
            options: { min: 8 },
            errorMessage: 'Password should be at least 8 chars',
        },
    },
})
