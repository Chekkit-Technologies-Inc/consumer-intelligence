import { IBaseInterface } from "../baseInterface";

export interface ISurveyProduct extends IBaseInterface {
    // type any is used to prevent error on validation level
    productId: any;
}
