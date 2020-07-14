import express from "express";
import { authorize, validation } from "../../middleware";
import { controllerHandler } from "../../shared/controllerHandler";
import { ChannelController } from "./channelController";
import { ChannelValidationSchema } from "./channelValidation";

const router = express.Router();
const call = controllerHandler;
const Channel = new ChannelController();

router.use(authorize);
router.use(validation(ChannelValidationSchema));

router.post("/:id", call(Channel.createChannel, (req, _res, _next) => [req.params.id, req.user, req.body]));

router.delete("/delete-channel/:id", call(Channel.deleteChannel, (req, _res, _next) => [req.params.id, req.survey]));

router.get("/survey-channel/:id", call(Channel.getSurveyChannels, (req, res, next) => [req.params.id]));

router.get("/:id", call(Channel.index, (req, res, next) => [req.params.id]));

export const ChannelRouter = router;
