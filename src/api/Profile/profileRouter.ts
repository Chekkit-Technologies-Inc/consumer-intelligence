import express from "express";
import { authorize, validation } from "../../middleware";
import { ProfilePhotoUpload } from "../../middleware/uploads";
import { controllerHandler } from "../../shared/controllerHandler";
import { ProfileController } from "./profileController";
import { ProfileValidationSchema } from "./profileValidation";

const router = express.Router();
const call = controllerHandler;
const Profile = new ProfileController();

router.use(authorize);
router.use(validation(ProfileValidationSchema));

router.get("/", call(Profile.index, (req, _res, _next) => [req.params]));

router.get("/:username", call(Profile.getProfile, (req, _res, _next) => [req.params.username]));
router.get("/app/:username", call(Profile.getAppProfile, (req, _res, _next) => [req.params.username]));

router.put("/", [ProfilePhotoUpload.single("photo")],
    call(Profile.editProfile, (req, res, next) => [req.user, req.file, req.body]));

router.post("/upload", [ProfilePhotoUpload.single("photo")],
    call(Profile.saveProfilePhoto, (req, res, next) => [req.user, req.file]));

export const ProfileRouter = router;
