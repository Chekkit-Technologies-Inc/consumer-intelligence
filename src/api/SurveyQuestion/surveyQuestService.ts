import crypto from "crypto";
import slugify from "slugify";
import { SurveyQuestModel } from ".";
import { ISurveyModel } from "../../interfaces/ISurveyModel";
import { AppError } from "../../utils/app-error";
import { getQuestionResults } from "../../utils/helpers";
import { SurveyModel } from "../Survey";
import { ActivitiesCountModel } from "../User";
import { IRedeem } from "../Survey/IRedeem";
import { RedemptionModel } from "../Survey/RedemptionModel";
import { RewardModel } from "../SurveyReward/RewardModel";
import { UssdResponseModel } from "../UssdResponse/ussdResponseModel";
import { surveyQuestResponseModel } from "../UssdResponse/surveyQuestResponseModel";

export class surveyQuestService {
  // private VALUE_NO: number = 0;
  // private VALUE_YES: number = 1;
  /**
   * Create new survey content
   * @param {Object} data.surveyData
   * @param {string} data.surveyData.title the survey title
   * @param {string} data.surveyData.content the survey content
   * @param {number} data.surveyData.authorId the survey author id
   *
   * @returns {[Promise<any> | null]} saved survey data
   */
  public createSurveyQuestion = async (survey_id: number, user, data: any) => {
    let survey = await SurveyModel.findOne({ where: { id: survey_id } });
    // console.log("questions", data);
    let questObjct = [];
    for (const question of data) {
      // console.log("o ya na", question);
      question.slug = await this.createSlug(question.content);
      question.surveyId = survey_id;
      const choices = JSON.parse(question.choices);
      if (choices.length < 1) {
        throw new AppError("Your Question needs at least one options", null, 400);
      }
      for (const choice of choices) {
        if (!choice.hasOwnProperty("text") || (Object.keys(choice).length < 1)) {
          throw new AppError("Invalid Question data");
        }
      }
      questObjct.push(question);
    }
    const question = await SurveyQuestModel.bulkCreate(questObjct);
    if (question) {
      let all_count = await ActivitiesCountModel.findOne({ where: { userId: user.id } });
      // // associations have been set
      if (all_count) {
        const questions_count: number = all_count.dataValues.questions_count + questObjct.length;
        await ActivitiesCountModel.update({ questions_count }, { where: { userId: user.id } });
      } else {
        await ActivitiesCountModel.create({ userId: user.id, questions_count: 1 });
      }
      return survey;
    }
    throw new AppError("Could not create question");
  }
  public updateSurveyQuestion = async (survey_id: number, user, data: any) => {
    let questObjct = [];
    for (const question of data) {
      question.slug = await this.createSlug(question.content);
      question.surveyId = survey_id;
      const choices = JSON.parse(question.choices);
      if (choices.length < 1) {
        throw new AppError("Your Question needs at least one options", null, 400);
      }
      for (const choice of choices) {
        if (!choice.hasOwnProperty("text") || (Object.keys(choice).length < 1)) {
          throw new AppError("Invalid Question data");
        }
      }
      questObjct.push(question);
    }
    const question = await SurveyQuestModel.bulkCreate(questObjct, { updateOnDuplicate: ["surveyId"] });
    if (question) {
      let all_count = await ActivitiesCountModel.findOne({ where: { userId: user.id } });
      // // associations have been set
      if (all_count) {
        const questions_count: number = all_count.dataValues.questions_count + questObjct.length;
        await ActivitiesCountModel.update({ questions_count }, { where: { userId: user.id } });
      } else {
        await ActivitiesCountModel.create({ userId: user.id, questions_count: 1 });
      }
      return question;
    }
    throw new AppError("Could not update question");
  }
  public createRedemptionPoint = async (user: any, data: IRedeem) => {
    const saved = await RedemptionModel.create(data);
    const reward = await RewardModel.findOne({ where: { id: data.survey_rewardId } });
    if (saved && user.addRedeemPoint(saved) && reward.addRedeemPoint(saved)) {
      return saved;
    }
    throw new AppError("Could not create redemption point.");
  }
 
  public deleteQuestSurvey = async (data: any) => {
    let survey = await SurveyQuestModel.findOne({ where: { id: data.surveyId } });
    let user = data.user;

    if (survey) {
      const canDelete =
        (await user.hasSurvey(survey)) && survey.is_deleted == 0;
      if (canDelete) {
        const flagUpdated = await SurveyQuestModel.update(
          { is_deleted: 1 },
          { where: { id: data.surveyId } },
        );
        const softDeleted = await SurveyQuestModel.destroy({
          where: { id: data.surveyId },
        });
        if (flagUpdated && softDeleted) {
          return "Survey deleted";
        }
      } else {
        return "You cannot perform that action";
      }
    }

    return null;
  }

  /**
      * getQuestions
      */
  public getQuestSurveys = async (survey: any) => {
    let questions = await SurveyQuestModel.findAll({
      where: { is_visible: 1 },
      order: [["created_at", "desc"]],
    });
    if (questions) {
      return questions;
    }

    throw new AppError("No polls found");
  }
  /**
     * getUserQuestions
     */
  public getUserQuestSurvey = async (userId: number) => {
    let surveys = await SurveyModel.findAll({ where: { userId } });
    let userQuestions = [];
    if (surveys) {
      for (const item of surveys) {
        let questions = await SurveyQuestModel.findAll({
          where: { surveyId: item.id },
          order: [["created_at", "desc"]],
        });
        if (questions) {
          userQuestions.push(...questions);
        } else {
          throw new AppError("No Questions created for the surveys.");
        }
      }
      return userQuestions;
    }
    throw new AppError("No Survey found.");
  }
  /**
   * Gets Questions details
   */
  public getQuestion = async (survey: ISurveyModel, slug: string, updated?: boolean) => {
    const survey_quest = await SurveyQuestModel.findOne({
      where: {
        slug,
        is_visible: 1,
      },
    });
    if (survey_quest) {
      let results = await getQuestionResults(survey_quest, survey, true);
      if (results) {
        if (updated) {
          results.hasUserrespondedd = true;
        }
        return results;
      }
    }
    throw new AppError("Question not found", null, 401);
  }
  public getSurveyQuestions = async (surveyId) => {
    const survey_quest = await SurveyQuestModel.findAll({
      where: {
        surveyId,
        is_visible: 1,
      },
      limit: 3,
    });
    console.log(survey_quest)

    if (survey_quest) {
      return survey_quest;
    }
    throw new AppError("Question not found", null, 401);
  }
  public getSurveyQuestionsWithResponses = async (surveyId) => {
    let survey_quest = await SurveyQuestModel.findAll({
      where: {
        surveyId,
        is_visible: 1,
      },
      limit: 3,
    });

    // let surveyResponses  = [];

    console.log(survey_quest)
    // for (let item of survey_quest) {
    //   item.responses  = [];
    //   // console.log(item.responses)

    //   let responses = await UssdResponseModel.findAll({
    //     where: { surveyId: item.surveyId },
    //     order: [["created_at", "desc"]],
    //   });
    //   if (responses) {
    //     surveyResponses.push(...responses);
    //     // item.responses.push(...responses);
    //   } 
    // }
    let surveyResponses = await UssdResponseModel.findAll({
      where: { surveyId: surveyId },
      order: [["created_at", "desc"]],
    });

    console.log(surveyResponses);
    
    if (surveyResponses) {
      return {responses :surveyResponses, questions: survey_quest};
    }
    throw new AppError("Question not found", null, 401);
  }

  public getSurveyQuestionsWithResponsesLabel = async (surveyId) => {
    let survey_quest = await SurveyQuestModel.findAll({
      where: {
        surveyId,
        is_visible: 1,
      },
      limit: 3,
    });

    let surveyResponses  = [];

    console.log(survey_quest)
    // for (let item of survey_quest) {
      // item.responses  = [];
      // console.log(item.responses)

      let responses = await surveyQuestResponseModel.findAll({
        where: { surveyId: surveyId },
        order: [["created_at", "desc"]],
      });
      if (responses) {
        surveyResponses.push(...responses);
        // item.responses.push(...responses);
      } 
    // }

    if (surveyResponses) {
      return {responses :surveyResponses, questions: survey_quest};
    }
    throw new AppError("Question not found", null, 401);
  }

  public getSurveyPoints = async (user, surveyId) => {
    const survey_count = await SurveyQuestModel.count({
      where: {
        surveyId,
        is_visible: 1,
      },
    });
    if (survey_count) {
      const survey_points = survey_count * 2;
      return survey_points;
    }

    throw new AppError("Question not found", null, 401);
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

}
