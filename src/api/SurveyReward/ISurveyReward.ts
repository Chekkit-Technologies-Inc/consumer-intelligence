import { IBaseInterface } from "../baseInterface";

export interface ISurveyReward extends IBaseInterface {
    // type any is used to prevent error on validation level
    productId: any;
}
