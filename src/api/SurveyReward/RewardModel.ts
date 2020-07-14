import Sequelize from "sequelize";
import { Model } from "sequelize";
import { DB } from "../../shared/database";
import withCursor from "sequelize-cursor-pagination";
import { logger } from "../../utils/logger";
import { UserModel } from "../User";
import { SHOULD_MIGRATE } from "../../config";

export class RewardModel extends Model { }
RewardModel.init(
    {
        reward_value: {
            type: Sequelize.STRING(100),
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Your survey reward needs a value",
                },
            },
        },
        reward_type: {
            type: Sequelize.STRING(50),
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Please provide the Survey Reward type",
                },
            },
        },
        reward_quantity: {
            type: Sequelize.INTEGER,
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Please provide the Survey Reward qauntity",
                },
            },
        },
        is_visible: {
            type: Sequelize.BOOLEAN,
            defaultValue: 1,
        },
        point_to_claim_reward: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
        },
        reward_image: {
            type: Sequelize.STRING(100),
        },
    },
    {
        sequelize: DB,
        modelName: "survey_rewards",
    },
);

UserModel.hasMany(RewardModel);
RewardModel.belongsTo(UserModel);

const option: any = {
    alter: SHOULD_MIGRATE,
};
const paginationOptions: any = {
    methodName: "paginate",
    primaryKeyField: "id",
};
// force: true will drop the table if it already exists
RewardModel.sync(option).then(() => {
    logger.info("Survey Reward table migrated");
    // Table created
});

withCursor(paginationOptions)(<any>RewardModel);

