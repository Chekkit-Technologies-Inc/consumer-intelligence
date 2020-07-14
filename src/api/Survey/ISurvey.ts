import { IBaseInterface } from "../baseInterface";

export interface ISurvey extends IBaseInterface {
    // type any is used to prevent error on validation level
    survey: any;
    question: any;
}
