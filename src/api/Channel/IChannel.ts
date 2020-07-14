import { IBaseInterface } from "../baseInterface";

export interface IChannel extends IBaseInterface {
    // type any is used to prevent error on validation level
    code: any;
    user_id: any;
    survey_id:any;
    unique_id:any;
}
