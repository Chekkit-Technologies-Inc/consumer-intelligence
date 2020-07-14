import { SubscriptionModel } from ".";
import { UserModel } from "../User";
import fetch from "node-fetch";
import { PAYSTACK_TEST_SECRET_KEY, ENVIRONMENT, PAYSTACK_LIVE_SECRET_KEY } from "../../config";
import { AppError } from "../../utils/app-error";
import { logger } from "../../utils/logger";
import { isSubActive } from "../../utils/helpers";
import { PaymentModel } from "./paymentModel";

export class SubscriptionService {

    private paystackKey = (ENVIRONMENT == "development") ? PAYSTACK_TEST_SECRET_KEY : PAYSTACK_LIVE_SECRET_KEY;

    /**
     * Save user's coin purchase
     * @param {Object} user the current user
     * @param {Object} data information about current purchase
     * @param {number} data.coins_purchased the amount of coins purchased
     * @param {string} data.transaction_reference the transaction reference to validate
     * @param {string} data.payment_channel web or mobile
     * @param {string} data.device the user's device information
     */
    public purchaseCoins = async (user: any, data: any) => {
        // const subscription = await this.validateSubscription(data.coins_purchased, data.transaction_reference);
        // if (subscription) {
        //     await this.savePaymentInformation(user, data);
        //     const userSubscription = await user.getSubscription();
        //     let values = userSubscription.dataValues;
        //     values.coin_balance = +values.coin_balance + +data.coins_purchased;

        //     return SubscriptionModel.update(values, {where: {user_id: user.id}}).then((updated) => {
        //         if ((updated > 0) && subscription.addSubscription(userSubscription)) {
        //             return this.getSubscriptionStatus(user.username);
        //         }
        //     });
        // }

        throw new AppError("Could not validate payment", null, 400);
    }

    /**
     * purchaseSubscription
     */
    public purchaseSubscription = async (user: any, data: any) => {
        const req = await fetch(`https://api.paystack.co/transaction/verify/${data.ref}`, {
            headers: { Authorization: `Bearer ${this.paystackKey}` },
        });
        const paymentStatus: any = await req.json();
        if (!paymentStatus.status) {
            logger.error(paymentStatus.message);
            throw new AppError(paymentStatus.message, null, 401);
        }
        let newData = {
            payment_channel: paymentStatus.data.channel,
            userId: data.userId,
            amount: data.amount,
            transaction_reference: data.ref,
            payment_type: data.type,
        };
        await this.savePaymentInformation(user, newData);
        let sub_details = await SubscriptionModel.findOne({ where: { userId: data.userId } });
        if (data.type == "account") {
            let account_balance = String(Number(sub_details.account_balance) + Number(data.amount));
            sub_details.account_balance = account_balance;
            let updated = SubscriptionModel.update({ account_balance, account_status: 1 },
                { where: { userId: data.userId } });
            if (updated) {
                return sub_details;
            }
        } else if (data.type == "pin") {
            let gen_pins_balance = String(Number(sub_details.gen_pins_balance) - Number(data.amount));
            sub_details.gen_pins_balance = gen_pins_balance;
            let updated = SubscriptionModel.update({ gen_pins_balance, gen_pins_status: 1 },
                { where: { userId: data.userId } });
            if (updated) {
                return sub_details;
            }
        } else if (data.type == "airtime") {
            let rewards_balance = String(Number(sub_details.rewards_balance) + Number(data.amount));
            sub_details.rewards_balance = rewards_balance;
            let updated = SubscriptionModel.update({ rewards_balance, rewards_status: 1 },
                { where: { userId: data.userId } });
            if (updated) {
                return sub_details;
            }
        }
        throw new AppError("Sorry, could not perform this action.", null, 400);
    }

    /**
     * Gets a user's subscription status
     * @param {string} username the username to lookup
     */
    public getSubscriptionStatus = async (username: string) => {
        // const user = await UserModel.findOne({ where: { username } });
        // if (user) {
        //     let sub = await user.getSubscription();
        //     sub = sub.toJSON();
        //     sub.isSubActive = isSubActive(sub.expires);

        //     return sub;
        // }
        throw new AppError(`User ${username} not found`, null, 401);
    }

    /**
     * Adds new coin option
     * @param {Object} data the new subscription options
     * @param {Object} photo upload photo object
     *
     * @param {number} data.amount the number of coins subscribers get
     * @param {number} data.cost the cost (in Naira) of this subscription
     * @param {string} data.title the title of this sub option
     * @param {string} data.photo photo to be used for frontend pages
     * @param {string} data.primary_color hexadecimal color value
     * @param {string} data.footer_color hexadecimal color value
     */
    public addSubOption = async (data: any, photo: any) => {
        const validColors: boolean = this.isValidHex([data.primary_color, data.footer_color]);
        if (validColors) {
            data.photo = photo.location;
            // return CoinModel.create(data).then((saved) => {
            //     return saved;
            // });
        }
        throw new AppError("Invalid color values", null, 400);
    }

    /**
     * Remove coin option
     * @param {number} id the ID to lookup
     */
    public removeSubOption = async (id: number) => {
        // const subOption = await CoinModel.findByPk(id);
        // if (subOption) {
        //     const options = {
        //         force: true,
        //     };

        //     return CoinModel.destroy({where: {id}, ...options}).then((rows) => {
        //         if (rows > 0) {
        //             return "deleted";
        //         }
        //         throw new AppError("Could not delete coin model.", null, 400);
        //     });
        // }

        throw new AppError("Cannot perform that action.", null, 401);
    }

    /**
     * Gets the list of subscription options available
     */
    public viewSubOptions = async () => {
        // const coins = await CoinModel.findAll();
        // if (coins) {
        //     return coins;
        // }

        throw new AppError("No subscription options exist at the time", null, 401);
    }

    /**
     * Charges a customer using one of two channels
     * @param {Object} user
     */
    public chargeCustomer = async (data: any, channel: string) => {
        let transactionSuccessful: boolean = false;
        let transaction: any;
        switch (channel) {
            case "bank":
                transaction = await this.chargeBank(data);
                transactionSuccessful = (transaction.status) ? true : false;
                break;

            case "ussd":
                // do stuff
                transaction = await this.chargeUssd(data);
                transactionSuccessful = (transaction.status) ? true : false;
                break;

            case "otp":
                // do stuff
                transaction = await this.sendOTP(data);
                transactionSuccessful = (transaction.status) ? true : false;
                break;

            case "send_birthday":
                transaction = await this.sendBirthday(data);
                transactionSuccessful = (transaction.status) ? true : false;
                break;

            default:
                throw new AppError("Unknown Transaction Channel", null, 400);
        }

        if (transactionSuccessful) {
            return transaction;
        }

        throw new AppError(
            (transaction.data.message) ? transaction.data.message : transaction.message,
            null, 400);
    }

    /**
     * Process USSD payment via Paystack webhook
     * @param {Object} data the payment information from Paystack
     */
    public processUssdPayment = async (data: any) => {
        const paystackData = data.data;
        const user = await UserModel.findOne({ where: { email: paystackData.customer.email } });
        if (user) {
            let paymentData = {
                coins_purchased: (paystackData.metadata.coins_purchased) ? paystackData.metadata.coins_purchased : null,
                transaction_reference: paystackData.reference,
                payment_channel: "ussd",
                device: "",
                type: paystackData.metadata.type,
                amount_paid: (paystackData.metadata.amount) ? paystackData.metadata.amount / 100 : null,
                duration: paystackData.metadata.duration,
            };

            let update: any;

            if (paymentData.type == "coins") {
                update = await this.purchaseCoins(user, paymentData);
            } else if (paymentData.type == "subscription") {
                update = await this.purchaseSubscription(user, paymentData);
            }

            if (update) {
                let sub = await user.getSubscription();
                sub = sub.toJSON();
                sub.isSubActive = isSubActive(sub.expires);
                // const message = (paymentData.type == "coins")
                //     ? `Your purchase of ${paymentData.coins_purchased} coins was successful`
                //     : `Your payment of NGN${paymentData.amount_paid} was successful`;
                // await this._notifications.sendNotification(
                //     message,
                //     contexts.COIN_PURCHASE,
                //     false,
                //     sub,
                //     null,
                //     user.id,
                //     false,
                // );
                logger.info("saved purchase via webhook");
                return "saved successfully";
            }
        }
        return "payment successful";
    }

    /**
     * Checks if colors are valid hex values
     *
     * @param {string[]} arr an array of hex color values
     * @returns boolean
     */
    private isValidHex(arr: string[]) {
        for (const color of arr) {
            if (/^#[0-9A-F]{6}$/i.test(color) == false) {
                return false;
            }
        }
        return true;
    }

    /**
     * Checks if subscription is valid
     *
     * @param {number} amount the amount of coins user is purchasing
     * @param {string} transaction_reference unique transaction reference
     * @returns a subscription object
     */
    // private validateSubscription = async (amount: number, transaction_reference?: string) => {
    //     // const subscription = await CoinModel.findOne({
    //     //     where: {amount},
    //     // });

    //     const req = await fetch(`https://api.paystack.co/transaction/verify/${transaction_reference}`, {
    //         headers: { Authorization: `Bearer ${this.paystackKey}` },
    //     });
    //     const paymentStatus: any = await req.json();
    //     if (!paymentStatus.status) {
    //         logger.error(paymentStatus.message);
    //         throw new AppError(paymentStatus.message, null, 401);
    //     }
    //     // return subscription;
    // }

    /**
     * Saves successful payment information
     * @param {Object} user the current user
     * @param {Object} paymentData information about the purchase
     */
    private savePaymentInformation = async (user: any, paymentData: any) => {
        const payment = await PaymentModel.create(paymentData);
        if (payment && user.addPayment(payment)) {
            logger.info("payment saved");
        }
        return false;
    }

    /**
     * Initiate a bank charge for the customer
     * @param {Object} data the customer's bank information
     */
    private chargeBank = async (data: any) => {
        const body = {
            email: data.email_address,
            amount: data.amount,
            bank: {
                code: data.bank_code,
                account_number: data.account_number,
            },
            birthday: data.birthday,
        };

        const req = await fetch(`https://api.paystack.co/charge/`, {
            method: "POST",
            body: JSON.stringify(body),
            headers: {
                "Authorization": `Bearer ${this.paystackKey}`,
                "Content-Type": "application/json",
            },
        });

        let paymentStatus = await req.json();

        if (!paymentStatus.status) {
            throw new AppError((paymentStatus.data) ? paymentStatus.data.message : paymentStatus.message);
        }

        return paymentStatus;
    }

    /**
     * Send OTP for ongoing transaction
     * @param {Object} data the customer's OTP and ongoing transaction reference
     */
    private sendOTP = async (data: any) => {
        const body = {
            otp: data.otp,
            reference: data.reference,
        };
        const req = await fetch(`https://api.paystack.co/charge/submit_otp/`, {
            method: "POST",
            body: JSON.stringify(body),
            headers: {
                "Authorization": `Bearer ${this.paystackKey}`,
                "Content-Type": "application/json",
            },
        });
        let paymentStatus = await req.json();
        if (!paymentStatus.status) {
            throw new AppError((paymentStatus.data) ? paymentStatus.data.message : paymentStatus.message);
        }
        return paymentStatus;
    }

    /**
     * Send Birthday for ongoing transaction
     * @param {Object} data the customer's date of birth and ongoing transaction reference
     */
    private sendBirthday = async (data: any) => {
        const body = {
            birthday: data.birthday,
            reference: data.reference,
        };
        const req = await fetch(`https://api.paystack.co/charge/submit_birthday/`, {
            method: "POST",
            body: JSON.stringify(body),
            headers: {
                "Authorization": `Bearer ${this.paystackKey}`,
                "Content-Type": "application/json",
            },
        });
        let paymentStatus = await req.json();
        if (!paymentStatus.status) {
            throw new AppError((paymentStatus.data) ? paymentStatus.data.message : paymentStatus.message);
        }
        return paymentStatus;
    }

    /**
     * Initiate a USSD charge for the customer
     * @param {Object} data the customer information
     */
    private chargeUssd = async (data: any) => {
        const body = {
            email: data.email_address,
            amount: data.amount,
            metadata: {
                amount: data.amount,
                coins_purchased: data.coins_purchased,
                type: data.type,
                duration: (data.duration) ? data.duration : null,
            },
            ussd: {
                type: "737",
            },
        };
        const req = await fetch(`https://api.paystack.co/charge`, {
            method: "POST",
            body: JSON.stringify(body),
            headers: {
                "Authorization": `Bearer ${this.paystackKey}`,
                "Content-Type": "application/json",
            },
        });
        let paymentStatus = await req.json();
        if (!paymentStatus.status) {
            throw new AppError(paymentStatus.message);
        }
        return paymentStatus;
    }
}
