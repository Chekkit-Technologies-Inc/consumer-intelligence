export class UssdBaseController {
    public sendUssdResponse(data, message , statusCode = 200, status = true) {
        return { data, message, statusCode, status };
    }
}

