import Sequelize from "sequelize";
import { Model } from "sequelize";
import { DB } from "../../shared/database";
import { SHOULD_MIGRATE } from "../../config";
import withCursor from "sequelize-cursor-pagination";
import { logger } from "../../utils/logger";
import { SubProductModel } from './SubProductModel';

export class GeneratePinModel extends Model { }
GeneratePinModel.init(
  {
    pin_value: {
      type: Sequelize.BIGINT,
      allowNull: false,
      validate: {
        notNull: {
          msg: "You need a generated pin",
        }
      }
    },
    pin_qrcode: {
      type: Sequelize.TEXT,
      allowNull: false,
      validate: {
        notNull: {
          msg: "You need a qr code for the generated pin",
        }
      }
    },
    pin_type: {
      type: Sequelize.STRING(100),
      allowNull: false,
      validate: {
        notNull: {
          msg: "Your pin needs a type"
        }
      }
    },
    pin_status: {
      type: Sequelize.TINYINT,
      defaultValue: 0,
    },
  },
  {
    sequelize: DB,
    modelName: "generated_pin",
    indexes: [{ unique: true, fields: ["pin_value"] }],
  }
);
// UssdResponseModel.hasOne(GeneratePinModel);
SubProductModel.hasMany(GeneratePinModel);
// GeneratePinModel.belongsTo(UssdResponseModel);
GeneratePinModel.belongsTo(SubProductModel);

const option: any = {
  alter: SHOULD_MIGRATE,
};
const paginationOptions: any = {
  methodName: "paginate",
  primaryKeyField: "id",
};
// force: true will drop the table if it already exists
GeneratePinModel.sync(option).then(() => {
  logger.info("Generate Pin table migrated");
  // Table created
});

withCursor(paginationOptions)(<any>GeneratePinModel);