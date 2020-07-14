import express from "express";
import { authorize, validation } from "../../middleware";
import { controllerHandler } from "../../shared/controllerHandler";
import { SurveyController } from "./SurveyController";
import { SurveyValidationSchema, LoyaltyPointsValidationSchema,RaffleDrawValidationSchema } from './surveyValidation';
import { GiftPhotoUpload } from '../../middleware/uploads';

const router = express.Router();
const call = controllerHandler;
const Survey = new SurveyController();

router.use(authorize);
// router.use(validation(SurveyValidationSchema));

router.get("/:slug", call(Survey.getSurvey, (req, _res, _next) => [req.params.slug]));

router.post("/", [validation(SurveyValidationSchema)],
    call(Survey.createSurvey, (req, _res, _next) => [req.user, req.body]));

router.post("/create-loyalty-point", [validation(LoyaltyPointsValidationSchema)],
    call(Survey.createLoyaltyPoint, (req, _res, _next) => [req.user, req.body]));

    // router.post("/create-raffle-draw", [validation(RaffleDrawValidationSchema), GiftPhotoUpload.array("gifts")],
router.post("/create-raffle-draw", [validation(RaffleDrawValidationSchema), GiftPhotoUpload.fields([{ name: 'photo', maxCount: 8 }])],
    call(Survey.createRaffleDraw, (req, _res, _next) => [req.user, req.body,req.files]));

router.post("/upload-gift-image", [GiftPhotoUpload.single("photo")],
    call(Survey.returnImageUrl, (req, _res, _next) => [req.file]));
    
router.delete("/:id", call(Survey.deleteSurvey, (req, _res, _next) => [{ surveyId: req.params.id, user: req.user }]));
router.get("/all_redemptionpoints/:id", call(Survey.getAllRedemptionPoints, (req, _res, _next) => [req.params.id]));
router.get("/all_surveys/:id", call(Survey.index, (req, _res, _next) => [req.params.id]));

router.get("/get/:id/:type", call(Survey.getSurveysByType, (req, _res, _next) => [req.params.id,req.params.type]));

router.get("/all_loyaltypoints/:id", call(Survey.getAllLoyaltyPoints, (req, _res, _next) => [req.params.id]));

router.get("/get-user-raffles/:id", call(Survey.getUserRaffleDraw, (req, _res, _next) => [req.params.id]));

router.get("/get-raffle-details/:id", call(Survey.getRaffleDetails, (req, _res, _next) => [req.params.id]));

router.get("/select-raffle-winner/:id", call(Survey.selectRaffleWinner, (req, _res, _next) => [{id:req.params.id, user: req.user}]));

router.put("/update-survey/:slug", [validation(SurveyValidationSchema)],
    call(Survey.updateSurvey, (req, _res, _next) => [req.params.slug, req.user, req.body]));

router.put("/update/active-status/:id", [],
    call(Survey.updateSurveyActiveStatus, (req, _res, _next) => [req.params.id, req.user, req.body]));

router.put("/update-loyalty-point/:slug", [validation(LoyaltyPointsValidationSchema)],
    call(Survey.updateLoyaltyPoint, (req, _res, _next) => [req.params.slug, req.user, req.body]));

router.put("/update-product/:id",
    call(Survey.updateProudctSurvey, (req, _res, _next) => [req.params.id, req.user, req.body]));

router.put("/update-product-survey/:id",
    call(Survey.updateProductSurvey, (req, _res, _next) => [req.params.id, req.user, req.body]));


export const SurveyRouter = router;
