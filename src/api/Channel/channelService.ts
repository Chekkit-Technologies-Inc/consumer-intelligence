import { SurveyModel } from "../Survey";
import { ChannelModel, IChannel } from ".";
import { AppError } from "../../utils/app-error";
import { UserModel, ActivitiesCountModel } from "../User";

export class ChannelService {
    // private VALUE_NO: number = 0;
    private VALUE_YES: number = 1;
    /**
     * Adds comment to post
     * @param {string} id the post id
     * @param {Object} user the current user
     * @param {Object} commentData the user's comment
     * @returns {string|null} successfully saved
     */
    public createChannel = async (survey_id: number, user, channelData: IChannel) => {

        const survey = await SurveyModel.findOne({
            where: { id: survey_id },
        });
        if (survey) {
            const user = await UserModel.findOne({
                where: { id: survey.userId },
            });
            channelData.surveyId = survey_id;
            channelData.code = '223*' + user.unique_code + '*' + survey.userId;
            const check_code = await ChannelModel.findOne({
                where: { code: channelData.code },
            });
            if (check_code) {
                throw new AppError("This survey has channel already.", null, 401);
            }
            const channel = await ChannelModel.create(channelData);
            if (channel) {
                let all_count = await ActivitiesCountModel.findOne({ where: { userId: user.id } });
                // // associations have been set
                if (all_count) {
                    const channels_count: number = all_count.dataValues.channels_count + 1;
                    await ActivitiesCountModel.update({ channels_count }, { where: { userId: user.id } });
                }
                else {
                    await ActivitiesCountModel.create({ userId: user.id, channels_count: 1 });
                    
                }
            }
            return ChannelModel.findByPk(channel.id);
        }
        else {
            throw new AppError("Survey not found", null, 401);
        }

    }
    /**
      * getChannels
      */
    public getChannels = async (page: number, per_page: number, sort_by: string, sort_by_field: string) => {
        const order: any = [[sort_by_field, sort_by]];
        const offset: number = this.getOffsetValue(page, per_page);

        const channels = await ChannelModel.findAll({
            where: { is_visible: this.VALUE_YES },
            order,
            offset
        });

        const channelsCount = await ChannelModel.count({
            where: { is_visible: this.VALUE_YES }
        });

        if (channels) {
            const metadata = this.buildMetaData(channels, page, channelsCount);
            return {
                channels,
                metadata
            };
        }
        return null;
    };
    /**
      * getSurveyChannel
      */
    public getSurveyChannels = async (id: number, page: number, per_page: number, sort_by: string, sort_by_field: string) => {
        const order: any = [[sort_by_field, sort_by]];
        const offset: number = this.getOffsetValue(page, per_page);

        const channels = await ChannelModel.findAll({
            where: { is_visible: this.VALUE_YES, survey_id: id },
            order,
            offset
        });

        const channelsCount = await ChannelModel.count({
            where: { is_visible: this.VALUE_YES }
        });

        if (channels) {
            const metadata = this.buildMetaData(channels, page, channelsCount);
            return {
                channels,
                metadata
            };
        }
        return null;
    };

    /**
  * Deletes single channel of current user
  *
  * @param {Object} user the current user
  * @param {string} id id to look up
  *
  * @returns {(string | null)}
  */
    public deleteChannel = async (id: number, survey: any) => {
        let channel = await ChannelModel.findOne({ where: { id } });
        if (channel) {
            if (survey.id != channel.survey_id) {
                throw new AppError("You are not allowed to perform that operation.", null, 401);
            }
            else {
                const softDeleted = await ChannelModel.destroy({ where: { id } });
                if (softDeleted) {
                    return "Channel deleted";
                } else {
                    throw new AppError("You cannot perform that action", null, 403);
                }
            }
        }
        throw new AppError("Channel not found.", null, 401);
    }

    /**
       * Gets post details using slug
       * @param {string} slug the post slug
       */
    public getChannel = async (id: number, user: any, isUpdateRequest?: boolean) => {
        let post = await ChannelModel.findOne({
            where: { id, is_visible: true }
        });
        if (post) {
            return post;
        }
        throw new AppError("Post not found", null, 401);
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
    private buildMetaData(channels: any, page: number, channelsCount: number) {
        return {
            query_results: channels.length,
            page,
            comment:
                channels.length == 0
                    ? "No Channel to display"
                    : `Showing ${channels.length} of ${channelsCount} results`
        };
    }
}