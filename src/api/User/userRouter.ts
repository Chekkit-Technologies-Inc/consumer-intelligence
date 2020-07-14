import express from "express";
import { authorize, validation } from "../../middleware";
import { controllerHandler } from "../../shared/controllerHandler";
import { UserController } from "./userController";
import { UserValidationSchema } from "./userValidation";

const router = express.Router();
const call = controllerHandler;
const User = new UserController();

router.use(authorize);
router.use(validation(UserValidationSchema));

router.get("/:username", call(User.getUser, (req, res, next) => [req.params.username]));
router.get("/app/:username", call(User.getAppUser, (req, res, next) => [req.params.username]));

router.get("/", call(User.index, (req, res, next) => []));

router.put("/", call(User.updateUser, (req, res, next) => [req.user, req.body]));

router.get("/:username/surveys", call(User.getSurveysByUser, (req, _res, _next) => [req.params.username]));

router.get("/:survey_id/channels", call(User.getChannelsByUSer, (req, _res, _next) => [req.params.survey_id]));
router.get("/sub-details/:id", call(User.getSubByUSer, (req, _res, _next) => [req.params.id, req.user]));
router.get("/:id/count_all", call(User.getCountsByUSer, (req, _res, _next) => [req.params.id]));

export const UserRouter = router;
