import { IBaseInterface } from "../baseInterface";

export interface ISubscriptionPayment extends IBaseInterface{
    amount_paid: number;
    duration: string;
    transaction_reference: string;
    payment_channel: string;
    device: string;
}
