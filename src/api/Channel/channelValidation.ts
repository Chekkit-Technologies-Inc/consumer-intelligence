import Joi from "joi";
import { IChannel } from "./IChannel";

export const ChannelValidationSchema = Joi.object().keys(<IChannel>{
    code: Joi.string().trim(),
    user_id:Joi.number(),
    survey_id:Joi.number(),
    unique_id:Joi.string(),
});
