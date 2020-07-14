import bcryptjs from "bcryptjs";
import crypto from "crypto";
import _ from "lodash";
import { ExtractJwt, Strategy as JWTstrategy } from "passport-jwt";
import { Strategy as localStrategy } from "passport-local";
import { UserModel } from "../api/User";
import { IUser } from "./../api/User/IUser";
import { JWT_SECRET } from "./../config/index";
import { AppError } from "./../utils/app-error";
import { ProfileModel } from "../api/Profile";
import { IAppUser } from "../api/User/IUser";
import { Op } from "sequelize";
import { SubscriptionModel } from "../api/Subscription/subscriptionModel";

export const signupStrategy = new localStrategy(
  {
    usernameField: "username",
    passwordField: "password",
    passReqToCallback: true,
  },
  async (req, username, password, done) => {
    console.log(req.body);
    try {
      const body: any = _.pick(req.body, [
        "username",
        "email",
        "phone_number",
        "first_name",
        "last_name",
        "gender",
        "company_rep",
      ]);
      // TODO: check for phone number and email address
      const exUser = await UserModel.findOne({
        where: { username },
      });

      const exUserByEmail = await UserModel.findOne({
        where: {
          email: body.email,
        },
      });

      if (exUser) {
        return done(
          new AppError(`An account with that username already exists.`),
        );
      } else if (exUserByEmail) {
        return done(new AppError(`An account with that email already exists`));
      }

      const passwordHash = bcryptjs.hashSync(password, 10);
      const emailVerificationCode = generateEmailVerificationCode();
      const user = await UserModel.create({
        username,
        password: passwordHash,
        membership_type: "company",
        email_verification_code: emailVerificationCode,
        ...body,
      });
      console.log("users",user);
      const profile = await ProfileModel.create();
      const subscription = await SubscriptionModel.create();
      await user.setProfile(profile);
      await user.setSubscription(subscription);
      // Send the user information to the next middleware
      return done(null, user);
    } catch (error) {
      done(Error(error));
    }
  },
);
export const appSignupStrategy = new localStrategy(
  {
    usernameField: "phone_number",
    passwordField: "password",
    passReqToCallback: true,
  },
  async (req, phone_number, password, done) => {
    console.log(req.body);
    try {
      const body: any = _.pick(req.body, [
        "phone_number",
        "first_name",
        "email",
        "age_range",
      ]);
      console.log(body);
      // TODO: check for phone number and email address
      const exUserByEmail = await UserModel.findOne({
        where: {
          email: body.email,
        },
      });

      const exUserByPhone = await UserModel.findOne({
        where: {
          [Op.or]: [
            {
              phone_number: body.phone_number,
            },
            {
              username: body.phone_number,
            },
          ],
        },
      });
      if (exUserByPhone) {
        return done(
          new AppError(`An account with that phone number already exists.`),
        );
      } else if (exUserByEmail) {
        return done(new AppError(`An account with that email already exists`));
      }
      const passwordHash = bcryptjs.hashSync(password, 10);
      const emailVerificationCode = generateEmailVerificationCode();
      const user = await UserModel.create({
        phone_number,
        username: phone_number,
        password: passwordHash,
        membership_type: "user",
        email_verification_code: emailVerificationCode,
        ...body,
      });
      const profile = await ProfileModel.create();
      await user.setProfile(profile);
      // Send the user information to the next middleware
      return done(null, user);
    } catch (error) {
      done(Error(error));
    }
  },
);
export const loginStrategy = new localStrategy(
  {
    usernameField: "username",
    passwordField: "password",
  },
  async (username, password, done) => {
    try {
      let loginFailed = false;
      const user = <IUser> await UserModel.findOne({ where: { username } });
      if (user) {
        const validate = await bcryptjs.compare(password, user.password);
        if (!validate) {
          loginFailed = true;
        }
      } else {
        loginFailed = true;
      }
      if (loginFailed) {
        return done(null, false, {
          message: "Incorrect username or password.",
        });
      }

      // Send the user information to the next middleware
      return done(null, user, { message: "Logged in Successfully" });
    } catch (error) {
      return done(error);
    }
  },
);

export const appLoginStrategy = new localStrategy(
  {
    usernameField: "username",
    passwordField: "password",
  },
  async (username, password, done) => {
    username = username.replace(/^0/, "");
    console.log("username", username);
    try {
      let loginFailed = false;
      const user = <IAppUser> await UserModel.findOne({
        where: {
          [Op.or]: [{
            username,
          }, {
            phone_number: username,
          }],
        },
      });
      if (user) {
        user.username = user.phone_number;
        const validate = await bcryptjs.compare(password, user.password);
        if (!validate) {
          loginFailed = true;
        }
      } else {
        loginFailed = true;
      }
      if (loginFailed) {
        return done(null, false, {
          message: "Incorrect phone number or pin.",
        });
      }

      // Send the user information to the next middleware
      return done(null, user, { message: "Logged in Successfully" });
    } catch (error) {
      return done(error);
    }
  },
);
export const jwtStrategy = new JWTstrategy(
  {
    secretOrKey: JWT_SECRET,
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  },
  async (token, done) => {
    try {
      // Pass the user details to the next middleware
      return done(null, token.user);
    } catch (error) {
      done(error);
    }
  },
);

/**
 * generates unique code for email verification
 * @returns {string} hexadecimal string
 */
function generateEmailVerificationCode() {
  const str = crypto.randomBytes(20).toString("hex");
  return str;
}
