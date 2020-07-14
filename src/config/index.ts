import * as dotenv from "dotenv";
dotenv.config();

export const SHOULD_MIGRATE = false;
export const PORT = process.env.PORT;
export const ENVIRONMENT = process.env.NODE_ENV;
export const APP_URL = process.env.APP_URL;
export const BASE_PATH = process.env.BASE_PATH;
export const DB_NAME = process.env.DB_NAME;
export const DB_USER = process.env.DB_USER;
export const DB_PASSWORD = process.env.DB_PASSWORD;
export const DB_HOST = process.env.DB_HOST;
export const JWT_SECRET = process.env.JWT_SECRET;

export const AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY;
export const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
export const S3_REGION = process.env.S3_REGION;
export const S3_BUCKET = process.env.S3_BUCKET;

export const LIVE_AFRTLKING_API_KEY = process.env.LIVE_AFRTLKING_API_KEY;
export const TEST_AFRTLKING_API_KEY = process.env.TEST_AFRTLKING_API_KEY;
export const LIVE_AFRTLKING_USERNAME = process.env.LIVE_AFRTLKING_USERNAME;
export const TEST_AFRTLKING_USERNAME = process.env.TEST_AFRTLKING_USERNAME;


export const LIVE_TWILIO_API_SID = process.env.LIVE_TWILIO_API_SID;
export const TEST_TWILIO_API_TOKEN = process.env.TEST_TWILIO_API_TOKEN;


export const PAYSTACK_TEST_SECRET_KEY = process.env.PAYSTACK_TEST_SECRET_KEY;
export const PAYSTACK_TEST_PUBLIC_KEY = process.env.PAYSTACK_TEST_PUBLIC_KEY;

export const PAYSTACK_LIVE_SECRET_KEY = process.env.PAYSTACK_LIVE_SECRET_KEY;
export const PAYSTACK_LIVE_PUBLIC_KEY = process.env.PAYSTACK_LIVE_PUBLIC_KEY;

export const GMAIL_USERNAME = process.env.GMAIL_USERNAME;
export const GMAIL_PASSWORD = process.env.GMAIL_PASSWORD;
export const ONESIGNAL_APPID = process.env.ONESIGNAL_APPID;
export const ONESIGNAL_APIKEY = process.env.ONESIGNAL_APIKEY;
