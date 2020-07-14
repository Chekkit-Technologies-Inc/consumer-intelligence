import Sequelize, { Model } from "sequelize";
import { DB } from "../../shared/database";
import { logger } from "../../utils/logger";

export class ResourcesModel extends Model { }
ResourcesModel.init(
    {
        qr_cost: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
            unique: {
                name: "qr_cost",
                msg: "A Resource with this amount already exists",
            },
        },
        ussd_cost: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
            unique: {
                name: "ussd_cost",
                msg: "A Resource option costing that much already exists",
            },
        },
        pin_cost: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
            unique: {
                name: "pin_cost",
                msg: "A Resource option costing that much already exists",
            },
        },
    },
    {
        sequelize: DB,
        modelName: "resources",
    },
);

const syncOption: any = {
    alter: true,
};

// force: true will drop the table if it already exists
ResourcesModel.sync(syncOption).then(() => {
    logger.info("Resources table migrated");
    // Table created
});
