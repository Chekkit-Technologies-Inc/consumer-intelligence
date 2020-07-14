import express from "express";
import passport from "passport";
import { loginStrategy, signupStrategy, appSignupStrategy, appLoginStrategy } from "../../middleware/passport";
import { validation } from "../../middleware/validation";
import { controllerHandler } from "./../../shared/controllerHandler";
import { AuthController } from "./authController";
import {
    LoginValidationSchema, SignupValidationSchema,
    RefreshTokensValidationSchema, AppLoginValidationSchema, AppSignupValidationSchema,
} from "./authValidation";
import { authorize } from "../../middleware";

const router = express.Router();
const call = controllerHandler;
const Auth = new AuthController();

passport.use("signup", signupStrategy);
passport.use("appSignup", appSignupStrategy);
passport.use("login", loginStrategy);
passport.use("appLogin", appLoginStrategy);

router.post("/signup", [validation(SignupValidationSchema),
passport.authenticate("signup", { session: false })], call(Auth.signup, (req, res, next) => [req.user]));

router.post("/app-signup", [validation(AppSignupValidationSchema),
passport.authenticate("appSignup", { session: false })], call(Auth.appSignup, (req, res, next) => [req.user]));

router.post("/signin", [validation(LoginValidationSchema)], call(Auth.login, (req, res, next) => [req, res, next]));
router.post("/app-signin", [validation(AppLoginValidationSchema)],
    call(Auth.appLogin, (req, res, next) => [req, res, next]));

router.post("/logout", authorize, call(Auth.logout, (req, _res, _next) => [req.user]));

router.post("/request-reset/:email", call(Auth.requestPasswordReset, (req, _res, _next) => [req.params.email]));

router.get("/verify-passwordcode", call(Auth.verifyResetCode, (req, _res, _next) => [req.query.c]));

router.get("/verify-useraccount", call(Auth.verifyUserAccount, (req, _res, _next) => [req.query.c]));

router.post("/reset-password", call(Auth.resetPassword, (req, _res, _next) => [req.body.code, req.body.password]));

router.post("/update-playerid",
    call(Auth.updatePlayerId, (req, _res, _next) => [ req.body]));

router.post("/refresh-token",
    validation(RefreshTokensValidationSchema), call(Auth.refreshTokens, (req, res, next) => [req.body]));

router.post("/save-response/:id/:survey_id/:quest_id", call(Auth.saveQuestResponse,
    (req, _res, _next) => [req.params.id, req.params.survey_id, req.params.quest_id, req.body]));

router.post("/verify-pin",
    call(Auth.verifyPin, (req, _res, _next) => [req.body]));

router.get("/", (rq, rs) => rs.send("good"));

export const AuthRouter = router;
