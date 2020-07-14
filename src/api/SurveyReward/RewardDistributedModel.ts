import Sequelize from "sequelize";
import { Model } from "sequelize";
import { DB } from "../../shared/database";
import withCursor from "sequelize-cursor-pagination";
import { logger } from "../../utils/logger";
import { SHOULD_MIGRATE } from "../../config";
import { RewardModel } from './RewardModel';

export class RewardDistributedModel extends Model { }
RewardDistributedModel.init(
    {
        reward_value: {
            type: Sequelize.TEXT,
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
        reward_distributed: {
            type: Sequelize.INTEGER,
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Please provide the Reward distributed",
                },
            },
        },
        survey_reward_id: {
            type: Sequelize.INTEGER,
            allowNull: true
        },
    },
    {
        sequelize: DB,
        modelName: "reward_distributed",
    },
);

RewardModel.hasMany(RewardDistributedModel);
RewardDistributedModel.belongsTo(RewardModel);

const option: any = {
    alter: SHOULD_MIGRATE,
};
const paginationOptions: any = {
    methodName: "paginate",
    primaryKeyField: "id",
};
// force: true will drop the table if it already exists
RewardDistributedModel.sync(option).then(() => {
    logger.info("Reward Distributed table migrated");
    // Table created
});

withCursor(paginationOptions)(<any>RewardDistributedModel);

