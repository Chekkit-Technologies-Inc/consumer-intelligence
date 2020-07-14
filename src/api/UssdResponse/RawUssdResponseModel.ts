import Sequelize from "sequelize";
import { Model } from "sequelize";
import { DB } from "../../shared/database";
import { SHOULD_MIGRATE } from "../../config";
import { logger } from "../../utils/logger";

export class RawUssdResponseModel extends Model { }
RawUssdResponseModel.init(
    {
        phone_number: {
            type: Sequelize.STRING(50),
        },
        session_id: {
            type: Sequelize.TEXT,
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
        modelName: "raw_ussd_user_response",
    },
);

const option: any = {
    alter: SHOULD_MIGRATE,
};

// force: true will drop the table if it already exists
RawUssdResponseModel.sync(option).then(() => {
    logger.info(" Raw Ussd Response table migrated");
    // Table created
});
