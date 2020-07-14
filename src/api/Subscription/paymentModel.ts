import Sequelize, { Model } from "sequelize";
import { DB } from "../../shared/database";
import { SHOULD_MIGRATE } from "../../config";
import { logger } from "../../utils/logger";
import { UserModel } from "../User";

/**
 * Payments class
 * @export
 * @class
 * @property {string} payment_channel - web or mobile
 * @property {string} device - the user's device details
 */
export class PaymentModel extends Model { }
PaymentModel.init(
    {
        payment_channel: {
            type: Sequelize.STRING(120),
        },
        payment_type: {
            type: Sequelize.STRING(120),
        },
        amount: {
            type: Sequelize.STRING(120),
        },
        transaction_reference: {
            type: Sequelize.STRING(150),
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Invalid transaction reference",
                },
            },
        },
    },
    {
        sequelize: DB,
        modelName: "payments",
    },
);

UserModel.hasMany(PaymentModel);
PaymentModel.belongsTo(UserModel);

const options: any = {
    alter: SHOULD_MIGRATE,
};

// force: true will drop the table if it already exists
PaymentModel.sync(options).then(() => {
    logger.info("Payments table migrated");
    // Table created
});
