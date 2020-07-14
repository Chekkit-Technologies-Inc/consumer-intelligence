import { SurveyService } from "./surveyService";
import { BaseController } from "../baseController";

/**
 * Survey controller
 *
 * @export
 * @class SurveyController
 */
export class SurveyController extends BaseController {
  // private _surveyService = new SurveyService();
  private _surveyService = new SurveyService();

  // tslint:disable-next-line: max-line-length
  public index = async (userId: any, page: number = 1, per_page: number = 15, sort_by: string = "DESC", sort_by_field: string = "updated_at"
  ) => {
    const surveys = await this._surveyService.getSurveys(userId, page, per_page, sort_by, sort_by_field);
    return this.sendResponse(surveys);
  }
  public getSurveysByType = async (userId: any, type:any, page: number = 1, per_page: number = 15, sort_by: string = "DESC", sort_by_field: string = "updated_at"
  ) => {
    const surveys = await this._surveyService.getSurveysByType(userId,type, page, per_page, sort_by, sort_by_field);
    return this.sendResponse(surveys);
  }
  public getAllLoyaltyPoints = async (userId: any) => {
    const surveys = await this._surveyService.getAllLoyaltyPoints(userId);
    return this.sendResponse(surveys);
  }
 
  public getUserRaffleDraw = async (userId: any) => {
    const returnedData = await this._surveyService.getUserRaffleDraw(userId);
    return this.sendResponse(returnedData);
  }
  
  public getRaffleDetails = async (id: any) => {
    const returnedData = await this._surveyService.getRaffleDetails(id);
    return this.sendResponse(returnedData);
  }
  
  public getAllRedemptionPoints = async (userId: any) => {
    const surveys = await this._surveyService.getAllRedemptionPoints(userId);
    return this.sendResponse(surveys);
  }
  
  public selectRaffleWinner = async (data: any) => {
    const surveys = await this._surveyService.selectRaffleWinner(data);
    return this.sendResponse(surveys);
  }
  /**
   * createSurvey
   */
  public createSurvey = async (user: any, data: any) => {
    const survey = await this._surveyService.createSurvey(user, data);
    return this.sendResponse(survey);
  }
  public createLoyaltyPoint = async (user: any, data: any) => {
    const survey = await this._surveyService.createLoyaltyPoint(user, data);
    return this.sendResponse(survey);
  }
  public createRaffleDraw = async (user: any, data: any, photos: any) => {
    console.log(photos)
    const survey = await this._surveyService.createRaffleDraw(user, data);
    return this.sendResponse(survey);
  }

  public returnImageUrl = async ( data: any) => {
    console.log(data)
    // const survey = await this._surveyService.createRaffleDraw(user, data);
    return this.sendResponse(data.location);
  }

  /**
   * deletePost
   */
  public deleteSurvey = async (data) => {
    const deleted = await this._surveyService.deleteSurvey(data);
    return this.sendResponse(deleted);
  }

  /**
   * get post
   */
  public getSurvey = async (slug: string) => {
    const survey = await this._surveyService.getSurvey(slug);
    return this.sendResponse(survey);
  }
  /**
       * updateSurvey
       */
  public updateSurvey = async (slug: any, user: any, data: any) => {
    const update = await this._surveyService.updateSurvey(slug, user, data);
    return this.sendResponse(update);
  }
  public updateSurveyActiveStatus = async (slug: any, user: any, data: any) => {
    const update = await this._surveyService.updateSurveyActiveStatus(slug, user, data);
    return this.sendResponse(update);
  }
  public updateLoyaltyPoint = async (slug: any, user: any, data: any) => {
    const update = await this._surveyService.updateLoyaltyPoint(slug, user, data);
    return this.sendResponse(update);
  }
  public updateProudctSurvey = async (id: any, user: any, data: any) => {
    const update = await this._surveyService.updateProudctSurvey(id, user, data);
    return this.sendResponse(update);
  }

  public updateProductSurvey = async (id: any, user: any, data: any) => {
    const update = await this._surveyService.updateProductSurvey(id, user, data);
    return this.sendResponse(update);
  }
}
