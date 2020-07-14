import Joi from "joi";
import { IReward, IMerchntReward, IMerchntRewardUpdate, IAirtimeReward } from './IReward';
import { ISurveyReward } from "./ISurveyReward";

export const RewardValidationSchema = Joi.object().keys(<IReward>{
    reward_value: Joi.string(),
    reward_type: Joi.string(),
    reward_quantity: Joi.number(),
});
export const RewardAirtimeValidationSchema = Joi.object().keys(<IAirtimeReward>{
    rewards: Joi.array(),
});
export const MerchntRewardValidationSchema = Joi.object().keys(<IMerchntReward>{
    reward_name: Joi.string(),
    reward_type: Joi.string(),
    reward_quant: Joi.number(),
});
export const MerchntRewardUpdateValidationSchema = Joi.object().keys(<IMerchntRewardUpdate>{
    reward_name: Joi.string(),
    reward_type: Joi.string(),
    reward_quant: Joi.number(),
    reward_point: Joi.number(),
    reward_value: Joi.string(),
});
export const RewardProductValidationSchema = Joi.object().keys(<ISurveyReward>{
    productId: Joi.number(),
});
