import { BaseController } from "../baseController";
import { MessageService } from "./messageService";

/**
 * Post controller
 *
 * @export
 * @class MessageController
 */
export class MessageController extends BaseController {
    private _messageService = new MessageService();

public index = async (user) => {
    const messages = await this._messageService.getAllMessages( user);
    return this.sendResponse(messages);
}

// get message

public getMessage = async ( messageId: any) => {
    const message = await this._messageService.getMessage( messageId);
    return this.sendResponse(message);
}

// get message

public markAsRead = async ( id,user: any) => {
    const message = await this._messageService.markAsRead( id,user);
    return this.sendResponse(message);
}


// send message

public sendMessage = async ( data: any) => {
    const message = await this._messageService.sendMessage( data);
    return this.sendResponse(message);
}

/**
 * deleteMessage
 */
public deleteMessage = async (data) => {
    const deleted = await this._messageService.deleteMessage(data);
    return this.sendResponse(deleted);
}
}
