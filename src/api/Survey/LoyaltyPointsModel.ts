import Sequelize from "sequelize";
import { Model } from "sequelize";
import { DB } from "../../shared/database";
import { SHOULD_MIGRATE } from "../../config";
import withCursor from "sequelize-cursor-pagination";
import { logger } from "../../utils/logger";
import { UserModel } from "../User";
import { ProductModel } from "../Product";

export class LoyaltyPointsModel extends Model { }
LoyaltyPointsModel.init(
  {
    loyalty_name: {
      type: Sequelize.STRING(50),
      allowNull: false,
      validate: {
        notNull: {
          msg: "Your loyalty needs a name",
        },
      },
    },
    slug: {
      type: Sequelize.STRING(150),
      allowNull: false,
      validate: {
        notNull: {
          msg: "Your loyalty needs a slug",
        },
      },
    },
    scan_point_to_allocate: {
      type: Sequelize.INTEGER,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Please provide scan_point to allocate",
        },
      },
    },
    loyalty_reward: {
      type: Sequelize.TEXT,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Please provide the loyalty reward",
        },
      },
    },
    loyalty_reward_value: {
      type: Sequelize.INTEGER,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Please provide loyalty reward value",
        },
      },
    },
    loyalty_point_convert: {
      type: Sequelize.INTEGER,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Please provide loyalty point convert",
        },
      },
    },
    is_visible: {
      type: Sequelize.BOOLEAN,
      defaultValue: 1,
    },
  },
  {
    sequelize: DB,
    modelName: "loyalty_points",
    indexes: [{ unique: true, fields: ["slug"] }],
  },
);

UserModel.hasMany(LoyaltyPointsModel, { as: "LoyaltyPoint" });
LoyaltyPointsModel.belongsTo(UserModel);
ProductModel.hasMany(LoyaltyPointsModel, { as: "LoyaltyPoint" });
LoyaltyPointsModel.belongsTo(ProductModel);
const option: any = {
  alter: SHOULD_MIGRATE,
};
const paginationOptions: any = {
  methodName: "paginate",
  primaryKeyField: "id",
};
// force: true will drop the table if it already exists
LoyaltyPointsModel.sync(option).then(() => {
  logger.info("loyalty Points table migrated");
  // Table created
});

withCursor(paginationOptions)(<any> LoyaltyPointsModel);
