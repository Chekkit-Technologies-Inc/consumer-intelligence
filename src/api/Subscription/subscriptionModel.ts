import Sequelize, { Model } from "sequelize";
import { DB } from "../../shared/database";
import { SHOULD_MIGRATE } from "../../config";
import { logger } from "../../utils/logger";
import { UserModel } from "../User";

/**
 * Subscription class
 * @export
 * @class
 * @property {number} coin_balance - the user's coin balance
 * @property {number} active_subscription - the type of subscription the user is on
 */
export class SubscriptionModel extends Model { }
SubscriptionModel.init(
    {
        account_balance: {
            type: Sequelize.STRING(100),
            defaultValue: 0,
        },
        gen_pins_balance: {
            type: Sequelize.STRING(100),
            defaultValue: 0,
        },
        rewards_balance: {
            type: Sequelize.STRING(100),
            defaultValue: 0,
        },
        account_status: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
        },
        gen_pins_status: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
        },
        rewards_status: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
        },
    },
    {
        sequelize: DB,
        modelName: "subscriptions",
    },
);

UserModel.hasOne(SubscriptionModel);
SubscriptionModel.belongsTo(UserModel);

const options: any = {
    alter: SHOULD_MIGRATE,
};

// force: true will drop the table if it already exists
SubscriptionModel.sync(options).then(() => {
    logger.info("Subscriptions table migrated");
    // Table created
});
