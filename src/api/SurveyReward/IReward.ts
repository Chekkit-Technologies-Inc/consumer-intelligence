import { IBaseInterface } from "../baseInterface";

export interface IReward extends IBaseInterface {
    // type any is used to prevent error on validation level
    reward_value: any;
    reward_type: any;
    reward_quantity: any;
}
export interface IAirtimeReward extends IBaseInterface {
    rewards: any;
}
export interface IMerchntReward extends IBaseInterface {
    // type any is used to prevent error on validation level
    reward_name: any;
    reward_type: any;
    reward_quant: any;
}
export interface IMerchntRewardUpdate extends IBaseInterface {
    // type any is used to prevent error on validation level
    reward_name: any;
    reward_type: any;
    reward_quant: any;
    reward_point: any;
    reward_value: any;
}
