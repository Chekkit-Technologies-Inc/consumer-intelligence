import { BaseController } from "../baseController";
import { SubscriptionService } from "./subscriptionService";

/**
 * Subscription controller
 *
 * @export
 * @class SubscriptionController
 */
export class SubscriptionController extends BaseController {
    private _subscriptionService = new SubscriptionService();

    public index = () => {
        return this.sendResponse("Subscription");
    }

    /**
     * addSubOption
     */
    public addSubOption = async (data: any, photo: any) => {
        if (!photo) {
            return this.sendResponse(null, "Upload failed", 400);
        }
        const subscription = await this._subscriptionService.addSubOption(data, photo);
        return this.sendResponse(subscription);
    }

    /**
     * removeSubOption
     */
    public removeSubOption = async (id: number) => {
        const updated = await this._subscriptionService.removeSubOption(id);
        return this.sendResponse(updated);
    }

    /**
     * viewSubOptions
     */
    public viewSubOptions = async () => {
        const coins = await this._subscriptionService.viewSubOptions();
        return this.sendResponse(coins);
    }

    /**
     * purchaseCoins
     */
    public purchase = async (user: any, data: any, type: string) => {
        const subStatus = await this._subscriptionService.purchaseSubscription(user, data);
        return this.sendResponse(subStatus);
    }

    /**
     * chargeCustomer
     */
    public chargeCustomer = async (data: any, type: string = "bank") => {
        const transaction = await this._subscriptionService.chargeCustomer(data, type);
        return this.sendResponse(transaction);
    }

    /**
     * getSubscriptionStatus
     */
    public getSubscriptionStatus = async (username: string) => {
        const subStatus = await this._subscriptionService.getSubscriptionStatus(username);
        return this.sendResponse(subStatus);
    }

    /**
     * processUssdPayment
     */
    public processUssdPayment = async (data: any) => {
        const response = await this._subscriptionService.processUssdPayment(data);
        return this.sendResponse(response);
    }

}
