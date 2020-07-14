import { IBaseInterface } from "../baseInterface";

export interface IProductBatch extends IBaseInterface {
    // type any is used to prevent error on validation level
    productId: any;
    product_name: any;
    producer_name: any;
    batch_num: any;
    production_date: any;
    FDA_number: any;
    expiry_date: any;
    survey_id: any;
    reward_id: any;
}
