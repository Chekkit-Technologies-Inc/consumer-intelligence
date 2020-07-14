import { IBaseInterface } from "../baseInterface";

export interface IUser extends IBaseInterface {
    // type any is used to prevent error on validation level
    username: any;
    first_name: any;
    last_name: any;
    email: any;
    password: any;
    phone_number: any;
    gender: any;
    membership_type: any;
    email_verification_code: any;
    company_rep: any;
}
export interface IAppUser extends IBaseInterface {
    // type any is used to prevent error on validation level
    username: any;
    first_name: any;
    last_name: any;
    password: any;
    phone_number: any;
    age_range: any;
    membership_type: any;
    email_verification_code: any;
}
