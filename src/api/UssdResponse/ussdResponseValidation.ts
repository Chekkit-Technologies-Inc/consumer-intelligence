import Joi from "joi";

export const USSDresponseValidationSchema = Joi.object().keys({
    phone_number: Joi.string().regex(/^[a-zA-Z0-9._-]{3,16}$/i).required(),
    session_id: Joi.string().required(),
    reward_given: Joi.string().required(),
});

export const SendAlertValidationSchema = Joi.object().keys({
    content: Joi.string().required(),
    send_immediately: Joi.number(),
    should_save: Joi.number()
});
