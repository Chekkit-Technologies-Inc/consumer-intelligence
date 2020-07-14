import { surveyQuestService } from "./surveyQuestService";
import { BaseController } from "../baseController";

/**
 * Survey controller
 *
 * @export
 * @class SurveyController
 */
export class SurveyQuestController extends BaseController {
  // private _surveyService = new SurveyService();
  private _surveyQuestService = new surveyQuestService();

  // tslint:disable-next-line: max-line-length
  public index = async (survey) => {
    const surveys = await this._surveyQuestService.getQuestSurveys(survey);
    return this.sendResponse(surveys);
  }
  public getUserQuestSurvey = async (userId) => {
    const usersurveys = await this._surveyQuestService.getUserQuestSurvey(userId);
    return this.sendResponse(usersurveys);
  }
  /**
   * createSurveyQuestion
   */
  public createSurveyQuestion = async (survey_id, user, data: any) => {
    const survey_quest = await this._surveyQuestService.createSurveyQuestion(survey_id, user, data);
    return this.sendResponse(survey_quest);
  }

  public createRedemptionPoint = async (user: any, data: any) => {
    const redeemPoint = await this._surveyQuestService.createRedemptionPoint(user, data);
    return this.sendResponse(redeemPoint);
  }
  /**
   * deletePost
   */
  public deleteQuestSurvey = async (data) => {
    const deleted = await this._surveyQuestService.deleteQuestSurvey(data);
    return this.sendResponse(deleted);
  }

  /**
   * get post
   */
  public getQuestSurvey = async (survey: any, slug: string) => {
    const survey_question = await this._surveyQuestService.getQuestion(survey, slug);
    return this.sendResponse(survey_question);
  }
  
  public getSurveyQuestions = async (surveyId: number) => {
    const survey_question = await this._surveyQuestService.getSurveyQuestions(surveyId);
    return this.sendResponse(survey_question);
  }

  public getSurveyQuestionsWithResponses = async (surveyId: number) => {
    const survey_question = await this._surveyQuestService.getSurveyQuestionsWithResponses(surveyId);
    return this.sendResponse(survey_question);
  }


  public getSurveyQuestionsWithResponsesLabel = async (surveyId: number) => {
    const survey_question = await this._surveyQuestService.getSurveyQuestionsWithResponsesLabel(surveyId);
    return this.sendResponse(survey_question);
  }


  public getSurveyPoints = async (user: any, surveyId: number) => {
    const survey_points = await this._surveyQuestService.getSurveyPoints(user, surveyId);
    return this.sendResponse(survey_points);
  }
}
