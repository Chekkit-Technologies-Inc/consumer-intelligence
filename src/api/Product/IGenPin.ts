import { IBaseInterface } from "../baseInterface";

export interface IGenPin extends IBaseInterface {
    // type any is used to prevent error on validation level
    pin_value: any;
    pin_type: any;
    pin_status: any;
    productId: any;
}
