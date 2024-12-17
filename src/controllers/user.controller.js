/**
 * Este controlador (manager) ya no interactúa de forma directa con la persistencia,
 * simplemente llama al método del servicio que corresponda
 * 
 * Estamos importando users.service.mongo.js, podríamos tener otros servicios de persistencia
 * también creados.
 * 
 * Si homologamos los métodos, es decir, utilizamos los mismos nombres de métodos en los
 * distintos servicios (para MongoDB, Mysql, etc), no tendremos necesidad de tocar la lógica
 * de negocio acá, el controlador simplemente instanciará un servicio y le solicitará cosas,
 * sin importarle cuál es.
 */

import UserService from '../dao/user.service.mongo.js';
import { createHash, isValidPassword } from '../utils.js';
import UserDTO from '../dao/users.dto.js';

const service = new UserService();


class UserController {
    constructor() {}

    get = async () => {
        try {
            return await service.get();
        } catch (err) {
            return err.message;
        }
    }

    getOne = async (filter) => {
        
        try {
            return await service.get(filter);
        } catch (err) {
            return err.message;
        };
    };

    add = async (data) => {
        try {
            /**
             * Un DTO (Data Transfer Object), es un servicio
             * intermedio encargado de la normalización de datos.
             * 
             * Antes de entregar el objeto al método add del DAO,
             * pasamos por una instancia del DTO que se encarga
             * de normalizar lo necesario (por ejemplo pasar un apellido a mayúsculas),
             * un email a minúsculas, etc.
             */
            
            //const normalizedData = new UserDTO(data);
            console.log("En add de controller: ", data);
            return await service.add(data);
            
        } catch (err) {
            return err.message;
        }
    }

    update = async (filter, update, options) => {
        try {
            return await service.update(filter, update, options);
        } catch (err) {
            return err.message;
        }
    }

    delete = async (filter, options) => {
        try {
            return await service.delete(filter, options);
        } catch (err) {
            return err.message;
        }
    }

    authenticate = async (user, pass) => {
        try {
            const filter = { email: user };
            const foundUser = await service.get(filter);
            console.log("En authenticate de user.controller :", foundUser)
            console.log("Authenticate 1: ", pass, foundUser.password);
            if (foundUser && isValidPassword(pass, foundUser.password)) {
                const { password, ...filteredUser } = foundUser;
                console.log("Authenticate2: ", filteredUser);
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
            const user = await service.get(filter);

            if (user === null) {
                // Cuando el email no esta registrado en validacion con GH se crea el usuario y un carrito vacio.
                
                // Creo Hash y Normalizo los datos
                data.password = createHash(data.password);
                const userDTO = new UserDTO(data, data.password);
                
                //const normalizedData = new UserDTO(data);               
                
                console.log ("En user.controller: ", userDTO, data)
                 
                return await service.add(data);
                //return await service.add(userDTO); // si lo paso asi me daba error en Process del router ????

            } else {
                return null;
            }
        } catch (err) {
            return err.message;
        }
    }
}


export default UserController;
   