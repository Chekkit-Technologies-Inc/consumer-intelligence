import Sequelize from "sequelize";
import { Model } from "sequelize";
import { DB } from "../../shared/database";
import { SHOULD_MIGRATE } from "../../config";
import withCursor from "sequelize-cursor-pagination";
import { logger } from "../../utils/logger";

export class RaffleEntryModel extends Model { }
RaffleEntryModel.init(
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
        raffle_draw_id: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
    },
    {
        sequelize: DB,
        modelName: "raffle_entry",
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
RaffleEntryModel.sync(option).then(() => {
    logger.info("Raffle Gift table migrated");
    // Table created
});

withCursor(paginationOptions)(<any>RaffleEntryModel);
