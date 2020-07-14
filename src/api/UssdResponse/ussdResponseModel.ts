import Sequelize from "sequelize";
import { Model } from "sequelize";
import { DB } from "../../shared/database";
import { SHOULD_MIGRATE } from "../../config";
import { logger } from "../../utils/logger";
import { SurveyModel } from '../Survey/SurveyModel';

export class UssdResponseModel extends Model { }
UssdResponseModel.init(
    {
        phone_number: {
            type: Sequelize.STRING(50),
        },
        session_id: {
            type: Sequelize.TEXT,
        },
        reward_given: {
            type: Sequelize.STRING(50),
        },
        reward_type: {
            type: Sequelize.STRING(50),
        },
        network_code: {
            type: Sequelize.STRING(50),
        },
        service_code: {
            type: Sequelize.STRING(50),
        },
        answer: {
            type: Sequelize.TEXT,
            allowNull: true,
        },
        clientCode: {
            type: Sequelize.STRING(50),
            allowNull: true,
        },
        questionNumber: {
            type: Sequelize.STRING(50),
            allowNull: true,
        },
        type: {
          type: Sequelize.INTEGER,
          defaultValue: 1,
        },
    },
    {
        sequelize: DB,
        modelName: "ussd_user_response",
    },
);
SurveyModel.hasMany(UssdResponseModel);
UssdResponseModel.belongsTo(SurveyModel);
const option: any = {
    alter: SHOULD_MIGRATE,
};

// force: true will drop the table if it already exists
UssdResponseModel.sync(option).then(() => {
    logger.info("Ussd Response table migrated");
    // Table created
});
