import express from "express";
import { authorize, validation } from "../../middleware";
import { controllerHandler } from "../../shared/controllerHandler";
import { RewardController } from "./RewardController";
import {
    RewardValidationSchema,
    MerchntRewardValidationSchema, MerchntRewardUpdateValidationSchema,
} from "./RewardValidation";
import { ProductPhotoUpload } from "../../middleware/uploads";
import { RewardAirtimeValidationSchema } from './RewardValidation';

const router = express.Router();
const call = controllerHandler;
const Reward = new RewardController();

router.use(authorize);
// router.use(validation(RewardValidationSchema));

router.get("/survey-merchnt-reward/:id", [validation(RewardValidationSchema)],
    call(Reward.getSurveyRewards, (req, res, next) => [req.params.id]));
router.put("/update-merchntreward/:id", [validation(MerchntRewardUpdateValidationSchema)],
    call(Reward.updateMerchntReward, (req, _res, _next) => [req.params.id, req.user, req.body]));
router.post("/merchnt/:id", [validation(MerchntRewardValidationSchema), ProductPhotoUpload.single("photo")],
    call(Reward.createMerchntReward, (req, _res, _next) => [req.params.id, req.body, req.file]));

router.post("/:id", [validation(RewardAirtimeValidationSchema)],
    call(Reward.createReward, (req, _res, _next) => [req.params.id, req.body]));

router.post("/attach-reward/:id/:rewardId", [validation(RewardValidationSchema)],
    call(Reward.attachReward, (req, _res, _next) => [req.params.id, req.params.rewardId]));

router.put("/update-product/:id",
    call(Reward.updateProudctReward, (req, _res, _next) => [req.params.id, req.user, req.body]));
router.put("/update-reward/:id",
    call(Reward.updateReward, (req, _res, _next) => [req.params.id, req.user, req.body]));

router.delete("/delete-reward/:id", [validation(RewardValidationSchema)],
    call(Reward.deleteReward, (req, _res, _next) => [req.params.id, req.survey]));

router.get("/survey-reward/:id", [validation(RewardValidationSchema)],
    call(Reward.getSurveyRewards, (req, res, next) => [req.params.id]));

router.post("/redeem/point", call(Reward.redeemPoint, (req, res, next) => [req.user, req.body]));

router.get("/:id", call(Reward.index, (req, res, next) => [req.params.id]));
router.get("/all-rewards/:id", call(Reward.getAllRewards, (req, res, next) => [req.params.id]));
router.get("/all-airtime/:id", call(Reward.getAllAirtime, (req, res, next) => [req.params.id]));
router.get("/all-merchandize/:id", call(Reward.getAllMerchandize, (req, res, next) => [req.params.id]));

export const RewardRouter = router;
