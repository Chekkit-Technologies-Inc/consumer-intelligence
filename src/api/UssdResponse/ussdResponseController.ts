// import jwt from "jsonwebtoken";
// import passport = require("passport");
import { BaseController } from "../baseController";
import { UssdService } from "./ussdService";
import { ProductService } from "../Product/ProductService";
import { sendAirtime, sendSMS } from "../../utils/africastalking";
import https from "https";
import { LIVE_AFRTLKING_API_KEY, LIVE_AFRTLKING_USERNAME } from "../../config/index";
// import { response } from "express";
// import { SurveyService } from "../Survey/surveyService";

export class UssdResponseController extends BaseController {

  private _ussdService = new UssdService();
  private _productService = new ProductService();
  // private _surveyService = new SurveyService();
  /**
* saveQuestResponse
*/
public getPhoneNumbers = async ( page: number = 1, per_page: number = 15, sort_by: string = "DESC", sort_by_field: string = "updated_at") => {
  const numbers = await this._ussdService.getPhoneNumbers(page, per_page, sort_by, sort_by_field);
  return this.sendResponse(numbers);
}

public getTextAlerts = async ( page: number = 1, per_page: number = 15, sort_by: string = "DESC", sort_by_field: string = "updated_at") => {
  const numbers = await this._ussdService.getTextAlerts(page, per_page, sort_by, sort_by_field);
  return this.sendResponse(numbers);
}

public getUssdStats = async ( ) => {
  const numbers = await this._ussdService.getUssdStats();
  return this.sendResponse(numbers);
}

public getCovidUssdTestStats = async ( ) => {
  const numbers = await this._ussdService.getCovidUssdTestStats();
  return this.sendResponse(numbers);
}

  public sendAlert = async (data: any) => {
    console.log(data.send_immediately);
    // return true;
    let survey = undefined;
    if(data.send_immediately == 1){
      survey = await this._ussdService.sendAlert(data);
    }else{
      survey = await this._ussdService.saveAlert(data);
    }
    return this.sendResponse(survey);
  }


  public saveQuestResponse = async (data: any) => {
    const survey_quest = await this.QuestResponse(data);
    return this.sendResponse(survey_quest);
  }
  public requestUssd = async (data: any) => {
    const ussd_req = await this._ussdService.requestUssd(data);
    return ussd_req;
  }
  public returnUssdAnswer = async (data: any) => {
    const ussd_req = await this._ussdService.returnUssdAnswer(data.n, data.p);
    return ussd_req;
  }

  public returnUssdQuestionAnswer = async (data: any) => {
    const ussd_req = await this._ussdService.returnUssdQuestionAnswer(data.q);
    return ussd_req;
  }

  public savePhoneNumber = async (data: any) => {
    const ussd_req = await this._ussdService.savePhoneNumber(data);
    return ussd_req;
  }
  public saveCovidFixedResponses = async (data: any) => {
    const ussd_req = await this._ussdService.saveCovidFixedResponses(data);
    return ussd_req;
  }
  public updateUssdData = async (phone_number: any, sessionId, survey_id: any,) => {
    const ussd_update = await this._ussdService.updateUssdData(phone_number, sessionId, survey_id);
    return ussd_update;
  }
  public updateUssdRewardType = async (phone_number: any, sessionId, reward_id: any) => {
    const ussd_update = await this._ussdService.updateUssdRewardType(phone_number, sessionId, reward_id);
    return ussd_update;
  }
  public productDetails = async (data: any) => {
    const prod_dtls = await this._productService.verifyPinUssd({
      pin_value: data.text, scan_channel: data.scan_channel, user_id: data.user_id, session_id: data.session_id,
    });
    return prod_dtls;
  }
  public getQuestions = async (text: any) => {
    const data = text.split("*");
    const prod_dtls = await this._productService.getQuestions(data[0]);
    return prod_dtls;
  }
  public getNoLabelQuestions = async (text: any) => {
    // const data = text.split("*");
    const prod_dtls = await this._productService.getNoLabelQuestions(text);
    return prod_dtls;
  }
  public getQuestionsByType = async (text: any,type) => {
    // const data = text.split("*");
    const prod_dtls = await this._productService.getQuestionsByType(text,type);
    return prod_dtls;
  }
  public getUserAnsweredQuestions = async (p: any,type) => {
    // const data = text.split("*");
    const prod_dtls = await this._ussdService.getUserAnsweredQuestions(p,type);
    return prod_dtls;
  }
  public returnScanDefault = async (pin_value: any) => {
    const update = await this._productService.returnScanDefault(pin_value);
    return this.sendResponse(update);
  }
  public processReward = async (text: any, Alldata: any) => {
    const data = text.split("*");
    const rewardData = await this._productService.processReward(data[0]);
    if (rewardData) {
      if (rewardData[0].reward_type == "Airtime") {
        let amount = Number(rewardData[0].reward_value);
        let airtimeData = await sendAirtime([{
          phoneNumber: Alldata.phoneNumber, currencyCode: "NGN", amount,
        }]);
        if (airtimeData) {
          await this._productService.deductAirtimeReward(rewardData[0].user_id, amount);
          await this._productService.updateScanHistory({
            point_earned: 500, point_status: 1, user_id: Alldata.phoneNumber,
            session_id: Alldata.sessionId, pin_value: data[0],
          });
          await this._ussdService.updateUssdRewardType(Alldata.phoneNumber,
            Alldata.sessionId, rewardData[0].reward_type);
          return { status: true, airtimeData, amount, type: "Airtime" };
        } else {
          return { status: false, data: "Be patient, you will receive your reward soon!", type: "Airtime" };
        }
      } else if (rewardData[0].reward_type == "Merchandize") {
        let redemption_points = await this._productService.getAllRedemptionPoints(rewardData[0].user_id);
        if (redemption_points) {
          let red_details = "";
          redemption_points.forEach((element) => {
            red_details += `${element.point_location}(${element.point_address}),`;
          });
          let smsBody = `Thank you for taking our survey,` +
            `these are the Redemption points for your reward: ${red_details}`;
          let send_result = await sendSMS({
            to: Alldata.phoneNumber, message: smsBody,
          });
          if (send_result) {
            return {
              status: true,
              data: "Thank you for taking our survey,meessage has been sent to your phone number.",
              type: "Merchandize",
            };
          } else {
            return {
              status: true,
              data: "Thank you for taking our survey,meessage has been sent to your phone number.",
              type: "Merchandize",
            };
          }
        }
        return { status: false, data: "No redemption points created by the company." };
      } else {
        let loyalty_point = await this._productService.getAloyaltyPoints(rewardData[0].user_id);
        if (loyalty_point.loyalty_reward == "Airtime") {
          let amount = Number(loyalty_point.loyalty_reward_value);
          let airtimeData = await sendAirtime([{
            phoneNumber: Alldata.phoneNumber, currencyCode: "NGN", amount,
          }]);
          if (airtimeData) {
            console.log("rewardData[0]>>>>>>>", data);
            await this._productService.updateScanHistory({
              point_earned: 500, point_status: 1, user_id: Alldata.phoneNumber,
              session_id: Alldata.sessionId, pin_value: data[0],
            });
            return { status: true, airtimeData, amount, type: "You have been credited with Reward point has been", };
          } else {
            return { status: false, data: "Be patient, you will recieve your reward soon!", type: "Airtime", };
          }
        } else {
          let redemption_points = await this._productService.getAllRedemptionPoints(rewardData[0].user_id);
          let red_details = "";
          redemption_points.forEach((element) => {
            red_details += `${element.point_location}(${element.point_address}),`;
          });
          let smsBody = `Thank you for taking part in our survey,` +
            `these are the Redemption points for your reward: ${red_details}`;
          let send_result = await sendSMS({
            to: Alldata.phoneNumber, message: smsBody,
          });
          if (send_result) {
            return {
              status: true,
              data: "Thank you for taking taking our survey,meessage has been sent to your phone number.",
              type: "loyalty_point",
            };
          } else {
            return {
              status: true,
              data: "Thank you for taking taking our survey,meessage has been sent to your phone number.",
              type: "loyalty_point",
            };
          }
        }
      }
    }
    return { status: false, data: "No reward attached to this survey." };
  }

  public processRewardNoLabel = async (text: any, Alldata: any) => {
    let amount = 50;
    let airtimeData = await sendAirtime([{
      phoneNumber: Alldata.phoneNumber, currencyCode: "NGN", amount,
    }]);

    console.log(airtimeData);
  }
  public savePoints = async (text: any, Alldata: any) => {
    let data = Alldata.text;
    console.log("Alldata>>>>>>>>>1", data);
    data = data.split("*");
    console.log("Alldata>>>>>>>>>", data[0]);
    let update = await this._productService.updateScanHistory({
      point_earned: 500, point_status: 1, user_id: Alldata.phoneNumber,
      session_id: Alldata.sessionId, pin_value: data[0],
    });
    if (update) {
      return { status: true };
    }
    return { status: false, data: "Failed to save your point." };
  }
  public updateussdResponse = async (data: any) => {
    if(data.answer){
      await this._ussdService.updateNoSurveyUssdResponse(data);
    }else{
      await this._ussdService.updateussdResponse(data);
    }
    return { status: true };
  }
  public QuestResponse = async (data: any) => {
    return this.sendResponse("Response submitted.");
  }
  public airtimeResponse = async (data: any) => {
    console.log("airtime", data);
    return "";
  }
  /**
   * testurl
   */
  public testurl() {
    let data = JSON.stringify({
      username: LIVE_AFRTLKING_USERNAME,
      recipients: [
        {
          phoneNumber: "+2348139719106",
          currencyCode: "NGN",
          amount: "50",
        }],
    });
    console.log("yeah", data);
    const options = {
      hostname: "api.africastalking.com",
      path: "/version1/airtime/send",
      method: "POST",
      json: true,
      headers: {
        "apiKey": LIVE_AFRTLKING_API_KEY,
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json",
      },
    };

    const req = https.request(options, (res) => {
      console.log(`statusCode: ${res.statusCode}`);
      console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
      res.setEncoding("utf8");
      res.on("data", (d) => {
        process.stdout.write(d);
      });
    });

    req.on("error", (error) => {
      console.error(error);
    });

    req.write(data);
    req.end();
  }
  // response = `CON Wetin be ya location: \n  1. Lagos \n 2. FCT \n 3. Kano  \n 4. Rivers  \n 5. Others`;

  returnFixedLocation(a){
    let response = '';
      if(a == '1'){
        response = 'Lagos'
      }else if(a == '2'){
        response = 'FCT'
      }else if(a == '3'){
        response = 'Kano'
      }else if(a == '4'){
        response = 'Rivers'
      }else{
        response = 'Others'
      }
    return response;
  }
  returnFixedQuestionAnswer(n,a){
    let response = '';
    if(n == 1){
      if(a == '1'){
        response = 'male'
      }else{
        response = 'female'
      }
    }else{
      if(a == '1'){
        response = '5 - 19'
      }else if(a == '2'){
        response = '20 - 29'
      }else if(a == '3'){
        response = '30 - 39'
      }else{
        response = 'Above 40 years'
      }
    }
    return response;
  }
}
