import { IBaseInterface } from "../baseInterface";
export interface IProductReport extends IBaseInterface {
    // type any is used to prevent error on validation level
    product_name: any;
    slug: any;
    product_store_address: any;
    product_user_exprnce: any;
    product_image: any;
}
