import Joi from "joi";

export const LoginValidationSchema = Joi.object().keys({
    username: Joi.string().required(),
    password: Joi.string().required(),
});
export const AppLoginValidationSchema = Joi.object().keys({
    username: Joi.string().required(),
    password: Joi.string().required(),
});
export const SignupValidationSchema = Joi.object().keys({
    first_name: Joi.string(),
    last_name: Joi.string(),
    username: Joi.string().regex(/^[a-zA-Z0-9._-]{3,16}$/i).required(),
    password: Joi.string().min(6).max(32).required(),
    email: Joi.string().email().required(),
    phone_number: Joi.number(),
    gender: Joi.string(),
    membership_type: Joi.string(),
    company_rep: Joi.string(),
});
export const AppSignupValidationSchema = Joi.object().keys({
    first_name: Joi.string(),
    last_name: Joi.string(),
    username: Joi.string(),
    password: Joi.string().min(6).max(32).required(),
    email: Joi.string().email().required(),
    phone_number: Joi.number(),
    age_range: Joi.string(),
    membership_type: Joi.string(),
});
export const RefreshTokensValidationSchema = Joi.object().keys({
    refreshToken: Joi.string()
        .uuid()
        .required(),
});
