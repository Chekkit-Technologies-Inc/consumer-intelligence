import crypto from "crypto";
import slugify from "slugify";
import { SurveyModel, ISurvey } from ".";
import { AppError } from "../../utils/app-error";
import { ActivitiesCountModel } from "../User";
import { ProductModel } from "../Product";
import { surveyQuestService } from "../SurveyQuestion";
import { RedemptionModel } from "./RedemptionModel";
import { SubProductModel } from "../Product/SubProductModel";
import { ILoyaltyPoints } from "./ILoyaltyPoints";
import { LoyaltyPointsModel } from "./LoyaltyPointsModel";
import { BaseController } from "../baseController";
import { RewardModel } from "../SurveyReward";
import { RaffleGiftModel } from "./RaffleGiftModel";
import { RaffleEntryModel } from "./RaffleEntryModel";
import { RaffleWinnerModel } from "./RaffleWinnerModel";
import { DB } from "../../shared/database";
import { ONESIGNAL_APPID, ONESIGNAL_APIKEY } from "../../config";
// import {MessageService } from "../Message/messageService";
import { MessageModel } from "../Message/messageModel";
const OneSignal = require('onesignal-node');    
const client = new OneSignal.Client(ONESIGNAL_APPID, ONESIGNAL_APIKEY);
import { UserModel } from "../User";


export class SurveyService extends BaseController {
  // private VALUE_NO: number = 0;
  private VALUE_YES: number = 1;
  private _surveyQuestService = new surveyQuestService();
  // private _messageService = new MessageService();
  /**
   * Create new survey content
   * @param {Object} data.surveyData
   * @param {string} data.surveyData.title the survey title
   * @param {string} data.surveyData.content the survey content
   * @param {number} data.surveyData.authorId the survey author id
   *
   * @returns {[Promise<any> | null]} saved survey data
   */
  // public createPost = async (user: any, data: IPost) => {
  // public createPoll = async (user: IUserModel, data: any) => {
  public createSurvey = async (user: any, data: ISurvey) => {
    // console.log(MessageService)
    data.survey.slug = await this.createSlug(data.survey.title);
    const saved = await SurveyModel.create(data.survey);
    if (saved && user.addSurvey(saved)) {
      this._surveyQuestService.createSurveyQuestion(saved.id, user, data.question);
      let all_count = await ActivitiesCountModel.findOne({ where: { userId: user.id } });
      // // associations have been set
      if (all_count) {
        const surveys_count: number = all_count.dataValues.surveys_count + 1;
        await ActivitiesCountModel.update({ surveys_count }, { where: { userId: user.id } });
      } else {
        await ActivitiesCountModel.create({ userId: user.id, surveys_count: 1 });
      }
      return saved;
    }
    throw new AppError("Could not create Survey.");
  }
  public createLoyaltyPoint = async (user: any, data: ILoyaltyPoints) => {
    data.slug = await this.createSlug(data.loyalty_name);
    data.userId = user.id;
    const saved = await LoyaltyPointsModel.create(data);
    if (saved) {
      let all_count = await ActivitiesCountModel.findOne({ where: { userId: user.id } });
      // // associations have been set
      if (all_count) {
        const loyalty_count: number = all_count.dataValues.loyalty_count + 1;
        await ActivitiesCountModel.update({ loyalty_count }, { where: { userId: user.id } });
      } else {
        await ActivitiesCountModel.create({ userId: user.id, loyalty_count: 1 });
      }
      return saved;
    }
    throw new AppError("Could not create loyalty point.");
  }
  createRaffleDraw = async (user: any, data) => {
    // console.log(data);
    // return;
    data.slug = await this.createSlug(data.reward_value);
    data.userId = user.id;
    const saved = await RewardModel.create(data);
    console.log('saved')
    console.log(saved.id)
    if (saved) {
        if(data.gifts && data.gifts.length > 0){
          data.gifts.forEach(gift => {
            let data = {
              name : gift.name,
              photo: gift.photo,
              survey_reward_id : saved.id
            }
            RaffleGiftModel.create(data);
          });
        }
      // let all_count = await ActivitiesCountModel.findOne({ where: { userId: user.id } });
      // // // associations have been set
      // if (all_count) {
      //   const loyalty_count: number = all_count.dataValues.loyalty_count + 1;
      //   await ActivitiesCountModel.update({ loyalty_count }, { where: { userId: user.id } });
      // } else {
      //   await ActivitiesCountModel.create({ userId: user.id, loyalty_count: 1 });
      // }
      return saved;
    }
    throw new AppError("Could not create loyalty point.");
  }
  /**
   * Deletes single survey of current user
   *
   * @param {Object} data
   * @param {Object} data.user the current user
   * @param {number} data.surveyId the survey to be deleted
   *
   * @returns {[String | null]}
   */
  public deleteSurvey = async (data: any) => {
    let survey = await SurveyModel.findOne({ where: { id: data.surveyId } });
    let user = data.user;

    if (survey) {
      const canDelete = (await user.hasSurvey(survey));
      if (canDelete) {
        const softDeleted = await SurveyModel.destroy({
          where: { id: data.surveyId },
        });
        if (softDeleted) {
          return "Survey deleted";
        } else {
          throw new AppError("You cannot perform that action", null, 403);
        }
      } else {
        return "You cannot perform that action";
      }
    }
    throw new AppError("Survey not found", null, 403);
  }
  public updateLoyaltyPoint = async (slug: any, user: any, data: ILoyaltyPoints) => {
    let loyalty_point = await LoyaltyPointsModel.findOne({ where: { slug } });
    if (loyalty_point && user.hasLoyaltyPoint(loyalty_point)) {
      if (user.id != loyalty_point.userId) {
        throw new AppError("You are not allowed to perform that operation.", null, 401);
      }
      const updated = await LoyaltyPointsModel.update(data, { where: { slug } });
      if (updated) {
        return updated;
      }
      throw new AppError("Could not save your changes.");
    }

    throw new AppError("Loyalty point not found.", null, 401);
  }
  public updateSurvey = async (slug: any, user: any, data: ISurvey) => {

    let survey = await SurveyModel.findOne({ where: { slug } });
    if (survey && user.hasSurvey(survey)) {
      if (user.id != survey.userId) {
        throw new AppError("You are not allowed to perform that operation.", null, 401);
      }
      return SurveyModel.update(data.survey, { where: { slug } }).then((rows) => {
        if (rows > 0) {
          this._surveyQuestService.updateSurveyQuestion(survey.id, user, data.question);
          return this.getSurvey(slug);
        }
        throw new AppError("Could not save your changes.");
      });
    }

    throw new AppError("Survey not found.", null, 401);
  }
  public updateSurveyActiveStatus = async (slug: any, user: any, data: ISurvey) => {
    // firstly set active as inactive
    let op = { active_survey: 0};
    SurveyModel.update(op, { where: { active_survey:'1' } });

    console.log(data);
    let survey = await SurveyModel.findOne({ where: { slug } });
    // let activeSurvey = await SurveyModel.findOne({ where: { active_survey:1 } });
    // console.log(activeSurvey)
    if (survey && user.hasSurvey(survey)) {
      if (user.id != survey.userId) {
        throw new AppError("You are not allowed to perform that operation.", null, 401);
      }

      return SurveyModel.update(data, { where: { slug } }).then((rows) => {
        if (rows > 0) {
          return this.getSurvey(slug);
        }
        throw new AppError("Could not save your changes.");
      });
    }

    throw new AppError("Survey not found.", null, 401);
  }
  public updateProudctSurvey = async (id: any, user: any, data: any) => {
    let survey = await SurveyModel.findOne({ where: { id } });
    if (survey && user.hasSurvey(survey)) {
      if (user.id != survey.userId) {
        throw new AppError("You are not allowed to perform that operation.", null, 401);
      }
      const updated = await SubProductModel.update({ surveyId: id }, { where: { id: data.productId } });
      console.log(updated)
      if (updated) {
        let sub_product = await SubProductModel.findOne({ where: { id: data.productId } });
        survey.productId = sub_product.productId;
        await SurveyModel.update({ productId: sub_product.productId }, { where: { slug: survey.slug } });
        return updated;
      }
      throw new AppError("Could not save your changes.");
    }

    throw new AppError("Reward not found.", null, 401);
  }
  public updateProductSurvey = async (id: any, user: any, data: any) => {
    let survey = await SurveyModel.findOne({ where: { id } });
    if (survey && user.hasSurvey(survey)) {
      if (user.id != survey.userId) {
        throw new AppError("You are not allowed to perform that operation.", null, 401);
      }
      const updated = await SurveyModel.update({ productId: data.productId }, { where: { slug: survey.slug } });
      return updated;

      // const updated = await SubProductModel.update({ surveyId: id }, { where: { id: data.productId } });
      // console.log(updated)
      // if (updated) {
      //   let sub_product = await SubProductModel.findOne({ where: { id: data.productId } });
      //   survey.productId = sub_product.productId;
      //   await SurveyModel.update({ productId: sub_product.productId }, { where: { slug: survey.slug } });
      //   return updated;
      // }
      throw new AppError("Could not save your changes.");
    }

    throw new AppError("Reward not found.", null, 401);
  }


  /**
   * Gets survey details using slug
   * @param {string} slug the survey slug
   */
  public getSurvey = async (slug: string) => {
    let survey = await SurveyModel.findOne({
      where: { slug, is_visible: this.VALUE_YES },
    });
    if (survey) {
      const updated = await this.viewSurvey(survey);
      return updated;
    }
    return "Survey not found";
  }

  /**
   * Get multiple surveys
   * @param {number} page current page number
   * @param {number} per_page number of results per page
   * @param {string} sort_by order to be used when sorting
   * @param {string} sort_by_field field to be used with `sort_by`
   */
  public getSurveys = async (userId: any, page: number, per_page: number = 15, sort_by: string, sort_by_field: string,
    ) => {
      const order: any = [[sort_by_field, sort_by]];
      const offset: number = this.getOffsetValue(page, per_page);
      const surveys = await SurveyModel.findAll({
        where: { userId, is_visible: this.VALUE_YES },
        order,
        offset,
        include: [
          {
            model: ProductModel,
            attributes: {
              exclude: [
                "slug",
                "product_description",
                "product_image",
                "is_visible",
                "created_at",
                "updated_at",
                "deleted_at",
                "userId"],
            },
          },
        ],
      });
      const surveysCount = await SurveyModel.count({
        where: { userId, is_visible: this.VALUE_YES },
      });
  
      if (surveys) {
        const metadata = this.buildMetaData(surveys, page, surveysCount);
        return {
          surveys,
          metadata,
        };
      }
      throw new AppError("No Survey found", null, 401);
    }

  public getSurveysByType = async (userId: any,type:any, page: number, per_page: number = 15, sort_by: string, sort_by_field: string,) => {
      const order: any = [[sort_by_field, sort_by]];
      const offset: number = this.getOffsetValue(page, per_page);
      const surveys = await SurveyModel.findAll({
        where: { userId, is_visible: this.VALUE_YES, type:type },
        order,
        offset,
        include: [
          {
            model: ProductModel,
            attributes: {
              exclude: [
                "slug",
                "product_description",
                "product_image",
                "is_visible",
                "created_at",
                "updated_at",
                "deleted_at",
                "userId"],
            },
          },
        ],
      });
      const surveysCount = await SurveyModel.count({
        where: { userId, is_visible: this.VALUE_YES },
      });
  
      if (surveys) {
        const metadata = this.buildMetaData(surveys, page, surveysCount);
        return {
          surveys,
          metadata,
        };
      }
      throw new AppError("No Survey found", null, 401);
    }
    public getAllLoyaltyPoints = async (userId: any) => {
      const loyaltypoints = await LoyaltyPointsModel.findAll({
        where: { userId, is_visible: this.VALUE_YES },
      });
      const loyaltiesCount = await LoyaltyPointsModel.count({
        where: { userId, is_visible: this.VALUE_YES },
      });
  
      if (loyaltypoints) {
        return {
          loyaltypoints, loyaltiesCount,
        };
      }
      throw new AppError("No loyalty points found", null, 401);
    }

    public getUserRaffleDraw = async (userId: any) => {
      const raffles = await RewardModel.findAll({
        where: { userId, is_visible: this.VALUE_YES, reward_type:'Raffle' },
      });
      
  
      if (raffles) {
        return {
          raffles
        };
      }
      throw new AppError("No raffles found", null, 401);
    }

    public getRaffleDetails = async (id: any) => {
      const raffle = await RewardModel.findOne({
        where: { id:id, is_visible: this.VALUE_YES, reward_type:'Raffle' },
      });
      
          console.log(raffle)

      if (raffle) {

        let gifts = await RaffleGiftModel.findAll({
          where: { survey_reward_id:id },
          include: [RaffleWinnerModel]
        });


        // gifts.forEach(gift => {
          
        //   const winner = RaffleWinnerModel.findOne({
        //     where: { gift_id: gift.id },
        //     raw:true
        //   });
        //   gift.winner = winner;

        // });
        
        let raffleEntries = await RaffleEntryModel.findAll({
          where: { survey_reward_id:id }, raw: true
        });

        let raffleStats = {totalCount:0, uniqueCount:0}
        
        if(raffleEntries){
          raffleStats.totalCount = raffleEntries.length;
          let uniqueEntries = this.uniqueBy(raffleEntries,'phone_number');
          raffleStats.uniqueCount = uniqueEntries.length;
        }
        // console.log(raffleStats)

        return {
          raffle,gifts,raffleStats
        };
      }
      throw new AppError("No raffle found", null, 401);
    }

    public selectRaffleWinner = async (data: any) => {
      // console.log(data)

      const gift = await RaffleGiftModel.findOne({
        where: { id:data.id },
      });

      
      // let raffleEntries = await RaffleEntryModel.findOne({
      //   where: { raffle_draw_id:gift.survey_reward_id },
      //   order: 'random()',
        
      //    raw: true
      // });
      let raffleWinner = await DB.query(`SELECT * FROM raffle_entries WHERE raffle_draw_id=${gift.survey_reward_id} ORDER BY RAND() LIMIT 1`, {
        type: (<any>DB).QueryTypes.SELECT,
      });

      // console.log(raffleWinner)


      
      if(raffleWinner){
        let winnerData = {
          user_id : raffleWinner[0].user_id,
          phone_number : raffleWinner[0].phone_number,
          survey_id : raffleWinner[0].survey_id,
          raffle_draw_id : raffleWinner[0].raffle_draw_id,
          survey_reward_id : raffleWinner[0].survey_reward_id,
          raffle_gift_id : gift.id,
        }
        await RaffleWinnerModel.create(winnerData);

        // raffleStats.totalCount = raffleEntries.length;
        // let uniqueEntries = this.uniqueBy(raffleEntries,'phone_number');
        // raffleStats.uniqueCount = uniqueEntries.length;
      }

      let rWinner = raffleWinner[0]

      if (rWinner) {
        // console.log(rWinner)
        // console.log(MessageModel)
        let message = {user_id : rWinner.user_id, content: "congrats, you won the lottery", from: data.user.id}
          await MessageModel.create(message);
          let id = rWinner.user_id;

          let user = await UserModel.findOne({
            where: { id }, attributes: {
              exclude: [
                "updated_at", "deleted_at",
              ],
            },
          raw: true,
          });
       await this.sendPushNotification(message,user.id);

        return {
          rWinner
        };
      }
      throw new AppError("No raffle found", null, 401);
    }


    async sendPushNotification(msg,id){
      console.log(msg)
      const notification = {
          contents: {
            'en': msg.content,
          },
          included_segments: ['Subscribed Users'],
          filters: [
            { field: 'tag', key: 'level'}
          ]
        };
         
        // using async/await
        try {
          const response = await client.createNotification(notification);
          console.log('sent notification');
          console.log(response);
        } catch (e) {
          if (e instanceof OneSignal.HTTPError) {
            // When status code of HTTP response is not 2xx, HTTPError is thrown.
            console.log(e.statusCode);
            console.log(e.body);
          }
        }
         
        // or you can use promise style:
        client.createNotification(notification)
          .then(response => {})
          .catch(e => {});
  }
  // public selectRaffleWinner = async (id: any) => {

  // }

  private uniqueBy(arr, prop){
    return arr.reduce((a, d) => {
      if (!a.includes(d[prop])) { a.push(d[prop]); }
      return a;
    }, []);
  }

  public getAllRedemptionPoints = async (userId: any) => {
    const redemptionPoints = await RedemptionModel.findAll({
      where: { is_visible: this.VALUE_YES },
    });
    if (redemptionPoints) {
      return redemptionPoints;
    }
    throw new AppError("No redemption point found", null, 401);
  }
  public getAloyaltyPoints = async (userId: any) => {
    const loyalty = await RedemptionModel.findOne({
      where: { userId, is_visible: this.VALUE_YES },
    });
    if (loyalty) {
      return loyalty;
    }
    throw new AppError("No redemption point found", null, 401);
  }
  /**
   * View a survey
   * @param {Object} survey the survey data
   */
  private viewSurvey = async (survey) => {
    survey.dataValues.views++;
    const updated = await SurveyModel.update(survey.dataValues, {
      where: { slug: survey.slug },
    });
    if (updated) {
      return SurveyModel.findOne({ where: { slug: survey.slug } });
    }
  }

  /**
   * Create a new slug (unique url string) for the survey
   * @param {string} str the survey title
   * @return {string} the new slug string
   */
  private createSlug = async (str: string) => {
    let newString = slugify(str, {
      remove: /[*+~.()'"!?:@#${}<>,]/g,
      lower: true,
    });
    const random = crypto.randomBytes(6).toString("hex");
    newString = `${newString}-${random}`;

    return newString;
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
          : `Showing ${channels.length} of ${channelsCount} results`,
    };
  }
}
