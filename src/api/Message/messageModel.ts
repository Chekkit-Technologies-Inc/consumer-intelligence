import Sequelize, { Model } from "sequelize";
import { DB } from "../../shared/database";
import { SHOULD_MIGRATE } from "../../config";
import { logger } from "../../utils/logger";
import { UserModel } from "../User";

export class MessageModel extends Model {}
MessageModel.init(
    {
        from: {
            type: Sequelize.STRING(420),
            allowNull: true,
        },
        content: {
            type: Sequelize.STRING(120),
        },
        user_id: {
            type: Sequelize.INTEGER(),
            allowNull: true,
        },
        status: {
          type: Sequelize.INTEGER(),
          defaultValue: 0,
        },
        messageType: {
          type: Sequelize.INTEGER(),
          defaultValue: 1,
        },
    },
    {
        sequelize: DB,
        modelName: "messages",
    },
);

const options: any = {
    alter: SHOULD_MIGRATE,
};

MessageModel.belongsTo(UserModel);

// force: true will drop the table if it already exists
MessageModel.sync(options).then(() => {
    logger.info("Messages table migrated");
    // Table created
});
