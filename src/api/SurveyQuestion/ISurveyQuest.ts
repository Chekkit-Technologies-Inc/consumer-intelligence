import { IBaseInterface } from "../baseInterface";

export interface ISurveyQuest extends IBaseInterface {
    // type any is used to prevent error on validation level
    content: any;
    isVisible: any;
    slug: any;
    response:any;
    choices:any;
}
