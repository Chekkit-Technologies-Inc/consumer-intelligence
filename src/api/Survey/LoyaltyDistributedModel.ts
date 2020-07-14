import Sequelize from "sequelize";
import { Model } from "sequelize";
import { DB } from "../../shared/database";
import { SHOULD_MIGRATE } from "../../config";
import withCursor from "sequelize-cursor-pagination";
import { logger } from "../../utils/logger";
import { LoyaltyPointsModel } from "./LoyaltyPointsModel";

export class LoyaltyDistributedModel extends Model { }
LoyaltyDistributedModel.init(
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
    },
    {
        sequelize: DB,
        modelName: "reward_distributed",
    },
);

LoyaltyPointsModel.hasMany(LoyaltyDistributedModel);
LoyaltyDistributedModel.belongsTo(LoyaltyPointsModel);

const option: any = {
    alter: SHOULD_MIGRATE,
};
const paginationOptions: any = {
    methodName: "paginate",
    primaryKeyField: "id",
};
// force: true will drop the table if it already exists
LoyaltyDistributedModel.sync(option).then(() => {
    logger.info("Loyalty Distributed table migrated");
    // Table created
});

withCursor(paginationOptions)(<any> LoyaltyDistributedModel);

