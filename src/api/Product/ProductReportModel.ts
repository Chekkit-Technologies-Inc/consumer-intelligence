import Sequelize from "sequelize";
import { Model } from "sequelize";
import { DB } from "../../shared/database";
import { SHOULD_MIGRATE } from "../../config";
import withCursor from "sequelize-cursor-pagination";
import { logger } from "../../utils/logger";
import { UserModel } from "../User";
import { ProductModel } from './ProductModel';
import { SubProductModel } from './SubProductModel';

export class ProductReportModel extends Model { }
ProductReportModel.init(
  {
    product_name: {
      type: Sequelize.STRING(50),
      allowNull: false,
      validate: {
        notNull: {
          msg: "Your Product needs a title",
        },
      },
    },
    slug: {
      type: Sequelize.STRING(150),
      allowNull: false,
      validate: {
        notNull: {
          msg: "Your Product needs a slug",
        },
      },
    },
    product_user_exprnce: {
      type: Sequelize.TEXT,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Please provide the product user experience",
        },
      },
    },
    product_store_address: {
      type: Sequelize.TEXT,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Please provide the product store address",
        },
      },
    },
    withUserId: {
      type: Sequelize.INTEGER,
    },
    product_image: {
      type: Sequelize.STRING(100),
      allowNull: false,
      validate: {
        notNull: {
          msg: "Please provide the product report image",
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
    modelName: "product_reports",
    indexes: [{ unique: true, fields: ["slug"] }],
  },
);

UserModel.hasMany(ProductReportModel, {
  as: "ProductReport",
});
ProductModel.hasMany(ProductReportModel, {
  as: "ProductReport",
});
UserModel.hasMany(ProductReportModel);
SubProductModel.hasMany(ProductReportModel);
ProductReportModel.belongsTo(UserModel);
ProductReportModel.belongsTo(SubProductModel);

const option: any = {
  alter: SHOULD_MIGRATE,
};
const paginationOptions: any = {
  methodName: "paginate",
  primaryKeyField: "id",
};
// force: true will drop the table if it already exists
ProductReportModel.sync(option).then(() => {
  logger.info("Products table migrated");
  // Table created
});

withCursor(paginationOptions)(<any>ProductReportModel);
