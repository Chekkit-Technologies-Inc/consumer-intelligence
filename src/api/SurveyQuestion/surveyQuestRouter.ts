import express from "express";
import { authorize, validation } from "../../middleware";
import { controllerHandler } from "../../shared/controllerHandler";
import { SurveyQuestController } from "./SurveyQuestController";
import { SurveyQuestValidationSchema } from "./surveyQuestValidation";
import { RedeemValidationSchema } from '../Survey/surveyValidation';

const router = express.Router();
const call = controllerHandler;
const SurveyQuestion = new SurveyQuestController();

router.use(authorize);
// router.use(validation(SurveyValidationSchema));

router.get("/question/:slug", call(SurveyQuestion.getQuestSurvey, (req, _res, _next) => [req.survey, req.params.slug]));

router.post("/:id", [validation(SurveyQuestValidationSchema)],
    call(SurveyQuestion.createSurveyQuestion, (req, _res, _next) => [req.params.id, req.user, req.body]));
router.post("/", [validation(RedeemValidationSchema)],
    call(SurveyQuestion.createRedemptionPoint, (req, _res, _next) => [req.user, req.body]));

router.delete("/question/:id",
    call(SurveyQuestion.deleteQuestSurvey, (req, _res, _next) => [{ postId: req.params.id, user: req.user }]));

router.get("/all-userquestions/:id", call(SurveyQuestion.getUserQuestSurvey, (req, _res, _next) => [req.params.id]));

router.get("/surveyquestions", call(SurveyQuestion.index, (req, _res, _next) => [req.params]));

router.get("/get-surveyquestions/:id", call(SurveyQuestion.getSurveyQuestions, (req, _res, _next) => [req.params.id]));

router.get("/get-survey-questions-with-response/:id", call(SurveyQuestion.getSurveyQuestionsWithResponses, (req, _res, _next) => [req.params.id]));

router.get("/get-label-survey-questions-with-response/:id", call(SurveyQuestion.getSurveyQuestionsWithResponsesLabel, (req, _res, _next) => [req.params.id]));

router.get("/get-surveypoints/:id",
    call(SurveyQuestion.getSurveyPoints, (req, _res, _next) => [req.user, req.params.id]));

export const surveyQuestRouter = router;
