import Sequelize from "sequelize";
import { Model } from "sequelize";
import { DB } from "../../shared/database";
import { SHOULD_MIGRATE } from "../../config";
import withCursor from "sequelize-cursor-pagination";
import { logger } from "../../utils/logger";
import { SubProductModel } from './SubProductModel';

export class PinExportHistoryModel extends Model { }
PinExportHistoryModel.init(
  {
    startIndex: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    endIndex: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    quantity: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    user_id: {
      type: Sequelize.INTEGER,
    },
    sub_product_id: {
      type: Sequelize.INTEGER,
    },
  },
  {
    sequelize: DB,
    modelName: "pin_export_history",
    // indexes: [{ unique: true, fields: ["pin_value"] }],
  }
);
// UssdResponseModel.hasOne(GeneratePinModel);
SubProductModel.hasMany(PinExportHistoryModel);
// GeneratePinModel.belongsTo(UssdResponseModel);
PinExportHistoryModel.belongsTo(SubProductModel);

const option: any = {
  alter: SHOULD_MIGRATE,
};
const paginationOptions: any = {
  methodName: "paginate",
  primaryKeyField: "id",
};
// force: true will drop the table if it already exists
PinExportHistoryModel.sync(option).then(() => {
  logger.info("Pin Export History table migrated");
  // Table created
});

withCursor(paginationOptions)(<any>PinExportHistoryModel);