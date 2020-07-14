import Sequelize, { Model } from "sequelize";
import { DB } from "../../shared/database";
import { logger } from "../../utils/logger";
import { SHOULD_MIGRATE } from "../../config";

export class UserModel extends Model { }
UserModel.init(
    {
        username: {
            type: Sequelize.STRING(50),
            unique: {
                name: "username",
                msg: "An account already exists with this username",
            },
            validate: {
                is: /^[a-zA-Z0-9._-]{3,16}$/i,
                notEmpty: {
                    msg: "Username cannot be empty",
                },
            },
        },
        email: {
            type: Sequelize.STRING(70),
            unique: {
                name: "email",
                msg: "An account already exists with this email address.",
            },
            validate: {
                isEmail: { msg: "Please check this is a valid email" },
                notEmpty: { msg: "email can't be empty" },
            },
        },
        phone_number: {
            type: Sequelize.STRING(25),
            validate: {
                isNumeric: {
                    msg: "Please confirm phonenumber contains valid characters",
                },
            },
        },
        password: {
            type: Sequelize.STRING(200),
        },
        first_name: {
            type: Sequelize.STRING(30),
            validate: {
                min: 2,
            },
        },
        last_name: {
            type: Sequelize.STRING(30),
            validate: {
                min: 2,
            },
        },
        gender: {
            type: Sequelize.STRING(20),
        },
        membership_type: {
            type: Sequelize.STRING(20),
            defaultValue: "user",
        },
        access_level: {
            type: Sequelize.INTEGER(),
            defaultValue: 1,
        },
        refresh_token: {
            type: Sequelize.STRING(150),
            unique: {
                name: "refresh_token",
                msg: "Duplicate refresh token",
            },
            allowNull: true,
        },
        email_verification_code: {
            type: Sequelize.STRING(150),
        },
        age_range: {
            type: Sequelize.STRING(50),
        },
        unique_code: {
            type: Sequelize.INTEGER,
        },
        loyalty_point: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
        },
        player_id: {
            type: Sequelize.STRING(150),
            allowNull: true,
        },
        company_rep: {
            type: Sequelize.STRING(150),
        },
        password_reset_code: {
            type: Sequelize.STRING(6),
            unique: {
                name: "password_reset_code",
                msg: "Duplicate password reset code",
            },
        },
        verified: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
        },
        socket_id: {
            type: Sequelize.STRING(50),
        },
        auth_key: {
            type: Sequelize.TEXT,
        },
    }, {
    sequelize: DB,
    modelName: "users",
},
);

const options: any = { alter: SHOULD_MIGRATE };

// force: true will drop the table if it already exists
UserModel.sync(options).then(() => {
    logger.info("Users table migrated");
    // Table created
});
