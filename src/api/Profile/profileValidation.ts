import Joi from "joi";
import { IProfile } from "./IProfile";

export const ProfileValidationSchema = Joi.object().keys(<IProfile> {
    company_email: Joi.any(),
    company_name: Joi.any(),
    location: Joi.any(),
    profile_picture_url: Joi.any(),
    reg_number: Joi.any(),
});
