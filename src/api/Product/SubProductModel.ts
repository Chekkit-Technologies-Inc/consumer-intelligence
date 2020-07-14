import Sequelize from "sequelize";
import { Model } from "sequelize";
import { DB } from "../../shared/database";
import { SHOULD_MIGRATE } from "../../config";
import withCursor from "sequelize-cursor-pagination";
import { logger } from "../../utils/logger";
import { UserModel } from "../User";
import { ProductModel } from "./ProductModel";

export class SubProductModel extends Model { }
SubProductModel.init(
  {
    product_name: {
      type: Sequelize.STRING(50),
      allowNull: false,
      validate: {
        notNull: {
          msg: "Your Sub-Product needs a name",
        },
      },
    },
    batch_num: {
      type: Sequelize.INTEGER,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Please provide the product batch number",
        },
      },
    },
    total_generated_code: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    expiry_date: {
      type: Sequelize.DATE,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Please provide the product expiry date",
        },
      },
    },
    production_date: {
      type: Sequelize.DATE,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Please provide the product production date",
        },
      },
    },
    rewardId: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    surveyId: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    is_visible: {
      type: Sequelize.BOOLEAN,
      defaultValue: 1,
    },
  },
  {
    sequelize: DB,
    modelName: "sub_products",
  },
);
UserModel.hasMany(SubProductModel, { as: "SubProduct" });
ProductModel.hasMany(SubProductModel, { as: "SubProduct" });
SubProductModel.belongsTo(UserModel);
SubProductModel.belongsTo(ProductModel);

const option: any = {
  alter: SHOULD_MIGRATE,
};
const paginationOptions: any = {
  methodName: "paginate",
  primaryKeyField: "id",
};
// force: true will drop the table if it already exists
SubProductModel.sync(option).then(() => {
  logger.info("Sub Products table migrated");
  // Table created
});

withCursor(paginationOptions)(<any>SubProductModel);
