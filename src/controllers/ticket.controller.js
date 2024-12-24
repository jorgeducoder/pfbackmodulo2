import ticketService from '../dao/ticket.service.mongo.js';

const service = new ticketService();

class TicketController {
    constructor() { }
    get = async () => {
        try {
            return await service.get();
        } catch (err) {
            return err.message;
        }
    }

    add = async (data) => {
        try {

            console.log("En add de controller ticket: ", data);
            return await service.add(data);

        } catch (err) {
            return err.message;
        }
    }

       


}
export default TicketController;