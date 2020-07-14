import Joi from "joi";
import { ISurveyQuest } from "./ISurveyQuest";

export const SurveyQuestValidationSchema = Joi.object().keys(<ISurveyQuest> {
    content: Joi.string(),
    isVisible: Joi.number(),
    slug: Joi.string(),
    choices: Joi.string().trim(),
    response: Joi.number(),
});
