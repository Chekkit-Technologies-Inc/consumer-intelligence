import { IBaseInterface } from "../baseInterface";

export interface IRedeem extends IBaseInterface {
    // type any is used to prevent error on validation level
    point_location: any;
    point_address: any;
    point_agent_name: any;
    point_agent_phone: any;
    point_agent_code: any;
    reward_redeemed: any;
    survey_rewardId: any;
}
