import ticketModel from '../dao/models/ticket.Model.js';

class TicketService {
    constructor() {}

    get = async (filter) => {
        try {
            //await MongoSingleton.getInstance(); //Lo anulo porque si valido con gh y pp se corta la conexion, lo habilito para jwt
            if (filter) return await ticketModel.findOne(filter).lean();
            return await ticketModel.find().lean();
        } catch (err) {
            return err.message;
        }
    };

    add = async (data) => {
        
        try {
            console.log("En service agregar ticket: ", data);
            return await(ticketModel.create(data));
        } catch (err) {
            return err.message;
        }
    }



}


export default TicketService;