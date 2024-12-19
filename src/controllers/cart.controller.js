/**
 * Este controlador (manager) ya no interactúa de forma directa con la persistencia,
 * simplemente llama al método del servicio que corresponda
 * 
 * Estamos importando product.service.mongo.js, podríamos tener otros servicios de persistencia
 * también creados.
 * 
 * Si homologamos los métodos, es decir, utilizamos los mismos nombres de métodos en los
 * distintos servicios (para MongoDB, Mysql, etc), no tendremos necesidad de tocar la lógica
 * de negocio acá, el controlador simplemente instanciará un servicio y le solicitará cosas,
 * sin importarle cuál es.
 */

import CartService from '../dao/cart.service.mongo.js';

const service = new CartService();

class CartController {
    constructor() {}

    get = async () => {
        try {
            return await service.getCarts();
        } catch (err) {
            return err.message;
        }
    }

    getOne = async (filter) => {
        try {
            return await service.getCartbyId(filter);
        } catch (err) {
            return err.message;
        };
    };

    getCartProd = async (cid) => {
        try {
            return await service.getcartProducts(cid);
        } catch (err) {
            return err.message;
        };
    };

    getCartByUserid = async (uid) => {
        try {
            return await service.getCartByUser(uid);
        } catch (err) {
            return err.message;
        };
    };

    add = async (data) => {
        try {
            return await service.addCart(data);
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

    deleteCart = async (cid) => {
        try {
            return await service.deleteCartById(cid);
        } catch (err) {
            return err.message;
        }
    }


    deleteProd = async (cid, pid) => {
        try {
            return await service.deleteProductFromCart(cid, pid);
        } catch (err) {
            return err.message;
        }
    }
    
    
    updateProd = async (cid, pid, cantidad) => {
        try {
            return await service.addproductCart(cid, pid, cantidad);
        } catch (err) {
            return err.message;
        }
    }


}
    export default CartController;