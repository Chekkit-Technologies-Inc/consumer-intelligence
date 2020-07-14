import Sequelize from "sequelize";
import { Model } from "sequelize";
import { DB } from "../../shared/database";
import { SHOULD_MIGRATE } from "../../config";
import withCursor from "sequelize-cursor-pagination";
import { logger } from "../../utils/logger";

export class SavedPhoneNumbersModel extends Model { }
SavedPhoneNumbersModel.init(
    {
        phone: {
            type: Sequelize.TEXT,
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Phone number required",
                },
            },
        },
        network: {
            type: Sequelize.TEXT,
            allowNull: true
        }
    },
    {
        sequelize: DB,
        modelName: "saved_phone_numbers",
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
SavedPhoneNumbersModel.sync(option).then(() => {
    logger.info("Saved Phone Numbers table migrated");
    // Table created
});

withCursor(paginationOptions)(<any>SavedPhoneNumbersModel);
