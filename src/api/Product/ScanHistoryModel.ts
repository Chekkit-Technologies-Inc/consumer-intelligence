import Sequelize from "sequelize";
import { Model } from "sequelize";
import { DB } from "../../shared/database";
import { SHOULD_MIGRATE } from "../../config";
import withCursor from "sequelize-cursor-pagination";
import { logger } from "../../utils/logger";
import { ProductModel } from "./ProductModel";
import { SubProductModel } from './SubProductModel';
import { GeneratePinModel } from './GeneratePinModel';

export class ScanHistoryModel extends Model { }
ScanHistoryModel.init(
  {
    scan_pin: {
      type: Sequelize.TEXT,
      allowNull: false,
      validate: {
        notNull: {
          msg: "You need a scanned pin",
        },
      },
    },
    scan_channel: {
      type: Sequelize.TEXT,
      allowNull: false,
      validate: {
        notNull: {
          msg: "You need a scan channel",
        },
      },
    },
    scan_location: {
      type: Sequelize.TEXT,
    },
    user_id: {
      type: Sequelize.TEXT,
    },
    session_id: {
      type: Sequelize.TEXT,
    },
    point_earned: {
      type: Sequelize.INTEGER,
    },
    point_status: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    scan_status: {
      type: Sequelize.TEXT,
      defaultValue: 0,
    },
  },
  {
    sequelize: DB,
    modelName: "scan_history",
  },
);
ProductModel.hasMany(ScanHistoryModel);
SubProductModel.hasMany(ScanHistoryModel);

ScanHistoryModel.belongsTo(ProductModel);
ScanHistoryModel.belongsTo(SubProductModel);

// ScanHistoryModel.belongsTo(GeneratePinModel);
ScanHistoryModel.belongsToMany(GeneratePinModel, {foreignKey: 'scan_pin', through: 'pin_value'})

const option: any = {
  alter: SHOULD_MIGRATE,
};
const paginationOptions: any = {
  methodName: "paginate",
  primaryKeyField: "id",
};
// force: true will drop the table if it already exists
ScanHistoryModel.sync(option).then(() => {
  logger.info("Scan History table migrated");
  // Table created
});

withCursor(paginationOptions)(<any>ScanHistoryModel);
