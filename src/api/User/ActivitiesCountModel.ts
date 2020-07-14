/*
    Return count of user activities on individual models
*/

import Sequelize from "sequelize";
import { Model } from "sequelize";
import { DB } from "../../shared/database";
import { SHOULD_MIGRATE } from "../../config";
import { logger } from "../../utils/logger";
import { UserModel } from ".";

export class ActivitiesCountModel extends Model { }
ActivitiesCountModel.init(
    {
        products_count: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
        },
        surveys_count: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
        },
        product_pins_count: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
        },
        product_agents_count: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
        },
        used_pin_count: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
        },
        questions_count: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
        },
        response_count: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
        },
        feedback_count: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
        },
        airtime_distributed: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
        },
        channels_count: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
        },
        rewards_count: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
        },
        loyalty_count: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
        },
    },
    {
        sequelize: DB,
        modelName: "activity_counts",
    },
);

UserModel.hasMany(ActivitiesCountModel);
ActivitiesCountModel.belongsTo(UserModel);
const option: any = {
    alter: SHOULD_MIGRATE,
};

// force: true will drop the table if it already exists
ActivitiesCountModel.sync(option).then(() => {
    logger.info("Activities Count table migrated");
    // Table created
});
