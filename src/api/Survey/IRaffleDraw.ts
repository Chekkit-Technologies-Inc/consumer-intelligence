import { IBaseInterface } from "../baseInterface";

export interface  IRaffleDraw extends IBaseInterface {
    // type any is used to prevent error on validation level
    reward_value: any;
    reward_type: any;
    reward_quantity: any;
    gifts: any;
}
