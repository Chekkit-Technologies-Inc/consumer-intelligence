// import { IPost } from ".";
import { BaseController } from "../baseController";
import { ChannelService } from "./channelService";

/**
 * Post controller
 *
 * @export
 * @class CommentController
 */
export class ChannelController extends BaseController {

    private _channelService = new ChannelService();
    /**
        * createChannel
        */
    public createChannel = async (survey_id: number, user, data: any) => {
        const comment = await this._channelService.createChannel(survey_id, user, data);
        return this.sendResponse(comment);
    }
    public index = async (page: number = 1, per_page: number = 15, sort_by: string = "DESC", sort_by_field: string = "updated_at") => {
        const channels = await this._channelService.getChannels(page, per_page, sort_by, sort_by_field);
        return this.sendResponse(channels);
    }
    public getSurveyChannels = async (id: number, page: number = 1, per_page: number = 15, sort_by: string = "DESC", sort_by_field: string = "updated_at") => {
        const survey_channels = await this._channelService.getSurveyChannels(id, page, per_page, sort_by, sort_by_field);
        return this.sendResponse(survey_channels);
    }
    /**
        * deleteChannel
        */
    public deleteChannel = async (id: any, survey: any) => {
        const deleted = await this._channelService.deleteChannel(id, survey);
        return this.sendResponse(deleted);
    }
}
