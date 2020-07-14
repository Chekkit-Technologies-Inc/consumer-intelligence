import express from "express";
import { authorize } from "../../middleware";
import { controllerHandler } from "../../shared/controllerHandler";
import { MessageController } from "./messageController";

const router = express.Router();
const call = controllerHandler;
const Message = new MessageController();

router.use(authorize);

router.get("/", call(Message.index, (req, _res, _next) => [req.user]));

router.get("/:id", call(Message.getMessage, (req, _res, _next) => [{ messageId: req.params.id, user: req.user }]));

router.get("/mark-message-as-read/:id", call(Message.markAsRead, (req, _res, _next) => [req.params.id, req.user ]));

router.delete("/:id",
call(Message.deleteMessage, (req, _res, _next) => [{ messageId: req.params.id, user: req.user }]));

export const MessageRouter = router;
