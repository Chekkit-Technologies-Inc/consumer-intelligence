// import { IPost } from ".";
import { BaseController } from "../baseController";
import { RewardService } from "./RewardService";

/**
 * Post controller
 *
 * @export
 * @class CommentController
 */
export class RewardController extends BaseController {

    private _rewardService = new RewardService();
    /**
        * createReward
        */
    public createReward = async (userId: number, data: any) => {
        const reward = await this._rewardService.createReward(userId, data);
        return this.sendResponse(reward);
    }
    public createMerchntReward = async (userId: number, data: any, photo: any) => {
        const reward = await this._rewardService.createMerchntReward(userId, data, photo);
        return this.sendResponse(reward);
    }
    public index = async (survey_id: number, page: number = 1, per_page: number = 15,
        sort_by: string = "DESC", sort_by_field: string = "updated_at") => {
        const rewards = await this._rewardService.getRewards(survey_id, page, per_page, sort_by, sort_by_field);
        return this.sendResponse(rewards);
    }
    public getSurveyRewards = async (id: string, page: number = 1, per_page: number = 15, sort_by: string = "DESC", sort_by_field: string = "updated_at") => {
        const survey_rewards = await this._rewardService.getSurveyRewards(id, page, per_page, sort_by, sort_by_field);
        return this.sendResponse(survey_rewards);
    }
    public getAllRewards = async (userId: number) => {
        const all_rewards = await this._rewardService.getAllRewards(userId);
        return this.sendResponse(all_rewards);
    }
    public getAllAirtime = async (userId: number) => {
        const airtime_rewards = await this._rewardService.getAllAirtime(userId);
        return this.sendResponse(airtime_rewards);
    }
    public getAllMerchandize = async (userId: number) => {
        const merchandize_rewards = await this._rewardService.getAllMerchandize(userId);
        return this.sendResponse(merchandize_rewards);
    }
    /**
  * atatchReward
  */
    public attachReward = async (productId: number, rewardId: number) => {
        const generatePin = await this._rewardService.attachReward(productId, rewardId);
        return this.sendResponse(generatePin);
    }
    /**
        * deleteReward
        */
    public deleteReward = async (id: any, survey: any) => {
        const deleted = await this._rewardService.deleteReward(id, survey);
        return this.sendResponse(deleted);
    }
    /**
       * updateReward
       */
    public updateReward = async (id: any, user: any, data: any) => {
        const update = await this._rewardService.updateReward(id, user, data);
        return this.sendResponse(update);
    }
    public redeemPoint = async (user: any, data: any) => {
        const redeemPoint = await this._rewardService.redeemPoint(user, data);
        return this.sendResponse(redeemPoint);
    }
    public updateProudctReward = async (id: any, user: any, data: any) => {
        const update = await this._rewardService.updateProudctReward(id, user, data);
        return this.sendResponse(update);
    }
    public updateMerchntReward = async (id: any, user: any, data: any) => {
        const update = await this._rewardService.updateMerchntReward(id, user, data);
        return this.sendResponse(update);
    }
}
