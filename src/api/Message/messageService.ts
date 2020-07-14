import { MessageModel } from ".";
import { UserModel } from "../User";
import { AppError } from "../../utils/app-error";
const OneSignal = require('onesignal-node');    
const client = new OneSignal.Client('99a8a8c7-fdaa-4a92-b16a-aaf8dde7cbe3', 'NDk0ZmYzMTctOGFhOC00YTZkLWE1YTktZDBiMzljM2VlNGYy');


export class MessageService {

    /*
      * Return all messages for authenticated user
      */
    public getAllMessages = async (user) => {
        console.log(user)
        let messages = await MessageModel.findAll({ 
            where: { user_id: user.id },
            order: [
                ['id', 'DESC'],
            ],
        });
        // const order: any = [['id', 'ASC']];

        for (let index = 0; index < messages.length; index++) {
          const id = messages[index].id;
          let user = await UserModel.findOne({
            where: { id }, attributes: {
              exclude: [
                "updated_at", "deleted_at",
              ],
            },
          raw: true,
          });

          if(user){
            // products[index].surveyId = survey.id;   
            messages[index].setDataValue('senderName', user.first_name);
       
            // console.log(products[index])
            console.log(user.id)
          }
        }
        if (messages) {
            return messages;
        } else {
            throw new AppError(`No new messages.`);
        }
    }

async sendPushNotification(){
    const notification = {
        contents: {
          'en': 'New notification',
        },
        included_segments: ['Subscribed Users'],
        filters: [
          { field: 'tag', key: 'level'}
        ]
      };
       
      // using async/await
      try {
        const response = await client.createNotification(notification);
        console.log(response.body.id);
      } catch (e) {
        if (e instanceof OneSignal.HTTPError) {
          // When status code of HTTP response is not 2xx, HTTPError is thrown.
          console.log(e.statusCode);
          console.log(e.body);
        }
      }
       
      // or you can use promise style:
      client.createNotification(notification)
        .then(response => {})
        .catch(e => {});
}
  public markAsRead = async (id: any, user: any) => {
    //   console.log(id)
    //   return ;
    //   id =
    let message = await MessageModel.findOne({ where: { id } });
      if (user.id != message.userId) {
        throw new AppError("You are not allowed to perform that operation.", null, 401);
      }
      let data = {
        from: message.from,
        content: message.content,
        production_date: message.user_id,
        messageType: message.messageType,
        status: 1,
      };
      let updated = MessageModel.update(data, { where: { id } });
      if (updated) {
        let message = await MessageModel.findOne({ where: { id } });
        return message;
      }


    throw new AppError("Product batch not found.", null, 401);
  }

    /*
      * getMessages
      */
     public getMessage = async (data) => {
        let messages = await MessageModel.findAll({ where: { id: data.messageId }});
        if (messages) {
            return messages;
        } else {
            throw new AppError(`No new messages.`);
        }
    }

    /*
      * sendMessage
      */
     public sendMessage = async (data) => {
        let messages = await MessageModel.create(data);
        if (messages) {
            return messages;
        } else {
            throw new AppError(`No new messages.`);
        }
    }

    /**
     * Deletes single message of current user
     *
     * @param {Object} data
     * @param {number} data.messageId the message to be deleted
     *
     */

    public deleteMessage = async (data: any) => {
        let message = await MessageModel.findOne({ where: { id: data.messageId } });

        if (message) {
                const softDeleted = await MessageModel.destroy({
                    where: { id: data.messageId },
                });
                if (softDeleted) {
                    return "message deleted";
                } else {
                    throw new AppError("You cannot perform that action", null, 403);
                }
            }
        }
    }
