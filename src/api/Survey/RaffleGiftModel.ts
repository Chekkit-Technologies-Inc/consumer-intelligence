import Sequelize from "sequelize";
import { Model } from "sequelize";
import { DB } from "../../shared/database";
import { SHOULD_MIGRATE } from "../../config";
import withCursor from "sequelize-cursor-pagination";
import { logger } from "../../utils/logger";
import { UserModel } from "../User";
import { RewardModel } from '../SurveyReward/RewardModel';
import { RaffleWinnerModel } from '../Survey/RaffleWinnerModel';

export class RaffleGiftModel extends Model { }
RaffleGiftModel.init(
    {
        name: {
            type: Sequelize.TEXT,
            allowNull: false,
            validate: {
                notNull: {
                    msg: "gift needs name",
                },
            },
        },
        photo: {
            type: Sequelize.TEXT,
            allowNull: false,
            validate: {
                notNull: {
                    msg: "gift needs photo",
                },
            },
        },
        status: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
        },
        survey_reward_id: {
            type: Sequelize.INTEGER,
        },
        is_visible: {
            type: Sequelize.INTEGER,
            defaultValue: 1,
        },
    },
    {
        sequelize: DB,
        modelName: "raffle_gifts",
    },
);
UserModel.hasMany(RaffleGiftModel);
RewardModel.hasMany(RaffleGiftModel);
RaffleGiftModel.belongsTo(UserModel);
RaffleGiftModel.belongsTo(RewardModel);

RaffleGiftModel.hasMany(RaffleWinnerModel);
RaffleWinnerModel.belongsTo(RaffleGiftModel);

const option: any = {
    alter: SHOULD_MIGRATE,
};
const paginationOptions: any = {
    methodName: "paginate",
    primaryKeyField: "id",
};
// force: true will drop the table if it already exists
RaffleGiftModel.sync(option).then(() => {
    logger.info("Raffle Gift table migrated");
    // Table created
});

withCursor(paginationOptions)(<any>RaffleGiftModel);
