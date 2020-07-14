import jwt from "jsonwebtoken";
import passport = require("passport");
import { BaseController } from "../baseController";
import { JWT_SECRET } from "./../../config";
import { AppError } from "./../../utils/app-error";
import { IUser, UserModel } from "./../User";
import { IUserModel } from "../../interfaces";
import { sendPasswordReset, sendEmailVerificationCode } from "../../utils/email";
import crypto from "crypto";
import bcryptjs from "bcryptjs";
import uuidv4 from "uuid/v4";
// import { surveyQuestResponseModel } from "../SurveyQuestion";
import { ProductService } from "../Product/ProductService";
import { SubProductModel } from "../Product";
import { surveyQuestResponseModel } from "../UssdResponse/surveyQuestResponseModel";
import { SurveyModel } from "../Survey/SurveyModel";
import { RewardModel } from "../SurveyReward/RewardModel";
import { SurveyQuestModel } from "../SurveyQuestion/SurveyQuestModel";
import { RaffleEntryModel } from "../Survey/RaffleEntryModel";
import { UserService } from "../User/userService";
// import { sendSMS } from "../../utils/africastalking";
import { sendText } from "../../utils/twilio";
import { IAppUser } from "../User/IUser";

export class AuthController extends BaseController {
  private _productService = new ProductService();
  private _userService = new UserService();
  
  public login = async (req, res, next) => {
    return new Promise((resolve, reject) => {
      return passport.authenticate("login", (err, user, info) => {
        if (!user || err) {
          return reject(new AppError(info.message));
        }
        return req.login(user, { session: false }, async (error) => {
          if (error) {
            return reject(new AppError(error));
          }
          const token = await this.generateToken(user);
          await UserModel.update({ auth_key: token }, { where: { username: req.body.username } });
          const userData = await this._userService.getUser(req.body.username);
          if (userData.verified) {
            resolve(this.sendResponse({ user: userData, token }));
          } else {
            return reject(
              new AppError("User not verified, Please use the token sent to your email address to verify your account."),
            );
          }
        });
      })(req, res, next);
    });
  }
  public appLogin = async (req, res, next) => {
    return new Promise((resolve, reject) => {
      return passport.authenticate("appLogin", (err, user, info) => {
        if (!user || err) {
          return reject(new AppError(info.message));
        }
        return req.login(user, { session: false }, async (error) => {
          if (error) {
            return reject(new AppError(error));
          }
          const token = await this.generateToken(user);
          let username = req.body.username;
          username = username.replace(/^0/, "");
          await UserModel.update({ auth_key: token }, { where: { username } });
          const userData = await this._userService.getAppUser(username);
          if (userData.verified) {
            userData.username = userData.phone_number;
            resolve(this.sendResponse({ user: userData, token }));
          } else {
            return reject(
              new AppError("User not verified, Please use the pin sent to your phone number to verify your account."),
            );
          }
        });
      })(req, res, next);
    });
  }
  public signup = async (user: IUser) => {
    const token = await this.generateToken(user);
    const email_verification_code = this.generateEmailVerificationCode();
    const unique_code = this.generateUniqueIdentifier(3);
    return UserModel.update({
      auth_key: token, email_verification_code, unique_code,
    },
      { where: { username: user.username } }).then(async () => {
        const newUser = await UserModel.findOne({
          where: { username: user.username },
          attributes: { exclude: ["password", "auth_key", "deleted_at"] },
        });
        let email_sent = await sendEmailVerificationCode(email_verification_code, user);
        if (!email_sent) {
          throw new AppError("An error occurred");
        }
        const refreshToken = await this.generateRefreshToken(user);
        return this.sendResponse({ user: newUser, token, refreshToken }, "User registration successful");
      });
  }
  public appSignup = async (user: IAppUser) => {
    const token = await this.generateAppToken(user);
    const email_verification_code = this.generateUniqueIdentifier(6);
    const unique_code = this.generateUniqueIdentifier(3);
    return UserModel.update({
      auth_key: token,
      email_verification_code,
      unique_code,
    },
      { where: { phone_number: user.phone_number } }).then(async () => {
        const newUser = await UserModel.findOne({
          where: { phone_number: user.phone_number },
          attributes: { exclude: ["password", "auth_key", "deleted_at"] },
        });
        let sms_sent = await sendText({
          to: "+234" + user.phone_number, message: `Here's the otp to verify your account: ${email_verification_code}`,
        });
        if (!sms_sent) {
          throw new AppError("An error occurred");
        }
        const refreshToken = await this.generateRefreshToken(user);
        return this.sendResponse({ user: newUser, token, refreshToken }, "User registration successful");
      });
  }
  /**
* saveQuestResponse
*/
  public saveQuestResponse = async (id: number, surveyId: number, quest_id: number, data: any) => {
    const survey_quest = await this.QuestResponse(id, surveyId, quest_id, data);
    return this.sendResponse(survey_quest);
  }
  public QuestResponse = async (id: number, surveyId: number, quest_id: number, body: any) => {
    let survey = await SurveyModel.findOne({ where: { id: surveyId } });
    let subProduct = await SubProductModel.findOne({ where: { survey_id : surveyId } });
    let rewardModel = await RewardModel.findOne({ where: { id : subProduct.rewardId } });


    console.log(rewardModel)
    if (survey) {
      const user = await UserModel.findByPk(id);
      let question = await SurveyQuestModel.findOne({ where: { id: quest_id } });
      if (question) {
        let dataObjct = {
          choice: body.choice,
          surveyId,
          surveysQuestionId: quest_id,
        };
        const response = await surveyQuestResponseModel.create(dataObjct);
        const point_updated = await UserModel.update({ loyalty_point: Number(user.loyalty_point) + 2 },
          { where: { username: user.username } });


        if(rewardModel.reward_type == 'Raffle'){
          let entryObjct = {
            user_id: user.id,
            phone_number: user.username,
            survey_reward_id: rewardModel.id,
            survey_id: surveyId,
            raffle_draw_id: rewardModel.id,
          };
          
          RaffleEntryModel.create(entryObjct);
        }
        if (response && point_updated) {
          return this.sendResponse("Response submitted.");
        }
        throw new AppError("Could not create response");
      }
      throw new AppError("Survey question not found");
    }
    throw new AppError("Could not create response");
  }
  /**
* verifyPin
*/
  public verifyPin = async (data: any) => {
    const product_details = await this._productService.verifyPin(data);
    console.log(product_details)
    return this.sendResponse(product_details);
  }
  public refreshTokens = async (data) => {
    const user = <IUserModel>await UserModel.findOne({
      where: { refresh_token: data.refreshToken },
    });
    if (user) {
      const token = await this.generateToken(user);
      const refreshToken = await this.generateRefreshToken(user);
      return this.sendResponse({ token, refreshToken });
    }
    throw new AppError("Invalid refresh token sent", "refreshToken", 401);
  }

  /**
   * logout
   */
  public logout = async (user: any) => {
    const updated = await UserModel.update(
      { player_id: null },
      { where: { id: user.id } },
    );
    if (updated) {
      return this.sendResponse("Logged out successfully.");
    }
  }

  /**
   * requestPasswordReset
   */
  public requestPasswordReset = async (email: string) => {
    const user = await UserModel.findOne({
      where: { email },
    });

    if (!user) {
      throw new AppError("No user exists with that email address.");
    }

    const password_reset_code = this.generatePasswordResetCode();
    const updated = await UserModel.update(
      { password_reset_code },
      {
        where: { id: user.id },
      },
    );
    if (!updated) {
      throw new AppError("An error occurred");
    }
    let sent = await sendPasswordReset(password_reset_code, user);
    if (!sent) {
      throw new AppError("An error occurred");
    }

    return this.sendResponse(sent);
  }

  /**
   * verifyResetCode
   */
  public verifyResetCode = async (code: string) => {
    const user = await UserModel.findOne({
      where: { password_reset_code: code },
    });
    if (!user) {
      throw new AppError("Invalid password reset code");
    }
    return this.sendResponse("Password reset code is valid");
  }
  /**
   * verifyUserAccount
   */
  public verifyUserAccount = async (code: string) => {
    const user = await UserModel.findOne({
      where: { email_verification_code: code },
    });
    if (!user) {
      throw new AppError("Invalid email verification code");
    }
    const updated = await UserModel.update(
      { verified: 1, email_verification_code: null },
      {
        where: { id: user.id },
      },
    );
    if (!updated) {
      throw new AppError("Could not verify your account");
    }
    return this.sendResponse("Account verified successfully");
  }
  /**
   * resetPassword
   */
  public resetPassword = async (code: string, password: string) => {
    if (!code || !password) {
      throw new AppError(
        "Please provide both your password reset code and new password",
      );
    }

    const user = await UserModel.findOne({
      where: { password_reset_code: code },
    });
    if (!user) {
      throw new AppError("User not found/you have not requested for password reset.");
    }

    const hash = bcryptjs.hashSync(password, 10);
    const updated = await UserModel.update(
      { password: hash, password_reset_code: null },
      {
        where: { id: user.id },
      },
    );
    if (!updated) {
      throw new AppError("Could not update password");
    }

    return this.sendResponse("Password reset successfully");
  }

  /**
   * generates JWT from user details
   *
   * @private
   * @param {IUser} user authenticated user
   * @returns {string} signed JWT
   * @memberof AuthController
   */
  private async generateToken(user: IUser) {
    const body = { id: user.id, username: user.username };
    const token = jwt.sign({ user: body }, JWT_SECRET, { expiresIn: "3d" });
    const _user = UserModel.update(
      { auth_key: token },
      { where: { username: user.username } },
    );
    if (_user) {
      return token;
    }
  }
  private async generateAppToken(user: IAppUser) {
    const body = { id: user.id, phone_number: user.phone_number };
    const token = jwt.sign({ user: body }, JWT_SECRET, { expiresIn: "31556952" });
    const _user = UserModel.update(
      { auth_key: token },
      { where: { phone_number: user.phone_number } },
    );
    if (_user) {
      return token;
    }
  }
  // public markAsRead = async ( id,user: any) => {

  public updatePlayerId = async(data) =>{
    const _user = UserModel.update(
      { player_id: data.player_id },
      { where: { id: data.user_id } },
    );
    if (_user) {    
      return this.sendResponse(_user);

    }
  }
  private generateUniqueIdentifier(length) {
    let text = "";
    let possible = "1234567890";
    for (let i = 0; i < length; i++) {
      let sup = Math.floor(Math.random() * possible.length);
      text += i > 0 && sup == i ? "0" : possible.charAt(sup);
    }
    return Number(text);
  }

  private generatePasswordResetCode = () => {
    return crypto.randomBytes(3).toString("hex");
  }
  private generateEmailVerificationCode = () => {
    return crypto.randomBytes(5).toString("hex");
  }

  private async generateRefreshToken(user: any) {
    const refreshToken = uuidv4();
    const _user = await UserModel.update(
      { refresh_token: refreshToken },
      { where: { id: user.id } },
    );
    if (_user) {
      return refreshToken;
    }
  }
}
