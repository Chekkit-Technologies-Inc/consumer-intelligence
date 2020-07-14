import Sequelize from "sequelize";
import { Model } from "sequelize";
import { DB } from "../../shared/database";
import { SHOULD_MIGRATE } from "../../config";
import withCursor from "sequelize-cursor-pagination";
import { logger } from "../../utils/logger";

export class RaffleWinnerModel extends Model { }
RaffleWinnerModel.init(
    {
        user_id: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        phone_number: {
            type: Sequelize.TEXT,
            allowNull: true,
        },
        status: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
        },
        survey_reward_id: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        survey_id: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        raffle_gift_id: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        raffle_draw_id: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
    },
    {
        sequelize: DB,
        modelName: "raffle_winners",
    },
);


const option: any = {
    alter: SHOULD_MIGRATE,
};
const paginationOptions: any = {
    methodName: "paginate",
    primaryKeyField: "id",
};
// force: true will drop the table if it already exists
RaffleWinnerModel.sync(option).then(() => {
    logger.info("Raffle Winners table migrated");
    // Table created
});

withCursor(paginationOptions)(<any>RaffleWinnerModel);
