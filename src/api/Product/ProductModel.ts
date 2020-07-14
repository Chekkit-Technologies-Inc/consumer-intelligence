import Sequelize from "sequelize";
import { Model } from "sequelize";
import { DB } from "../../shared/database";
import { SHOULD_MIGRATE } from "../../config";
import withCursor from "sequelize-cursor-pagination";
import { logger } from "../../utils/logger";
import { UserModel } from "../User";
// import { SurveyModel } from "../Survey";

export class ProductModel extends Model { }
ProductModel.init(
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
    producer_name: {
      type: Sequelize.STRING(50),
      allowNull: false,
      validate: {
        notNull: {
          msg: "Your provide the producer name",
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
    product_description: {
      type: Sequelize.TEXT,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Please provide the post content",
        },
      },
    },
    batch_num: {
      type: Sequelize.TEXT,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Please provide the product batch number",
        },
      },
    },
    barcode_num: {
      type: Sequelize.TEXT,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Please provide the product bar-code number",
        },
      },
    },
    age_range: {
      type: Sequelize.TEXT,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Please provide the product age-range number",
        },
      },
    },
    id_range: {
      type: Sequelize.TEXT,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Please provide the product id-range number",
        },
      },
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
    product_image: {
      type: Sequelize.STRING(100),
      allowNull: false,
      validate: {
        notNull: {
          msg: "Please provide the product image",
        },
      },
    },
    product_category: {
      type: Sequelize.STRING(100),
      allowNull: false,
      validate: {
        notNull: {
          msg: "Please provide the product category",
        },
      },
    },
    fda_number: {
      type: Sequelize.STRING(100),
      allowNull: false,
      validate: {
        notNull: {
          msg: "Please provide the FDA number",
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
    modelName: "products",
    indexes: [{ unique: true, fields: ["slug"] }],
  },
);

UserModel.hasMany(ProductModel);
// SurveyModel.hasMany(ProductModel);
ProductModel.belongsTo(UserModel);
// ProductModel.belongsTo(SurveyModel);

const option: any = {
  alter: SHOULD_MIGRATE,
};
const paginationOptions: any = {
  methodName: "paginate",
  primaryKeyField: "id",
};
// force: true will drop the table if it already exists
ProductModel.sync(option).then(() => {
  logger.info("Product reports table migrated");
  // Table created
});

withCursor(paginationOptions)(<any> ProductModel);
