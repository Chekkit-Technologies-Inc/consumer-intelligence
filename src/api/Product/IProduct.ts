import { IBaseInterface } from "../baseInterface";

export interface IProduct extends IBaseInterface {
    // type any is used to prevent error on validation level
    product_name: any;
    producer_name: any;
    slug: any;
    product_description: any;
    product_image: any;
    batch_num: any;
    FDA_number: any;
    expiry_date: any;
    id_range: any;
    product_category: any;
    barcode_num: any;
    production_date: any;
    surveyId: any;
    rewardId: any;
    age_range: any;
}
