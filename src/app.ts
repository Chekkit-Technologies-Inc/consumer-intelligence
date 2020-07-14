import express from "express";
import { AuthRouter } from "./api/Auth";
import { SurveyRouter } from "./api/Survey";
import { UserRouter } from "./api/User";
import { surveyQuestRouter } from "./api/SurveyQuestion";
import { ChannelRouter } from "./api/Channel";
import { RewardRouter } from "./api/SurveyReward";

import { BASE_PATH } from "./config";
import { errorHandler, global } from "./middleware";
import { DB } from "./shared/database";
import { logger } from "./utils/logger";
import { ProductRouter } from "./api/Product";
import { UssdResponseRouter } from "./api/UssdResponse";
import { ProfileRouter } from './api/Profile/profileRouter';
import { SubscriptionRouter } from './api/Subscription/subscriptionRouter';
import { MessageRouter } from "./api/Message";




class App {
    public express = express();
    public basePath = BASE_PATH || "";
    constructor() {
        this.boot();
    }

    private boot() {
        this.initilizeDb();
        this.registerMiddlewares();
        this.mountRoutes();
        this.handleUncaughtErrorEvents();
    }
    // *384*90099#	
    private mountRoutes() {
        this.express.use(`${this.basePath}/auth`, AuthRouter);
        this.express.use(`${this.basePath}/users`, UserRouter);
        this.express.use(`${this.basePath}/surveys`, SurveyRouter);
        this.express.use(`${this.basePath}/surveyquestion`, surveyQuestRouter);
        this.express.use(`${this.basePath}/channels`, ChannelRouter);
        this.express.use(`${this.basePath}/survey-reward`, RewardRouter);
        this.express.use(`${this.basePath}/messages`, MessageRouter);
        this.express.use(`${this.basePath}/products`, ProductRouter);
        this.express.use(`${this.basePath}/ussd-response`, UssdResponseRouter);
        this.express.use(`${this.basePath}/profile`, ProfileRouter);
        this.express.use(`${this.basePath}/subscription`, SubscriptionRouter);
    }

    private registerMiddlewares() {
        global(this.express);
    }

    private initilizeDb() {
        DB.authenticate()
            .then(() => {
                logger.info("Database connection has been established successfully.");
            })
            .catch((err) => {
                throw (err);
            });
    }

    // Error handlers
    private handleUncaughtErrorEvents() {
        process.on("unhandledRejection", (reason, promise) => {
            throw reason;
        });

        process.on("uncaughtException", (error) => {
            logger.error(`Uncaught Exception: ${500} - ${error.message}, Stack: ${error.stack}`);
            process.exit(1);
        });

        process.on("SIGINT", () => {
            logger.info(" Alright! Bye bye!");
            process.exit();
        });

        this.express.use(errorHandler);

    }
}

export default new App().express;
