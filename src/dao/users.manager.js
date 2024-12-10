import userModel from './models/user.model.js';
import { createHash, isValidPassword } from '../utils.js';
import { cartManagerMdb } from './cartManagerMdb.js';

const cartmanager = new cartManagerMdb();

// Manager de usuarios

class UserManager {
    constructor() {}

    get = async () => {
        try {
            return await userModel.find().lean();
        } catch (err) {
            return err.message;
        }
    }

    getOne = async (filter) => {
        try {
            return await userModel.findOne(filter).lean();
        } catch (err) {
            return err.message;
        };
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
                
                // Crea un carrito vacío y guarda su ID en el usuario
                
                const emptyCart = await cartmanager.addCart({}); // crea un carrito vacío visto en after
                
                data.cart = emptyCart._id; // asigna el ID del carrito al campo `cart`
                                
                data.password = createHash(data.password);
                
                return await this.add(data);
            } else {
                console.log("Se fue por el null de user!!");
                return null;
            }
        } catch (err) {
            return err.message;
        }
    }
}


export default UserManager;
