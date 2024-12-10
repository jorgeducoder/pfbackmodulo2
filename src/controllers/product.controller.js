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

import ProductService from '../dao/product.service.mongo.js';

const service = new ProductService();

class ProductController {
    constructor() {}

    get = async () => {
        try {
            return await service.getProduct();
        } catch (err) {
            return err.message;
        }
    }

    getOne = async (filter) => {
        try {
            return await service.getProductbyId(filter);
        } catch (err) {
            return err.message;
        };
    };

    add = async (data) => {
        try {
            return await service.addProduct(data);
        } catch (err) {
            return err.message;
        }
    }

    update = async (filter, update, options) => {
        try {
            return await service.updateProduct(filter, update, options);
        } catch (err) {
            return err.message;
        }
    }

    delete = async (filter, options) => {
        try {
            return await service.deleteProduct(filter, options);
        } catch (err) {
            return err.message;
        }
    }
}
    export default ProductController;