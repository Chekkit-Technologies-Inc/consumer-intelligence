import { RewardModel } from ".";
import { AppError } from "../../utils/app-error";
import { UserModel } from "../User";
import { ProductModel } from "../Product";
import { ActivitiesCountModel } from "../User/ActivitiesCountModel";
import { RedemptionModel } from "../Survey/RedemptionModel";
import { SubProductModel } from "../Product/SubProductModel";
import { sendAirtime, sendSMS } from "../../utils/africastalking";
import { SubscriptionModel } from '../Subscription/subscriptionModel';

export class RewardService {
    // private VALUE_NO: number = 0;
    private VALUE_YES: number = 1;
    /**
     * Adds comment to post
     * @param {string} id the post id
     * @param {Object} user the current user
     * @param {Object} commentData the user's comment
     * @returns {string|null} successfully saved
     */
    public createReward = async (userId: number, rewardData: any) => {
        console.log("rewardData", rewardData);
        // const reward_type = JSON.parse(rewardData.reward_type);
        let newrewardData = [];
        for (let index = 0; index < rewardData.rewards.length; index++) {
            let push_data = {
                reward_type: rewardData.rewards[index].reward_type,
                userId,
                reward_quantity: rewardData.rewards[index].reward_quant,
                reward_value: rewardData.rewards[index].reward_value,
            };
            newrewardData.push(push_data);
        }
        const user = await UserModel.findOne({
            where: { id: userId },
        });
        if (user) {
            const reward = await RewardModel.bulkCreate(newrewardData);
            if (reward) {
                let all_count = await ActivitiesCountModel.findOne({ where: { userId: user.id } });
                // // associations have been set
                if (all_count) {
                    const rewards_count: number = all_count.dataValues.rewards_count + rewardData.length;
                    await ActivitiesCountModel.update({ rewards_count }, { where: { userId: user.id } });
                } else {
                    await ActivitiesCountModel.create({ userId: user.id, rewards_count: rewardData.length });

                }
                return reward;
            }
        }
        throw new AppError("Survey not found", null, 401);
    }
    public createMerchntReward = async (userId: number, data: any, photo: any) => {
        data.reward_image = photo.location;
        let push_data = {
            reward_type: data.reward_type,
            userId,
            reward_quantity: data.reward_quant,
            reward_value: data.reward_value,
            point_to_claim_reward: data.reward_point,
            reward_image: data.reward_image,
        };
        console.log("push_data", push_data);
        const user = await UserModel.findOne({
            where: { id: userId },
        });
        if (user) {
            const reward = await RewardModel.create(push_data);
            if (reward) {
                let all_count = await ActivitiesCountModel.findOne({ where: { userId: user.id } });
                // // associations have been set
                if (all_count) {
                    const rewards_count: number = all_count.dataValues.rewards_count + 1;
                    await ActivitiesCountModel.update({ rewards_count }, { where: { userId: user.id } });
                } else {
                    await ActivitiesCountModel.create({ userId: user.id, rewards_count: 1 });

                }
                return reward;
            }
        }
        throw new AppError("Survey not found", null, 401);
    }
    /**
      * getRewards
      */
    public getRewards = async (userId, page: number, per_page: number, sort_by: string, sort_by_field: string) => {
        const order: any = [[sort_by_field, sort_by]];
        const offset: number = this.getOffsetValue(page, per_page);

        const rewards = await RewardModel.findAll({
            where: { userId, is_visible: this.VALUE_YES },
            order,
            offset,
        });

        const rewardsCount = await RewardModel.count({
            where: { userId, is_visible: this.VALUE_YES },
        });

        if (rewards) {
            const metadata = this.buildMetaData(rewards, page, rewardsCount);
            return {
                rewards,
                metadata,
            };
        }
        return null;
    }
    public getAllRewards = async (userId) => {

        const airtime = await RewardModel.findAll({
            where: { userId, is_visible: this.VALUE_YES },
        });

        if (airtime) {
            return airtime;
        }
        throw new AppError("Rewards not found", null, 401);
    }
    public getAllAirtime = async (userId) => {

        const airtime = await RewardModel.findAll({
            where: { userId, is_visible: this.VALUE_YES, reward_type: "Airtime" },
        });

        if (airtime) {
            return airtime;
        }
        throw new AppError("Airtime rewards not found", null, 401);
    }
    public getAllMerchandize = async (userId) => {

        const airtime = await RewardModel.findAll({
            where: { userId, is_visible: this.VALUE_YES, reward_type: "Merchandize" },
        });

        if (airtime) {
            return airtime;
        }
        throw new AppError("Merchandize rewards not found", null, 401);
    }
    public updateProudctReward = async (id: any, user: any, data: any) => {
        let reward = await RewardModel.findOne({ where: { id } });
        if (reward) {
            if (user.id != reward.userId) {
                throw new AppError("You are not allowed to perform that operation.", null, 401);
            }
            const updated = SubProductModel.update({ rewardId: id }, { where: { id: data.productId } });
            if (updated) {
                let batch = await SubProductModel.findOne({ where: { id: data.productId } });
                let product = await ProductModel.findOne({ where: { id: batch.productId } });
                return { batch, product };
            }
            throw new AppError("Could not save your changes.");
        }

        throw new AppError("Reward not found.", null, 401);
    }
    public updateMerchntReward = async (id: any, user: any, data: any) => {
        let reward = await RewardModel.findOne({ where: { id } });
        if (reward) {
            let push_data = {
                reward_type: data.reward_type,
                reward_quantity: data.reward_quant,
                reward_value: data.reward_value,
                point_to_claim_reward: data.reward_point,
            };
            if (user.id != reward.userId) {
                throw new AppError("You are not allowed to perform that operation.", null, 401);
            }
            const updated = RewardModel.update(push_data, { where: { id } });
            if (updated) {
                let mercnt_reward = await RewardModel.findOne({ where: { id } });
                return mercnt_reward;
            }
            throw new AppError("Could not save your changes.");
        }

        throw new AppError("Reward not found.", null, 401);
    }
    public attachReward = async (productId, rewardId: number) => {
        let reward = await RewardModel.findOne({ where: { id: rewardId } });
        if (reward) {
            let product = await ProductModel.findOne({ where: { id: productId } });
            if (product) {
                const updated = await RewardModel.update({ productId }, {
                    where: { id: rewardId },
                });
                if (updated) {
                    return `Reward attached to ${product.product_name}`;
                } else {
                    throw new AppError("You cannot perform this action", null, 403);
                }
            }
        }
        throw new AppError("Could not create Product.");
    }
    /**
      * getSurveyReward
      */
    public getSurveyRewards = async (id: string, page: number, per_page: number, sort_by: string, sort_by_field: string) => {
        const order: any = [[sort_by_field, sort_by]];
        const offset: number = this.getOffsetValue(page, per_page);

        const rewards = await RewardModel.findAll({
            where: { is_visible: this.VALUE_YES, survey_id: id },
            order,
            offset,
        });

        const rewardsCount = await RewardModel.count({
            where: { is_visible: this.VALUE_YES },
        });

        if (rewards) {
            const metadata = this.buildMetaData(rewards, page, rewardsCount);
            return {
                rewards,
                metadata,
            };
        }
        return null;
    }

    /**
  * Deletes single reward of current user
  *
  * @param {Object} user the current user
  * @param {string} id id to look up
  *
  * @returns {(string | null)}
  */
    public deleteReward = async (id: number, survey: any) => {
        let reward = await RewardModel.findOne({ where: { id } });
        if (reward) {
            if (survey.id != reward.survey_id) {
                throw new AppError("You are not allowed to perform that operation.", null, 401);
            } else {
                const softDeleted = await RewardModel.destroy({ where: { id } });
                if (softDeleted) {
                    return "Reward deleted";
                } else {
                    throw new AppError("You cannot perform that action", null, 403);
                }
            }
        }
        throw new AppError("Reward not found.", null, 401);
    }
    public updateReward = async (id: number, user: any, data: any) => {
        let reward = await RewardModel.findOne({ where: { id } });
        if (reward) {
            if (user.id != reward.userId) {
                throw new AppError("You are not allowed to perform that operation.", null, 401);
            }
            return RewardModel.update(data, { where: { id } }).then((rows) => {
                if (rows > 0) {
                    return this.getReward(id, user, true);
                }
                throw new AppError("Could not save your changes.");
            });
        }

        throw new AppError("Reward not found.", null, 401);
    }
    public attachProduct = async (id: number, data: any) => {
        let reward = await RewardModel.findOne({ where: { id } });
        if (reward) {
            return RewardModel.update(data, { where: { id } });
        }
        throw new AppError("Reward not found.", null, 401);
    }
    public redeemPoint = async (user: any, data: any) => {
        let redeem_details = await RedemptionModel.findOne({ where: { id: data.location_id } });
        let reward_details = await RewardModel.findOne({ where: { id: redeem_details.surveyRewardId } });
        if (reward_details) {
            // console.log(reward_details.point_to_claim_reward, "yeah 1", data.point_to_redeem);
            if (Number(user.loyalty_point) >= Number(data.point_to_redeem)) {
                if (Number(reward_details.point_to_claim_reward) === Number(data.point_to_redeem)) {
                    // redeem the point to get airtime or macherdize
                    user.loyalty_point = Number(user.loyalty_point) - Number(data.point_to_redeem);
                    const reward_result = await this.processReward(reward_details, user);
                    if (reward_result) {
                        const update = await UserModel.update({ user }, { where: { id: user.id } });
                        if (update) {
                            return reward_result;
                        }
                    }
                    throw new AppError("error sending reward to the user.", null, 401);
                } else {
                    throw new AppError("the loyalty point to redeem is not enough.", null, 401);
                }
            } else {
                throw new AppError("You don't have sufficient point to redeem.", null, 401);
            }
        }
        throw new AppError("Reward not found.", null, 401);
    }
    public processReward = async (rewardData: any, userData: any) => {
        if (rewardData) {
            if (rewardData.reward_type == "Airtime") {
                let amount = Number(rewardData.reward_value);
                let airtimeData = await sendAirtime([{
                    phoneNumber: "+234" + userData.phone_number, currencyCode: "NGN", amount,
                }]);
                if (airtimeData) {
                    await this.deductAirtimeReward(rewardData.userId, amount);
                    return { status: true, airtimeData, amount, type: "Airtime" };
                } else {
                    return { status: false, data: "Be patient, you will recieve your reward soon!", type: "Airtime" };
                }
            } else if (rewardData.reward_type == "Merchandize") {
                let redemption_points = await this.getAllRedemptionPoints(rewardData.userId);
                let red_details = "";
                if (redemption_points) {
                    redemption_points.forEach((element) => {
                        red_details += `${element.point_location}(${element.point_address}),`;
                    });
                    let smsBody = `Thank you for taking our survey,` +
                        `these are the Redemption points for your reward: ${red_details}`;
                    let send_result = await sendSMS({
                        to: "+234" + userData.phone_number, message: smsBody,
                    });
                    if (send_result) {
                        return {
                            status: true,
                            data: "Thank you for taking our survey,meessage has been sent to your phone number.",
                            type: "Merchandize",
                        };
                    } else {
                        return {
                            status: true,
                            data: "Thank you for taking our survey,meessage has been sent to your phone number.",
                            type: "Merchandize",
                        };
                    }
                }
                return { status: false, data: "No redemption points created by the company." };
            }
        }
    }
    public deductAirtimeReward = async (userId: number, amount: number) => {
        let sub_details = await SubscriptionModel.findOne({ where: { userId } })
        if (sub_details) {
            sub_details.rewards_balance = Number(sub_details.rewards_balance) - amount;
            const update = await SubscriptionModel.update({ sub_details }, { where: { userId } });
            if (update) {
                return true;
            }
            return false;
        }
        throw new AppError("No Subscription found", null, 401);
    }
    // public deductAccountBalance = async (userId: number, amount: number) => {
    //     let sub_details = await SubscriptionModel.findOne({ where: { userId } });
    //     if (sub_details) {
    //         sub_details.account_balance = Number(sub_details.account_balance) - amount;
    //         const update = await SubscriptionModel.update({ sub_details }, { where: { userId } });
    //         if (update) {
    //             return true;
    //         }
    //         return false;
    //     }
    //     throw new AppError("No Subscription found", null, 401);
    // }
    public getAllRedemptionPoints = async (userId: any) => {
        const redemptionPoints = await RedemptionModel.findAll({
            where: { userId, is_visible: this.VALUE_YES },
        });
        if (redemptionPoints) {
            return redemptionPoints;
        }
        throw new AppError("No redemption point found", null, 401);
    }
    /**
       * Gets post details using slug
       * @param {string} slug the post slug
       */
    public getReward = async (id: number, user: any, isUpdateRequest?: boolean) => {
        let reward = await RewardModel.findOne({
            where: { id, is_visible: true },
        });
        if (reward) {
            return reward;
        }
        throw new AppError("reward not found", null, 401);
    }

    /**
 * gets offset value
 * @param page
 * @param limit
 */
    private getOffsetValue(page: number, limit: number) {
        let offset: number = 0;
        if (page == 1) {
            return offset;
        }

        offset = page * limit;
        if (page > 1) {
            offset++;
        }
        return offset;
    }

    /**
     * Build survey(s) metadata
     * @param {Object} surveys the survey results
     * @param {number} page current page
     */
    private buildMetaData(rewards: any, page: number, rewardsCount: number) {
        return {
            query_results: rewards.length,
            page,
            comment:
                rewards.length == 0
                    ? "No Reward to display"
                    : `Showing ${rewards.length} of ${rewardsCount} results`,
        };
    }
    /**
 * Create a new slug (unique url string) for the survey
 * @param {string} str the survey title
 * @return {string} the new slug string
 */
    // private createSlug = async (str: string) => {
    //     let newString = slugify(str, {
    //         remove: /[*+~.()'"!?:@#${}<>,]/g,
    //         lower: true
    //     });
    //     const random = crypto.randomBytes(6).toString("hex");
    //     newString = `${newString}-${random}`;

    //     return newString;
    // };
}
