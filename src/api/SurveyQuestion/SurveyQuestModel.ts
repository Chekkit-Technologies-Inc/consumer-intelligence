import Sequelize from "sequelize";
import { Model } from "sequelize";
import { DB } from "../../shared/database";
import { SHOULD_MIGRATE } from "../../config";
import { logger } from "../../utils/logger";
import { SurveyModel } from "../Survey";

export class SurveyQuestModel extends Model { }
SurveyQuestModel.init(
  {
    slug: {
      type: Sequelize.STRING(100),
      allowNull: false,
      validate: {
        notNull: {
          msg: "Your survey needs a slug",
        },
      },
    },
    content: {
      type: Sequelize.STRING(400),
      allowNull: false,
      validate: {
        notNull: {
          msg: "Your survey needs a title",
        },
      },
    },
    answer: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    choices: {
      type: Sequelize.STRING(100),
    },
    is_visible: {
      type: Sequelize.INTEGER,
      defaultValue: 1,
    },
    response: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
  },
  {
    sequelize: DB,
    modelName: "surveys_questions",
    indexes: [{ unique: true, fields: ["slug"] }],
  },
);
SurveyModel.hasMany(SurveyQuestModel);
SurveyQuestModel.belongsTo(SurveyModel);
const option: any = {
  alter: SHOULD_MIGRATE,
};

// force: true will drop the table if it already exists
SurveyQuestModel.sync(option).then(() => {
  logger.info("Survey Questions table migrated");
  // Table created
});
