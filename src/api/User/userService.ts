import bcryptjs from "bcryptjs";
import { UserModel } from "./userModel";
import { AppError } from "../../utils/app-error";
import { SurveyModel } from "../Survey";
import { ChannelModel } from "../Channel";
import { ActivitiesCountModel } from "../User";
// import { surveyQuestResponseModel, SurveyQuestModel } from "../SurveyQuestion";
import { ProfileModel } from "../Profile/profileModel";
import { SubscriptionModel } from "../Subscription/subscriptionModel";
import { ResourcesModel } from "../Subscription/cipayresourcesModel";
import { ScanHistoryModel } from "../Product/ScanHistoryModel";
import { ProductModel } from "../Product/ProductModel";
import { Op } from "sequelize";
export class UserService {
    // private VALUE_YES: number = 1;
    /**
     * Fetches and returns a single user resource
     * @public
     * @param {string} username - the username to lookup
     * @returns {(Object|null)} user - the user resource | null
     */
    public getUser = async (username: string) => {
        const user = await UserModel.findOne({
            where: { username },
            attributes: {
                exclude: [
                    "password", "email_verification_code", "auth_key",
                ],
            },
            include: [
                {
                    model: ProfileModel,
                    attributes: {
                        exclude: [
                            "updated_at",
                            "deleted_at",
                            "userId",
                        ],
                    },
                },
            ],
        });

        if (user) {
            return user;
        }
        throw new AppError(`User '${username}' not found.`, null, 401);
    }
    public getAppUser = async (phone_number: string) => {
        const user = await UserModel.findOne({
            where: { phone_number },
            attributes: {
                exclude: [
                    "password", "email_verification_code", "auth_key",
                ],
            },
            include: [
                {
                    model: ProfileModel,
                    attributes: {
                        exclude: [
                            "updated_at",
                            "deleted_at",
                            "userId",
                        ],
                    },
                },
            ],
        });

        if (user) {
            return user;
        }
        throw new AppError(`User '${phone_number}' not found.`, null, 401);
    }

    /**
     * Updates a user resource
     * @public
     * @param {Object} user the current user
     * @param {Object} data the data to be updated
     * @returns {(Object|null)} the updated user resource
     */
    public updateUser = async (user: any, data: any) => {
        const username = user.username;
        if (data.username) {
            throw new AppError("Cannot edit username");
        }

        if (data.password) {
            data.password = bcryptjs.hashSync(data.password, 10);
        }

        const updated = await UserModel.update(data, { where: { username } });
        if (updated) {
            return await this.getUser(username);
        }
        throw new AppError("Could not update user data");
    }

    /**
     * Get a single user's survey
     */
    public getSurveysByUser = async (username: string) => {
        const user = await UserModel.findOne({
            where: { username },
        });
        if (!user) {
            throw new AppError(`User '${username}' not found.`, null, 401);
        }
        const surveys = await SurveyModel.findAll({
            where: {
                userId: user.id,
                is_visible: true,
            },
            order: ["created_at"],
        });
        if (surveys == "") {
            throw new AppError(`User '${username}' has not created any survey.`);
        }
        return surveys;
    }
    /**
     * getChannelsByUser
     */
    public getChannelsByUser = async (surveyId: number) => {
        const survey = await SurveyModel.findOne({
            where: { id: surveyId },
        });
        if (!survey) {
            throw new AppError(`Survey with id '${surveyId}' not found.`, null, 401);
        }
        const channels = await ChannelModel.findAll({
            where: {
                surveyId,
            },
            order: [["created_at", "deleted_at"]],
        });
        if (channels == "") {
            throw new AppError(`Survey Id '${surveyId}' has no channel.`);
        }

        return channels;
    }
    public getCountsByUSer = async (id: number) => {
        let all_counts = await ActivitiesCountModel.findOne({
            where: { userId: id },
        });
        if (all_counts) {
            return all_counts;
        } else {
            throw new AppError(`You don't have record to count.`);
        }
    }
    public getSubByUSer = async (id: number, user) => {
        let all_counts = await SubscriptionModel.findOne({
            where: { userId: id },
        });
        if (!all_counts) {
            const subscription = await SubscriptionModel.create();
            await user.setSubscription(subscription);
            all_counts = await SubscriptionModel.findOne({
                where: { userId: id },
            });
        }
        let resources = await ResourcesModel.findOne();
        let all_id = [];
        let user_product = await ProductModel.findAll({
            where: { userId: id },
            attributes: {
                include: [
                    "id",
                ],
            },
        });
        if (user_product) {
            user_product.forEach((element) => {
                all_id.push(element.id);
            });

            const scan_hist = await ScanHistoryModel.count({
                where: {
                    productId: {
                        [Op.in]: all_id,
                    },
                },
                group: ["scan_channel"],
            });
            let mobile;
            let ussd;
            let user_sub;
            if (scan_hist) {
                console.log("ok>>>>>>");
                scan_hist.forEach((element) => {
                    if (element.scan_channel == "mobile") {
                        mobile = Number(element.count);
                    } else {
                        ussd = Number(element.count);
                    }
                });
                if (resources) {
                    user_sub = (mobile * resources.qr_cost + ussd * resources.ussd_cost) || 0;
                } else {
                    user_sub = 0;
                }

            } else {
                user_sub = 0;
            }
            if (user_sub) {
                return { all_counts, user_sub };
            } else {
                return { all_counts, user_sub: 0 };
                console.log("else");
            }
        }
        throw new AppError(`You don't have record to count.`);
    }
}
