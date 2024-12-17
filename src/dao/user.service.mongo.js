/**
 * Las consultas directas a la base de datos, que antes realizábamos desde
 * nuestro controlador (manager), ahora las encapsulamos en un servicio
 * por separado, que opera exclusivamente con MongoDB.
 * 
 * Si necesitáramos implementar otro motor de base de datos, podríamos
 * crear otro archivo de servicio (por ej para Mysql, Postgres, etc),
 * sin tener que tocar la lógica de negocio en el controlador (ver users.controller.js)
 */

// Ver difeencias con users.manager.js en preentrega

import userModel from '../dao/models/user.model.js';
import MongoSingleton from './mongo.singleton.js';

class UserService {
    constructor() {}

    get = async (filter) => {
        try {
            await MongoSingleton.getInstance(); //Lo anulo porque si valido con gh y pp se corta la conexion, lo habilito para jwt
            if (filter) return await userModel.findOne(filter).lean();
            return await userModel.find().lean();
        } catch (err) {
            return err.message;
        }
    };

    add = async (data) => {
        
        try {
            console.log("Viene de GH o manual con esta data: ", data);
            return await(userModel.create(data));
        } catch (err) {
            return err.message;
        }
    }

    update = async (filter, update, options) => {
        try {
            return await userModel.findOneAndUpdate(filter, update, options);
        } catch (err) {
            return err.message;
        }
    }

    delete = async (filter, options) => {
        try {
            return await userModel.findOneAndDelete(filter, options);
        } catch (err) {
            return err.message;
        }
    }

    /* Anulo los dos porque estan en el Controller
    authenticate = async (user, pass) => {
        try {
            // Ya no autenticamos de forma directa con findOne,
            // sino en 2 pasos, primero tratamos de encontrar un
            // usuario que coincida con el email indicado (user),
            // y luego pasamos las claves (pass y foundUser.password)
            // por el método isValidPassword (ver utils.js)
            const filter = { email: user };
            const foundUser = await userModel.findOne(filter).lean();

            if (foundUser && isValidPassword(pass, foundUser.password)) {
                const { password, ...filteredUser } = foundUser;

                return filteredUser;
            } else {
                return null;
            }
        } catch (err) {
            return err.message;
        }
    }

    register = async (data) => {
        try {
            const filter = { email: data.username };
            const user = await userModel.findOne(filter);

            // Si findOne retorna un nulo, significa que no hay usuario con ese email,
            // entonces continuamos con el proceso de registro
            if (user === null) {
                
                /* Crea un carrito vacío y guarda su ID en el usuario
                
               // const emptyCart = await cartmanager.addCart({}); // crea un carrito vacío visto en after
               // Por ahora lo anulo porque cuando se selecciona un producto ya se crea un carrito 
                //data.cart = emptyCart._id; // asigna el ID del carrito al campo `cart`*/
                
                /*const normalizedData = new UserDTO(data);               
                console.log ("En user.service: ", normalizedData, data)
               
                /*data.password = createHash(data.password);*/
               
                /*normalizedData.password = createHash(data.password);
                return await this.add(data);

                console.log("Data que agrego: ", data)
            } else {
                console.log("Se fue por el null de user!!");
                return null;
            }
        } catch (err) {
            return err.message;
        }
    }*/
}


export default UserService;
