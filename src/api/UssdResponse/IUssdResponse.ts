import { IBaseInterface } from "../baseInterface";

export interface IUssd extends IBaseInterface {
    // type any is used to prevent error on validation level
    phone_number: any;
    session_id: any;
    reward_given: any;
}
