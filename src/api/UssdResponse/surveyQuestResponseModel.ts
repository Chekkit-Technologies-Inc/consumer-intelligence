import Sequelize from "sequelize";
import { Model } from "sequelize";
import { SurveyQuestModel } from "../SurveyQuestion";
import { DB } from "../../shared/database";
import { SHOULD_MIGRATE } from "../../config";
import { logger } from "../../utils/logger";
import { SurveyModel } from "../Survey";

export class surveyQuestResponseModel extends Model { }
surveyQuestResponseModel.init(
    {
        choice: {
            type: Sequelize.STRING(150),
        },
    },
    {
        sequelize: DB,
        modelName: "survey_quest_response",
    },
);
SurveyQuestModel.hasMany(surveyQuestResponseModel, {
    as: "choice",
});
SurveyModel.hasMany(surveyQuestResponseModel, {
    as: "choice",
});
surveyQuestResponseModel.belongsTo(SurveyQuestModel);
surveyQuestResponseModel.belongsTo(SurveyModel);
const option: any = {
    alter: SHOULD_MIGRATE,
};

// force: true will drop the table if it already exists
surveyQuestResponseModel.sync(option).then(() => {
    logger.info("Survey question response table migrated");
    // Table created
});
