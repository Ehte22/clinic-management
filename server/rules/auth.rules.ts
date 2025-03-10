import { validationRulesSchema } from "../utils/validator";

export const registerRules: validationRulesSchema = {
    firstName: { required: true },
    lastName: { required: true },
    email: { required: true, email: true },
    phone: {
        required: true, pattern: /^[6-9]\d{9}$/
    },
    password: { required: true, min: 8, max: 16 },
    role: { required: true },
    profile: { required: false },
    clinicId: { required: true },
}

export const sendOTPRules: validationRulesSchema = {
    username: { required: true, email: true },
}

export const verifyOTPRules: validationRulesSchema = {
    username: { required: true, email: true },
    otp: { required: true }
}

export const signInRules: validationRulesSchema = {
    email: { required: true, email: true },
    password: { required: true }
}

export const forgotPasswordRules: validationRulesSchema = {
    email: { required: true, email: true },
}

export const resetPasswordRules: validationRulesSchema = {
    password: { required: true, min: 8, max: 16 },
    confirmPassword: { required: true },
}