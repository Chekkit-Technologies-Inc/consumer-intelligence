import Sequelize from "sequelize";
import { Model } from "sequelize";
import { DB } from "../../shared/database";
import { SHOULD_MIGRATE } from "../../config";
import withCursor from "sequelize-cursor-pagination";
import { logger } from "../../utils/logger";
import { UserModel } from "../User";
import { ProductModel } from "../Product";
// import { RewardModel } from '../SurveyReward/RewardModel';

export class SurveyModel extends Model { }
SurveyModel.init(
  {
    title: {
      type: Sequelize.STRING(50),
      allowNull: false,
      validate: {
        notNull: {
          msg: "Your survey needs a title",
        },
      },
    },
    slug: {
      type: Sequelize.STRING(150),
      allowNull: false,
      validate: {
        notNull: {
          msg: "Your survey needs a slug",
        },
      },
    },
    content: {
      type: Sequelize.TEXT,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Please provide the post content",
        },
      },
    },
    is_visible: {
      type: Sequelize.BOOLEAN,
      defaultValue: 1,
    },
    questions_count: {
      type: Sequelize.INTEGER,
    },
    type: {
      type: Sequelize.INTEGER,
      defaultValue:'1'
    },
    active_survey: {
      type: Sequelize.INTEGER,
      defaultValue:'0'
    },
  },
  {
    sequelize: DB,
    modelName: "surveys",
    indexes: [{ unique: true, fields: ["slug","id"] }],
  },
);

UserModel.hasMany(SurveyModel);
SurveyModel.belongsTo(UserModel);
ProductModel.hasMany(SurveyModel);
SurveyModel.belongsTo(ProductModel);
const option: any = {
  alter: SHOULD_MIGRATE,
};
const paginationOptions: any = {
  methodName: "paginate",
  primaryKeyField: "id",
};
// force: true will drop the table if it already exists
SurveyModel.sync(option).then(() => {
  logger.info("Surveys table migrated");
  // Table created
});

withCursor(paginationOptions)(<any> SurveyModel);
