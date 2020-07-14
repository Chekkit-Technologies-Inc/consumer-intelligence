import express from "express";
import { authorize } from "../../middleware";
import { controllerHandler } from "../../shared/controllerHandler";
import { SubscriptionController } from "./subscriptionController";
// import { SubscriptionValidationSchema } from "./";

const router = express.Router();
const call = controllerHandler;
const Subscription = new SubscriptionController();

router.post("/process-ussd", call(Subscription.processUssdPayment, (req, _res, _next) => [req.body]));

router.use(authorize);
// router.use(validation(SubscriptionValidationSchema));

router.get("/", call(Subscription.viewSubOptions, (req, _res, _next) => []));

router.post("/", [], call(Subscription.addSubOption, (req, _res, _next) => [req.body, req.file]));

router.post("/make-payment",
    call(Subscription.purchase, (req, _res, _next) => [req.user, req.body, req.query.type]));

// router.post("/charge-customer/:type", [validation(SubscriptionValidationSchema)],
//     call(Subscription.chargeCustomer, (req, _res, _next) => [req.body, req.params.type]));

router.delete("/:id", call(Subscription.removeSubOption, (req, _res, _next) => [req.params.id]));

router.get("/:username", call(Subscription.getSubscriptionStatus, (req, _res, _next) => [req.params.username]));

export const SubscriptionRouter = router;
