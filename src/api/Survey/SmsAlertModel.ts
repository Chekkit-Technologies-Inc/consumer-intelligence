import Sequelize from "sequelize";
import { Model } from "sequelize";
import { DB } from "../../shared/database";
import { SHOULD_MIGRATE } from "../../config";
import withCursor from "sequelize-cursor-pagination";
import { logger } from "../../utils/logger";
import { UserModel } from "../User";

export class SmsAlertModel extends Model { }
SmsAlertModel.init(
    {
        content: {
            type: Sequelize.TEXT,
            allowNull: false,
            validate: {
                notNull: {
                    msg: "message content required",
                },
            },
        },
        is_active: {
            type: Sequelize.INTEGER(),
            defaultValue: 0,
        },
        interval_type: {
            type: Sequelize.INTEGER(),
            defaultValue: 0,
        },
        time: {
            type: Sequelize.TEXT,
            allowNull: true,
        },
    },
    {
        sequelize: DB,
        modelName: "sms_alert",
    },
);

SmsAlertModel.belongsTo(UserModel);

const option: any = {
    alter: SHOULD_MIGRATE,
};
const paginationOptions: any = {
    methodName: "paginate",
    primaryKeyField: "id",
};
// force: true will drop the table if it already exists
SmsAlertModel.sync(option).then(() => {
    logger.info("Sms Alert table migrated");
    // Table created
});

withCursor(paginationOptions)(<any>SmsAlertModel);
