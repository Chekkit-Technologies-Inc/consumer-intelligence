import Joi from "joi";
import { ISurvey } from "./ISurvey";
import { IRedeem } from "./IRedeem";
import { ISurveyProduct } from "./ISurveyProduct";
import { ILoyaltyPoints } from "./ILoyaltyPoints";
import { IRaffleDraw } from "./IRaffleDraw";

export const SurveyValidationSchema = Joi.object().keys(<ISurvey> {
    survey: Joi.object(),
    question: Joi.array(),
});
export const RedeemValidationSchema = Joi.object().keys(<IRedeem> {
    point_address: Joi.string(),
    point_agent_code: Joi.string(),
    point_agent_name: Joi.string(),
    point_location: Joi.string(),
    survey_rewardId: Joi.number(),
    reward_redeemed: Joi.number(),
});
export const SurveyProductValidationSchema = Joi.object().keys(<ISurveyProduct> {
    productId: Joi.number(),
});
export const LoyaltyPointsValidationSchema = Joi.object().keys(<ILoyaltyPoints> {
    loyalty_name: Joi.string(),
    slug: Joi.string(),
    loyalty_point_convert: Joi.number(),
    loyalty_reward: Joi.string(),
    loyalty_reward_value: Joi.number(),
    scan_point_to_allocate: Joi.number(),
});

export const RaffleDrawValidationSchema = Joi.object().keys(<IRaffleDraw> {
    reward_value: Joi.string(),
    reward_type: Joi.string(),
    reward_quantity: Joi.number(),
    gifts: Joi.array(),
});
