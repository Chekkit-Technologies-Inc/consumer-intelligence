import Sequelize, { Model } from "sequelize";
import { DB } from "../../shared/database";
import { logger } from "../../utils/logger";
import { SHOULD_MIGRATE } from "../../config";
// import { UserModel } from ".";

export class ActivityModel extends Model { }
ActivityModel.init(
    {
        average_app_session_time: {
            type: Sequelize.STRING(20),
        },
        last_login_ip: {
            type: Sequelize.STRING(20),
        },
        last_device_information: {
            type: Sequelize.STRING(100),
        },
        total_survey: {
            type: Sequelize.STRING(20),
        },
    }, {
        sequelize: DB,
        modelName: "activity_logs",
    },
);

// UserModel.hasOne(ActivityModel);
// ActivityModel.belongsTo(UserModel);

const options: any = { alter: SHOULD_MIGRATE };

// force: true will drop the table if it already exists
ActivityModel.sync(options).then(() => {
    logger.info("Activity logs table migrated");
    // Table created
});
