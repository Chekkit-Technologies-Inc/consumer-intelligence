import express from "express";
import { controllerHandler } from "../../shared/controllerHandler";
import { UssdResponseController } from "./ussdResponseController";
import { validation } from "../../middleware";
import { USSDresponseValidationSchema,SendAlertValidationSchema } from "./ussdResponseValidation";
let dateFormat = require("dateformat");
const router = express.Router();
const call = controllerHandler;
const UssdResponse = new UssdResponseController();
import { sendSMS } from "../../utils/africastalking";

// router.use(validation(USSDresponseValidationSchema));

router.post("/save-response/:survey_id/:quest_id", [validation(USSDresponseValidationSchema)],
    call(UssdResponse.saveQuestResponse, (req, _res, _next) => [req.params]));

router.post("/airtime", call(UssdResponse.airtimeResponse, (req, res) => [req.body]));

router.post("/ussd", async (req, _res) => {

    let { text, phoneNumber, sessionId } = req.body;
    // console.log(req.body)
    const data = text.split("*");
    // console.log(text)
    // console.log(data.length)
    let txtLength = text.length; 
    // let txtLength = text.length - 9;
    let arrLastIndex = data.length - 1;
    let arrPrevIndex = data.length - 2;
    let arrPrevIndex2 = data.length - 3;
    let arrPrevIndex3 = data.length - 4;
    let arrPrevIndex4 = data.length - 5;
    let previousInput = '0';
    let previousInput2 = '0';
    let previousInput3 = '0';
    let previousInput4 = '0';
    let quesData: any;
    console.log(previousInput4)

    let lastInput = data[arrLastIndex].replace('#','');
    if(arrPrevIndex > 0){
        previousInput = data[arrPrevIndex].replace('#','');
    }

    if(arrPrevIndex2 > 0){
        previousInput2 = data[arrPrevIndex2].replace('#','');
    }
    
    if(arrPrevIndex3 > 0){
        previousInput3 = data[arrPrevIndex3].replace('#','');
    }
    
    if(arrPrevIndex4 > 0){
        previousInput4 = data[arrPrevIndex4].replace('#','');
    }
    
    // console.log(txtLength)
    // console.log('--------------------')
    // console.log(previousInput3)

    // return;
    // console.log(data)
    // console.log(data.length)

    if (text == "" || text === undefined) {
        // This is the first request. Note how we start the response with CON
        let response = `END Please enter the 16 digits number with the short code i.e *347*03*16_DIGITS_PIN#`;
        _res.send(response);
    } else if (text.length == 16) {
        console.log("text", text);
        let ussdBody = req.body;
        let saved = await UssdResponse.requestUssd(ussdBody);
        if (saved) {
            // console.log("saved", saved);
            let product_details = await UssdResponse.productDetails({
                text, scan_channel: "ussd", user_id: phoneNumber, session_id: sessionId,
            });
            if (product_details.status) {
                // console.log("product_details", product_details.product_name);
                // console.log("product_details", product_details.product.batch_num);
                // console.log("product_details", product_details.product.expiry_date);
                // console.log("product_details", product_details.product.batch_num);
                // console.log("yes>>>>", phoneNumber, sessionId, product_details.product.surveyId);
                let result = await UssdResponse.updateUssdData(phoneNumber, sessionId,
                    product_details.product.surveyId);
                if (result) {
                    console.log("product_details>>>>", product_details);
                    let response = `CON Product is verified OK!\nProduct Name:${product_details.product_name}\n` +
                        `Batch No:${product_details.product.batch_num}\n` +
                        `Expiry Date: ${dateFormat(product_details.product.expiry_date, "mmm d, yyyy")}\n` +
                        `Answer survey and get instant reward:\n1. Yes\n2. No`;
                    console.log("response>>>>>>>>>", response);
                    _res.send(response);
                } else {
                    await UssdResponse.returnScanDefault(text);
                    let response = `END Try again later.`;
                    _res.send(response);
                }
            } else {
                // await UssdResponse.returnScanDefault(text);
                let response = `END ${product_details.data}`;
                _res.send(response);
            }

        } else {
            await UssdResponse.returnScanDefault(text);
            let response = `END An error occurred, pls try again.`;
            _res.send(response);
        }

    }
    else if (text.length == 2 && text.includes("01")) {

        let ussdBody = req.body;
        ussdBody.clientCode = '01';
        ussdBody.questionNumber = '1';
        let saved = await UssdResponse.requestUssd(ussdBody);
        console.log(saved);

        let response = `CON Welcome to: Indomie Reward Your Customer Promo. \n  \n Please select a gender \n 1. Male \n 2. Female`;

        _res.send(response);
    }else if (text.includes("01")) {        
        let quesData: any;
        let question: any;
        let surveyId = '34';
        // console.log('text: 01')
        // console.log(data)
        // console.log(text)
        // console.log(text.length)
        // console.log(data[1])

        if(text.length == 4){
            // await UssdResponse.updateussdResponse(req.body);
            // console.log(result)
            let response = `CON What's your Age Group \n 1. 5 - 19 years \n 2. 20 - 29 years \n 3. 30 - 39 years \n 4. Above 40 years`;
            _res.send(response);

            // create new question on db
            let ussdBody = req.body;
            ussdBody.clientCode = '01';
            ussdBody.questionNumber = '2';
            
            await UssdResponse.requestUssd(ussdBody);


            // save answer for first question
            req.body.questionNumber = 1;
            const data = text.split("*");
            req.body.answer = UssdResponse.returnFixedQuestionAnswer(1,data[1]);
            req.body.surveyId = surveyId;
            
            await UssdResponse.updateussdResponse(req.body);
            console.log(data)

        }else if(text.length == 6){
            question = await UssdResponse.getNoLabelQuestions('01');
            quesData = question.question[0];



        if (quesData && quesData != "undefined") {
            console.log("choices>>>> 1", quesData);
            const choices = JSON.parse(quesData.choices);
            let choiceData = "";
            let i = 0;
            choices.forEach((element) => {
                i += 1;
                choiceData = `${choiceData}` + `${i}` + ". " + `${element.text}\n`;
            });
            if (question.status) {
                let response = `CON Survey question:\n${quesData.content}\nOptions:\n${choiceData}`;
                _res.send(response);

 
                // create new question on db
                let ussdBody = req.body;
                ussdBody.clientCode = '01';
                ussdBody.questionNumber = '3';
                
                await UssdResponse.requestUssd(ussdBody);

            } else {
                // Business logic for first level response
                let response = `END ${question.data}`;
                _res.send(response);
            }
        } 
        req.body.questionNumber = 2;
        const data = text.split("*");
        req.body.answer = UssdResponse.returnFixedQuestionAnswer(2,data[2]);
        req.body.surveyId = surveyId;
        
        await UssdResponse.updateussdResponse(req.body);
       
            // let response = `CON Which of thses Mishai spot is closest to you \n 1. Meshai Surulere \n 2. Ikeja \n 3. Ikoyi \n 4. Festac \n 5. Agege/Ogba \n 6. Yaba`;
            // _res.send(response);
        }
        else if(text.length == 8){
            // quesData = question.question[0];
            let response = `END Thank you for participating, find direction to your gift in your sms inbox.`;
            _res.send(response);

            let smsBody = `Thank you for taking our survey, please visit your closest indomie shop for your reward.`;
            let send_result = await sendSMS({
              to: phoneNumber, message: smsBody,
            });
            console.log(send_result)

            const data = text.split("*");
            let ans = '';
            // get question options
            question = await UssdResponse.getNoLabelQuestions('01');
            quesData = question.question[0]; 
            if (quesData && quesData != "undefined") {
                console.log("choices>>>> 1", quesData);
                const choices = JSON.parse(quesData.choices);
               let i = data[3] - 1;
                ans = choices[i].text;
            } 

            req.body.questionNumber = 3;
            req.body.answer = ans;
            req.body.surveyId = surveyId;
            
            await UssdResponse.updateussdResponse(req.body);
        }

    } else if (txtLength == 2 && text.includes("03")){
        let response = `CON 1. Sign up for COVID19 alert and tori \n 2. Ask for COVID19 test \n 3. Win AWOOF credit, ANSA OUR SURVEY  \n 4. Win AWOOF credit, PLAY GAME`;
        // let response = `CON \n 1. Sign up for COVID19 alert and tori \n 2. Ask for COVID19 test \n 3. Answer small questions and collect ya awoof credit \n 4. Play our COVID19 game and u fit win free credit`;
        // let response = `CON Welcome to Covid USSD support. \n  \n Please what do you want to do. \n 1. Sign up for COVID19 updates and alerts \n 2. Request a COVID19 test  \n 3. Take quick survey and win instant airtime  \n 4. Take quick COVID19 quiz and win instant airtime`;
       console.log(text)

        console.log(response);
        _res.send(response);
    } else if (text.includes("03")){
        // let response = `CON Welcome to: Covid USSD support. \n  \n Please what do you want to do ? \n 1. Sign up for COVID19 updates & alerts \n 2. Request a COVID19 test  \n 3. Take a quick survey & win instant airtime  \n 4. Are you well informed? Take COVID19 quiz`;
        //  response = `CON  1. Sign \n 2. Request \n 3. Take  \n 4. Are`;
        let response = '';


        const data = text.split("*");
        let ans = '';
        // check if first level response
        if(txtLength == 4){
            console.log('reeacged');
            console.log(txtLength)
            if(lastInput == '1'){
                response = `CON  1. Dey send am give me \n 2. Dey send am give another person`;
            }else if(lastInput == 2){
                response = `CON Wetin be ya location: \n  1. Lagos \n 2. FCT \n 3. Kano  \n 4. Rivers  \n 5. Others`;

            }else if(lastInput == 3){
                let question = await UssdResponse.getQuestionsByType(text,3);
                let answered = await UssdResponse.getUserAnsweredQuestions(req.body.phoneNumber,3);
                // check if user has taken survey before
                if(answered.length > 0){
                    response = `END You don take this survey before, thank you for your time.`;
                }else{
                    quesData = question.question[0];
    
                    // create new question on db
                    let ussdBody = req.body;
                    ussdBody.clientCode = '03';
                    ussdBody.questionNumber = '1';
                    ussdBody.type = '3';
                    req.body.surveyId = question.question[0].survey_id;
                    
                    await UssdResponse.requestUssd(ussdBody);
                }

            }else if(lastInput == 4){
                // response = `CON  How long should you spend washing your hands. \n  \n 1. 5 mins \n 2. 20 mins \n 3. 15 mins  \n 4. 10 mins`;
                let question = await UssdResponse.getQuestionsByType(text,4);
                let answered = await UssdResponse.getUserAnsweredQuestions(req.body.phoneNumber,4);
                // console.log(222);
                // console.log(question);
                // console.log(answered);

                if(answered && answered.length > 0){
                    // filter for answered response only
                    var f = answered.filter(function (a) {
                        return a.answer;
                      }).map(function (t) {
                        return t.questionNumber
                      });
    
                    //remove answered questions   
                    var fQ = question.question.filter(function (a) {
                    return !f.includes(JSON.stringify(a.id));
                    })
                }else{
                    var fQ = question.question; 
                }

                if(fQ && fQ.length < 1){
                    response = `END Sorry no available question now, please try again later`;
                }else{
                    quesData = fQ[0];
    
                    console.clear();
                    console.log(f);
                    console.log(fQ);
                    // console.log(question.question);
    
                    // create new question on db
                    let ussdBody = req.body;
                    ussdBody.clientCode = '03';
                    ussdBody.questionNumber = quesData.id;
                    ussdBody.sessionId = '1';
                    ussdBody.type = '4';
                    // ussdBody.surveyId = quesData.survey_id;
    
                    // console.clear();
                    // console.log(ussdBody);
                    await UssdResponse.requestUssd(ussdBody);

                }

            }
        }

        
        // check if second level response
        if(txtLength == 6){
            // check first level response and current input
            if(previousInput == '1'){
                if(lastInput == '1'){
                    response = `END U do well as u don sign up for our correct coronavirus news and tori. \n  \n Abeg, make u no dey spread yama yama news o. If u no hear am from Africa CDC, no tell another person.`;
                    let ussdBody = req.body;
                    await UssdResponse.savePhoneNumber(ussdBody);
                }else if(lastInput == '2'){
                    response = `CON Wetin be di person phone number:`;
                }
            }else if(previousInput == '2'){
                response = `CON U dey fit breathe well:  \n1. Yes \n 2. No`;
            }else if(previousInput == '3'){
                let question = await UssdResponse.getQuestionsByType(text,3);
                quesData = question.question[1];

                // console.log(question)
                
                // create new question on db
                let ussdBody = req.body;
                ussdBody.clientCode = '03';
                ussdBody.questionNumber = '2';
                ussdBody.type = '3';
                req.body.surveyId = question.question[1].survey_id;
                
                await UssdResponse.requestUssd(ussdBody);

                // update previous question on db

                const choices = JSON.parse(question.question[0].choices);
                // console.log(lastInput);
                let i = lastInput - 1;
                
                ans = choices[i].text;
                console.log(ans);

                req.body.questionNumber = 1;
                req.body.answer = ans;
                req.body.surveyId = question.question[0].survey_id;
                
                await UssdResponse.updateussdResponse(req.body);
            }else if(previousInput == '4'){ 
                let isCorrect : boolean;               
                let ussdBody = req.body;
                // ussdBody.phoneNumber:
                // console.log(ussdBody);
                // return;
                let ans = await UssdResponse.returnUssdAnswer({n:'1', p:ussdBody.phoneNumber});
                let ans1 = await UssdResponse.returnUssdQuestionAnswer({q:ans.questionNumber});

                const choices = JSON.parse(ans1.choices);
                // const choices = ans1.choices;
                // console.log(ans1.choices);
                let i = lastInput - 1;
                
                let ansText = choices[i].text;
                console.log(ansText);
                console.log(ans1);

                if(lastInput == ans1.answer){
                    isCorrect = true;
                }else{
                    isCorrect = false;
                }

                if(isCorrect){
                    response = `END  U sabi am, ya answer dey correct. Make sure say you tell your people only confam tori wey you see for here`;                    
                }else{
                    response = `END  Sorry o, your answer no correct.`;                    
                }
                console.log(isCorrect);

                req.body.questionNumber = ans.questionNumber;
                req.body.answer = ansText;
                req.body.surveyId = ans1.surveyId;
                
                await UssdResponse.updateussdResponse(req.body);

            }
        }

        // check if third level response
        if(txtLength == 8){
            if(previousInput2 == '2'){
                response = `CON You get fever:  \n1. Yes \n 2. No`;
            }else if(previousInput2 == '3'){
                let question = await UssdResponse.getQuestionsByType(text,3);
                quesData = question.question[2];
                
                // create new question on db
                let ussdBody = req.body;
                ussdBody.clientCode = '03';
                ussdBody.questionNumber = '3';
                ussdBody.type = '3';
                req.body.surveyId = question.question[2].survey_id;
                
                await UssdResponse.requestUssd(ussdBody);

                // update previous question on db

                const choices = JSON.parse(question.question[1].choices);
                let i = lastInput - 1;
                
                ans = choices[i].text;

                req.body.questionNumber = 2;
                req.body.answer = ans;
                req.body.surveyId = question.question[0].survey_id;
                
                await UssdResponse.updateussdResponse(req.body);
            }

        }


        // check if fourth level response
        if(txtLength == 10){
            if(previousInput3 == '2'){
                response = `CON U get dry cough wey nor dey gree comot:  \n1. Yes \n 2. No`;
            }else if(previousInput3 == '3'){
                response = `END You do well for our body. We don wire you N50 credit make you fit dey call you family and friends dem.`;
                let question = await UssdResponse.getQuestionsByType(text,3);
                quesData = question.question[2];
                

                // update previous question on db

                const choices = JSON.parse(question.question[2].choices);
                let i = lastInput - 1;
                
                ans = choices[i].text;

                req.body.questionNumber = 3;
                req.body.answer = ans;
                req.body.surveyId = question.question[0].survey_id;
                
                await UssdResponse.updateussdResponse(req.body);
                let ussdBody = req.body;
                if(ussdBody.phoneNumber.length == 11){
                    var fmt = ussdBody.phoneNumber;
                    fmt = fmt.substring(1);
    
                    fmt = '+234' + fmt;
                    ussdBody.phoneNumber = fmt;    
                }
                let reward_result = await UssdResponse.processRewardNoLabel(text, ussdBody);
                console.log(reward_result);
            }
        }

        // check if fifth level response
        if(txtLength == 12){
            // console.log(lastInput)
            // console.log(previousInput)
            // console.log(previousInput2)
            // req.body.answer = UssdResponse.returnFixedQuestionAnswer(1,data[1]);

            let respStr = UssdResponse.returnFixedLocation(previousInput3) + "," + previousInput2 + "," + previousInput + "," + lastInput;
            console.log(respStr)
            // console.log(UssdResponse.returnFixedLocation(previousInput3))

            if((lastInput == '2' && previousInput == '2' && previousInput2 == '1') || (lastInput == '2' && previousInput == '1' && previousInput2 == '1') || (lastInput == '1' && previousInput == '1' && previousInput2 == '1')){
                // console.log('ssdsds')
                response = `END Beta news. Ya condition nor dey bad but abeg siddon for house for 14 days make u help us fight dis coronavirus.`;
            }else{
                response = `END We don receive ya request and person from we office go soon call u for ya test. Abeg siddon for house and nor let person near u o`;
            }

            let ussdBody = req.body;
            ussdBody.clientCode = '03';
            ussdBody.answer = respStr;
            ussdBody.phone_number = ussdBody.phoneNumber;

            // console.log(ussdBody)

            await UssdResponse.saveCovidFixedResponses(ussdBody);

        }
        
        // check if third level response
        // prod:4 ... local: 7
        if(data.length == 4){
            // console.log(previousInput)

            // check first level response and current input
            if(previousInput2 == '1'){
                if(previousInput == '2'){
                    if(lastInput.length !== 11){
                        response = `END The submitted phone number is invalid, please try again with another number.`;
                    }else{
                        response = `END U do well as you don sign ${lastInput} up for our correct corona virus news and tori. \n  \n Abeg, make u no dey spread yama yama news o. If u no hear am from Africa CDC, no tell another person.`;
                        let ussdBody = req.body;
                        var fmt = lastInput;
                        fmt = fmt.substring(1);

                        fmt = '+234' + fmt;
                        ussdBody.phoneNumber = fmt;

                        // console.log(ussdBody)
                        await UssdResponse.savePhoneNumber(ussdBody);
                    }
                }
            }

        }

            // await UssdResponse.updateussdResponse(req.body);
            // if (data.length == 2) {
            //     quesData = question.question[0];
            // } else if (data.length == 3) {
            //     quesData = question.question[1];
            // } else if (data.length == 4) {
            //     quesData = question.question[2];
            // } else {
            //     quesData = "";
            // }

            if (quesData && quesData != "undefined" && txtLength < 10) {
                // console.log("choices>>>> 1", quesData);
                const choices = JSON.parse(quesData.choices);
                let choiceData = "";
                let i = 0;
                choices.forEach((element) => {
                    i += 1;
                    choiceData = `${choiceData}` + `${i}` + ". " + `${element.text}\n`;
                });
                response = `CON ${quesData.content}\n\n${choiceData}`;
            } 

        // console.log(response);
        _res.send(response);
    }
    else if (text.includes("*1") &&  !text.includes("01")) {
        if (data.length <= 5) {
            let question = await UssdResponse.getQuestions(text);
            if (question.status) {
                await UssdResponse.updateussdResponse(req.body);
                let quesData: any;
                if (data.length == 2) {
                    quesData = question.question[0];
                } else if (data.length == 3) {
                    quesData = question.question[1];
                } else if (data.length == 4) {
                    quesData = question.question[2];
                } else {
                    quesData = "";
                }

                if (quesData && quesData != "undefined") {
                    console.log("choices>>>> 1", quesData);
                    const choices = JSON.parse(quesData.choices);
                    let choiceData = "";
                    let i = 0;
                    choices.forEach((element) => {
                        i += 1;
                        choiceData = `${choiceData}` + `${i}` + ". " + `${element.text}\n`;
                    });
                    if (question.status) {
                        let response = `CON Survey question:\n${quesData.content}\nOptions:\n${choiceData}`;
                        _res.send(response);
                    } else {
                        // Business logic for first level response
                        let response = `END ${question.data}`;
                        _res.send(response);
                    }
                } else if (data.length == 5 && quesData != "undefined") {
                    console.log("choices>>>> 5 in length", data.length);
                    const final_result = data[data.length - 1];
                    if (final_result == Number(1)) {
                        let reward_result = await UssdResponse.processReward(text, req.body);
                        if (reward_result.status) {
                            if (reward_result.type == "Airtime") {
                                let response = `END You have received NGN ${reward_result.amount}` +
                                    ` worth of airtime.\n\n\n\n_____________END_______________`;
                                _res.send(response);
                            } else if (reward_result.type == "Merchandize") {
                                let response = `END ${reward_result.data}.\n\n\n\n_____________END_______________`;
                                _res.send(response);
                            } else {
                                let response = `END Thank your for taking the survey.\n\n\n\n_____________END_______________`;
                                _res.send(response);
                            }
                        } else {
                            let response = `END ${reward_result.data}\n\n\n\n_____________END_______________`;
                            _res.send(response);
                        }
                    } else if (final_result == Number(2)) {
                        let reward_result = await UssdResponse.savePoints(text, req.body);
                        if (reward_result.status) {
                            let response = `END You have saved a total of 500 points.\n` +
                                `you can check them on *347*03*347#\n\n\n\n_____________END_______________`;
                            _res.send(response);
                        } else {
                            let response = `END You have saved a total of 500 points.\n\n\n\n_____________END_______________`;
                            _res.send(response);
                        }
                    }
                } else {
                    console.log("choices>>>> 2", data.length);
                    let response = `CON Congratulations! you have been rewarded with 500 points.\n` +
                        `How would you like to use your points?\n1. Convert to Airtime\n2. Save point for future use`;
                    _res.send(response);
                }
            } else {
                let response = `CON There is no survey available for this product\n\nThank you...`;
                _res.send(response);
            }
        } else if (data.length > 5) {
            const final_result = data[data.length - 1];
            if (final_result == Number(1)) {
                let reward_result = await UssdResponse.processReward(text, req.body);
                if (reward_result.status) {
                    if (reward_result.type == "Airtime") {
                        let response = `END You have received NGN ${reward_result.amount}` +
                            ` worth of airtime.\n\n\n\n_____________END_______________`;
                        _res.send(response);
                    } else if (reward_result.type == "Merchandize") {
                        let response = `END ${reward_result.data}.\n\n\n\n_____________END_______________`;
                        _res.send(response);
                    } else {
                        let response = `END Thank your for taking the survey.\n\n\n\n_____________END_______________`;
                        _res.send(response);
                    }
                } else {
                    let response = `END ${reward_result.data}\n\n\n\n_____________END_______________`;
                    _res.send(response);
                }
            } else if (final_result == Number(2)) {
                let reward_result = await UssdResponse.savePoints(text, req.body);
                if (reward_result.status) {
                    let response = `END You have saved a total of 500 points.\n` +
                        `you can check them on *347*03*347#\n\n\n\n_____________END_______________`;
                    _res.send(response);
                } else {
                    let response = `END You have saved a total of 500 points.\n\n\n\n_____________END_______________`;
                    _res.send(response);
                }
            }
        }

    }
    else if (text.includes("*1*2") || text.includes("*1*2")) {
        // Business logic for first level response
        await UssdResponse.processReward(text, req.body);
        let response = `END Airtime sent.`;
        _res.send(response);
    } else if (text.includes("*2") &&  !text.includes("01")) {
        // Business logic for first level response
        let response = `END Thank you.`;
        _res.send(response);
    } 
    else {
        _res.status(400).send("Bad request!");
    }
});

router.get("/", (rq, rs) => rs.send("good"));
router.get("/phone-numbers", call(UssdResponse.getPhoneNumbers, (req, _res, _next) => [req.params.id]));
router.get("/text-alerts", call(UssdResponse.getTextAlerts, (req, _res, _next) => [req.params.id]));
router.get("/return-stats", call(UssdResponse.getUssdStats, (req, _res, _next) => [req.params.id]));
router.get("/return-covid-test-stats", call(UssdResponse.getCovidUssdTestStats, (req, _res, _next) => [req.params.id]));

router.post("/send-alert", [validation(SendAlertValidationSchema)],
    call(UssdResponse.sendAlert, (req, _res, _next) => [req.body]));

export const UssdResponseRouter = router;
