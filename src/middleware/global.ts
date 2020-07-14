import bodyParser = require("body-parser");
import cors = require("cors");
import { Express } from "express";
import logger from "morgan";
import passport from "passport";
import { jwtStrategy } from "./passport";
export default (app: Express) => {
    app.use(cors({ maxAge: 1728000 }));
    // app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, type: 'application/x-www-form-urlencoding' }));
    app.use(bodyParser.json({ limit: "50mb" }));
    app.use(bodyParser.json({ limit: "50mb", type: "application/json" }));
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    app.use(logger("dev"));
    passport.use(jwtStrategy);
};
