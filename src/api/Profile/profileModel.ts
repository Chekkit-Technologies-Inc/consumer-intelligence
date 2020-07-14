import Sequelize, { Model } from "sequelize";
import { DB } from "../../shared/database";
import { SHOULD_MIGRATE } from "../../config";
import { logger } from "../../utils/logger";
import { UserModel } from "../User";

export class ProfileModel extends Model { }
ProfileModel.init(
    {
        profile_picture_url: {
            type: Sequelize.STRING(120),
        },
        location: {
            type: Sequelize.STRING(120),
        },
        company_name: {
            type: Sequelize.STRING(120),
        },
        company_email: {
            type: Sequelize.STRING(120),
        },
        reg_number: {
            type: Sequelize.STRING(120),
        }
    },
    {
        sequelize: DB,
        modelName: "profiles",
    },
);

const options: any = {
    alter: SHOULD_MIGRATE,
};

UserModel.hasOne(ProfileModel);
ProfileModel.belongsTo(UserModel);

// force: true will drop the table if it already exists
ProfileModel.sync(options).then(() => {
    logger.info("Profiles table migrated");
    // Table created
});
