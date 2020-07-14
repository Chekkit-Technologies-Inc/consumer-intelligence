import Joi from "joi";
import { IProduct } from "./IProduct";
import { IProductReport } from "./IProductReport";
import { IProductBatch } from "./IProductBatch";

export const ProductValidationSchema = Joi.object().keys(<IProduct>{
    product_name: Joi.string(),
    producer_name: Joi.string(),
    product_description: Joi.string(),
    product_image: Joi.string(),
    slug: Joi.string(),
    batch_num: Joi.string(),
    expiry_date: Joi.string(),
    id_range: Joi.string(),
    FDA_number: Joi.string(),
    product_category: Joi.string(),
    barcode_num: Joi.string(),
    production_date: Joi.string(),
    surveyId: Joi.number(),
    rewardId: Joi.number(),
    age_range: Joi.string(),
});
export const ProductBatchValidationSchema = Joi.object().keys(<IProductBatch>{
    productId: Joi.number(),
    product_name: Joi.string(),
    producer_name: Joi.string(),
    batch_num: Joi.number(),
    survey_id: Joi.number(),
    FDA_number: Joi.number(),
    reward_id: Joi.number(),
    production_date: Joi.string(),
    expiry_date: Joi.string(),
});
export const ProductReportValidationSchema = Joi.object().keys(<IProductReport>{
    product_name: Joi.string(),
    product_store_address: Joi.string(),
    product_user_exprnce: Joi.string(),
    product_image: Joi.string(),
    slug: Joi.string(),
});
