import Sequelize from "sequelize";
import { Model } from "sequelize";
import { DB } from "../../shared/database";
import { logger } from "../../utils/logger";
import { SurveyModel } from "../Survey";

export class ChannelModel extends Model { }
ChannelModel.init(
    {
        code: {
            type: Sequelize.STRING(20)
        },
        is_visible: {
            type: Sequelize.BOOLEAN,
            defaultValue: 1,
        }
    },
    {
        sequelize: DB,
        modelName: "survey_channels",
    },
);

SurveyModel.hasMany(ChannelModel);
ChannelModel.belongsTo(SurveyModel);
const option: any = {
    alter: true,
};

// force: true will drop the table if it already exists
ChannelModel.sync(option).then(() => {
    logger.info("Survey channels table migrated");
    // Table created
});
