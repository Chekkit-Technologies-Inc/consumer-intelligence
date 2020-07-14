import { UssdResponseModel } from "./ussdResponseModel";
import { SmsAlertModel } from "../Survey/SmsAlertModel";
import { SavedPhoneNumbersModel } from "../Survey/SavedPhoneNumbersModel";
import { request } from "request";
import { Op } from "sequelize";
import { AppError } from "../../utils/app-error";
import { sendSMS } from "../../utils/africastalking";
import { SurveyQuestModel } from "../SurveyQuestion";
import { RawUssdResponseModel } from "../UssdResponse/RawUssdResponseModel";

export class UssdService {


  /**
   * Get Phone numbers
   * @param {number} page current page number
   * @param {number} per_page number of results per page
   */
    public getPhoneNumbers = async (page: number, per_page: number = 1000, sort_by: string, sort_by_field: string) => {
        const offset: number = this.getOffsetValue(page, per_page);
        const phoneNumbers = await SavedPhoneNumbersModel.findAll({
        offset,
        });
        const phoneCount = await SavedPhoneNumbersModel.count();

        if (phoneNumbers) {
        const metadata = this.buildMetaData(phoneNumbers, page, phoneCount);
        return {
            phoneNumbers,
            metadata,
        };
        }
        throw new AppError("No phone number found", null, 401);
    }

    public getUssdStats = async () => {
        let generateStats = {totalResponsesCount:0,totalSignupCount:0,surveyResponsesCount:0, quizResponsesCount:0}
        //   console.log(n);
          let r = await UssdResponseModel.findAll({
            where: {  type: 3},
            raw: true,
          });
          
          let p = await UssdResponseModel.findAll({
            where: {  type: 4},
            raw: true,
          });
        //   var today = new Date();
        //   var todayMidnight = new Date();
        //   todayMidnight.setHours(0,0,0,0);

        // //   let startStr = JSON.stringify(today);
        // //   let endStr = JSON.stringify(todayMidnight);

        //   console.log(this.date2str(today,'yyyy-MM-dd h:m:s'));
        // //   console.log(todayMidnight);

          
        //   let s1 = await SavedPhoneNumbersModel.findAll({
        //     where: { 
        //         created_at: { 
        //           "$between": [this.date2str(todayMidnight,'yyyy-MM-dd h:m:s'),this.date2str(today,'yyyy-MM-dd h:m:s')]
        //         }},
        //     raw: true,
        //   });

          generateStats.totalSignupCount  = await SavedPhoneNumbersModel.count();
          generateStats.surveyResponsesCount = r.length;
          generateStats.quizResponsesCount = p.length;
          generateStats.totalResponsesCount = p.length + r.length;;
        //   2020-04-15 10:53:58
        //   console.log(s1)      
        //   console.log(generateStats)      
          return generateStats;
    //   const offset: number = this.getOffsetValue(page, per_page);
    //   const smsAlerts = await SmsAlertModel.findAll({
    //     offset,
    //   });
    //   const smsCount = await SmsAlertModel.count();
  
    //   if (smsAlerts) {
    //     const metadata = this.buildMetaData(smsAlerts, page, smsCount);
    //     return {
    //       smsAlerts,
    //       metadata,
    //     };
    //   }
    //   throw new AppError("No phone number found", null, 401);
    }

    public getCovidUssdTestStats = async () => {
        // let generateStats = {totalTestCount:0,totalSignupCount:0,surveyResponsesCount:0, quizResponsesCount:0}
        //   console.log(n);
          let r = await RawUssdResponseModel.findAll({
            raw: true,
          });
        
        let cResponses = [];
          let env = this;
        r.forEach(function(entry) {
            if(env.returnStrAfterFirstComma(entry.answer) == '1,1,1' || env.returnStrAfterFirstComma(entry.answer) == '1,1,2' || env.returnStrAfterFirstComma(entry.answer) == '1,2,2'){
                console.log(entry.answer);
                let t = {answer : entry.answer, phoneNumber : entry.phone_number, testResult : 1};
                cResponses.push(t);
            }else{
                let t = {answer : entry.answer, phoneNumber : entry.phone_number, testResult : 0};
                cResponses.push(t);
            }
        });
        
          console.log(cResponses)      
   
          return cResponses;
    }
    
    returnStrAfterFirstComma(str) {
        return str.replace(/^[^,]+, */, '');
    }

    date2str(x, y) {
        var z = {
            M: x.getMonth() + 1,
            d: x.getDate(),
            h: x.getHours(),
            m: x.getMinutes(),
            s: x.getSeconds()
        };
        y = y.replace(/(M+|d+|h+|m+|s+)/g, function(v) {
            return ((v.length > 1 ? "0" : "") + z[v.slice(-1)]).slice(-2);        
        });
    
        return y.replace(/(y+)/g, function(v) {
            return x.getFullYear().toString().slice(-v.length)
        });
    }

    public getTextAlerts = async (page: number, per_page: number = 1000, sort_by: string, sort_by_field: string) => {
        const offset: number = this.getOffsetValue(page, per_page);
        const smsAlerts = await SmsAlertModel.findAll({
          offset,
        });
        const smsCount = await SmsAlertModel.count();
    
        if (smsAlerts) {
          const metadata = this.buildMetaData(smsAlerts, page, smsCount);
          return {
            smsAlerts,
            metadata,
          };
        }
        throw new AppError("No phone number found", null, 401);
      }
  
    // send sms to phone number
    public sendAlert = async (data: any) => {
        // const phoneNumbers = await SavedPhoneNumbersModel.findAll({
        //     raw: true,
        // });
        // const numbers = phoneNumbers.map(n => n.phone);

        // console.log(numbers);
        console.log(data);
        // let n = ['+2348172732192', '+2348138491667']
        let n = '+2348172732192';
        // let smsBody = `Thank you for taking our survey, please visit your closest indomie shop for your reward.`;

        let send_result = await sendSMS({
            to: n, message: data.content,
        });

        if(data.should_save == 1)
            this.saveAlert(data);

        console.log(send_result)
        const sent = true
        if (sent) {
            return sent;
        }
        return false;
    }
    
    // save sms alert
    public saveAlert = async (data: any) => {
        let dat_objct = {
            content: data.content,
            time: data.time?data.time:'',
        };
        const saved = await SmsAlertModel.create(dat_objct);
        if (saved) {
            return saved;
        }
        return false;
    }

    // private VALUE_YES: number = 1;
    public requestUssd = async (data: any) => {
        let dat_objct = {
            phone_number: data.phoneNumber,
            clientCode: data.clientCode?data.clientCode:'',
            questionNumber: data.questionNumber?data.questionNumber:'',
            session_id: data.sessionId?data.sessionId:'',
            type: data.type?data.type:1,
        };
        console.log(data);

        const saved = await UssdResponseModel.create(dat_objct);
        if (saved) {
            return saved;
        }
        return false;
    }

    public getUserAnsweredQuestions = async (p, t) => {
        //   console.log(n);
          let ans_check = await UssdResponseModel.findAll({
            where: {  type: t, phone_number:p},
            raw: true,
            attributes: {
              include: [
                "id",
              ],
            },
          });
      
        //   console.log(ans_check)      
          return ans_check;
    }


    public returnUssdAnswer = async (n: any, p) => {
        //   console.log(n);
          let ans_check = await UssdResponseModel.findOne({
            where: {  session_id: n, phone_number:p},
            raw: true,
            order: [
                ['id', 'DESC'],
            ],
          });
      
        //   console.log(ans_check)      
          return ans_check;
    }

    public returnUssdQuestionAnswer = async ( q) => {
    //   console.log(n);
      let ans_check = await SurveyQuestModel.findOne({
        where: { id:q},
        raw: true,
      });
  
    //   console.log(ans_check)      
      return ans_check;
    }

    public updateUssdData = async (phone_number: any, session_id, survey_id: any) => {
        if (Number(survey_id) > 0) {
            const saved = await UssdResponseModel.update({ surveyId: survey_id }, {
                where: {
                    [Op.and]: [
                        {
                            phone_number,
                        },
                        {
                            session_id,
                        },
                    ],
                },
            });
            if (saved) {
                return true;
            }
            return false;
        }
        return false;
    }
    public updateUssdRewardType = async (phone_number: any, session_id, reward_type: any) => {
        const saved = await UssdResponseModel.update({ reward_type }, {
            where: {
                [Op.and]: [
                    {
                        phone_number,
                    },
                    {
                        session_id,
                    },
                ],
            },
        });
        if (saved) {
            return saved;
        }
        return false;
    }
    public updateussdResponse = async (data: any) => {
        let datObjct = { network_code: data.networkCode, service_code: data.serviceCode};
        console.log("object", datObjct);
        const updated = await UssdResponseModel.update(datObjct, {
            where: { phone_number: data.phoneNumber },
        });
        if (updated) {
            return true;
        }
    }
    public updateNoSurveyUssdResponse = async (data: any) => {
        let datObjct = {network_code: data.networkCode, service_code: data.serviceCode, questionNumber: data.questionNumber, answer: data.answer, surveyId: data.surveyId };
        console.log("object", datObjct);
        const updated = await UssdResponseModel.update(datObjct, {
            where: { phone_number: data.phoneNumber, question_number:data.questionNumber},
        });
        if (updated) {
            return true;
        }
    }
    public savePhoneNumber = async (data: any) => {
        let dat_objct = {
            phone: data.phoneNumber,
            network: data.networkCode?data.networkCode:'',
        };
        const saved = await SavedPhoneNumbersModel.create(dat_objct);
        if (saved) {
            return saved;
        }
        return false;
    }
    public saveCovidFixedResponses = async (data: any) => {
        let dat_objct = {
            phone_number: data.phoneNumber,
            answer: data.answer,
            network: data.networkCode?data.networkCode:'',
        };
        const saved = await RawUssdResponseModel.create(dat_objct);
        if (saved) {
            return saved;
        }
        return false;
    }
    /**
     * sendAirtime
     */
    public sendAirtime = async () => {
        let reqData = {
            username: "sandbox",
            recipients: [
                {
                    phoneNumber: "+2348139719106",
                    currencyCode: "NGN",
                    amount: 50,
                }],
        };
        request.post("https://api.africastalking.com/version1/airtime/send",
            reqData,
            (error, res, body) => {
                if (error) {
                    console.error(error);
                    return;
                }
                console.log(`statusCode: ${res.statusCode}`);
                console.log(body);
            });
    }
    /**
  * gets offset value
  * @param page
  * @param limit
  */
    private getOffsetValue(page: number, limit: number) {
      let offset: number = 0;
      if (page == 1) {
        return offset;
      }
  
      offset = page * limit;
      if (page > 1) {
        offset++;
      }
      return offset;
    }
  
    /**
    * Build survey(s) metadata
    * @param {Object} surveys the survey results
    * @param {number} page current page
    */
    private buildMetaData(channels: any, page: number, channelsCount: number) {
      return {
        query_results: channels.length,
        page,
        comment:
          channels.length == 0
            ? "No Channel to display"
            : `Showing ${channels.length} of ${channelsCount} results`,
      };
    }
}
