import Sequelize from "sequelize";
import { Model } from "sequelize";
import { DB } from "../../shared/database";
import { SHOULD_MIGRATE } from "../../config";
import withCursor from "sequelize-cursor-pagination";
import { logger } from "../../utils/logger";
import { UserModel } from "../User";
import { RewardModel } from '../SurveyReward/RewardModel';

export class RedemptionModel extends Model { }
RedemptionModel.init(
    {
        point_location: {
            type: Sequelize.TEXT,
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Your redemption point needs point agent location",
                },
            },
        },
        point_address: {
            type: Sequelize.TEXT,
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Your redemption point needs point agent address",
                },
            },
        },
        point_agent_name: {
            type: Sequelize.TEXT,
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Please provide the point agent name",
                },
            },
        },
        point_agent_code: {
            type: Sequelize.TEXT,
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Please provide the redemption point agent code",
                },
            },
        },
        reward_redeemed: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
        },
        is_visible: {
            type: Sequelize.BOOLEAN,
            defaultValue: 1,
        },
    },
    {
        sequelize: DB,
        modelName: "redemption_points",
    },
);
UserModel.hasMany(RedemptionModel, { as: "RedeemPoint" });
RewardModel.hasMany(RedemptionModel, { as: "RedeemPoint" });
RedemptionModel.belongsTo(UserModel);
RedemptionModel.belongsTo(RewardModel);

const option: any = {
    alter: SHOULD_MIGRATE,
};
const paginationOptions: any = {
    methodName: "paginate",
    primaryKeyField: "id",
};
// force: true will drop the table if it already exists
RedemptionModel.sync(option).then(() => {
    logger.info("Redemption point table migrated");
    // Table created
});

withCursor(paginationOptions)(<any>RedemptionModel);
