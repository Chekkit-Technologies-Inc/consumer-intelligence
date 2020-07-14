import { IBaseInterface } from "../baseInterface";

export interface  ILoyaltyPoints extends IBaseInterface {
    // type any is used to prevent error on validation level
    loyalty_name: any;
    slug: any;
    scan_point_to_allocate: any;
    loyalty_reward: any;
    loyalty_reward_value: any;
    loyalty_point_convert: any;
}
