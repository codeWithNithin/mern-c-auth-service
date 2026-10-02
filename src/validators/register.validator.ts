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
})
