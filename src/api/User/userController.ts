import { BaseController } from "../baseController";
import { UserService } from "./userService";

/**
 * User controller
 *
 * @export
 * @class UserController
 */
export class UserController extends BaseController {
    private _userService = new UserService();

    public index = () => {
        return this.sendResponse("hello!");
    }

    public getUser = async (username: string) => {
        const user = await this._userService.getUser(username);
        return this.sendResponse(user);
    }
    public getAppUser = async (username: string) => {
        const user = await this._userService.getAppUser(username);
        return this.sendResponse(user);
    }
    /**
     * updates user data
     */
    public updateUser = async (user: any, data: any) => {
        const updated = await this._userService.updateUser(user, data);
        return this.sendResponse(updated);
    }

    /**
     * get surveys by user
     */
    public getSurveysByUser = async (username: string) => {
        const surveys = await this._userService.getSurveysByUser(username);
        return this.sendResponse(surveys);
    }
    /**
     * getChannelsByUSer
     */
    public getChannelsByUSer = async (survey_id: number) => {
        const channels = await this._userService.getChannelsByUser(survey_id);
        return this.sendResponse(channels);
    }

    public getCountsByUSer = async (id: number) => {
        const channels = await this._userService.getCountsByUSer(id);
        return this.sendResponse(channels);
    }
    public getSubByUSer = async (id: number, user: any) => {
        const channels = await this._userService.getSubByUSer(id, user);
        return this.sendResponse(channels);
    }
}
