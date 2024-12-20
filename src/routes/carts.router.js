import { Router } from "express";
//import { cartManagerMdb } from "../dao/cartManagerMdb.js";
//import { ProductManagerMdb } from "../dao/productManagerMdb.js";
import CartController from '../controllers/cart.controller.js';
import ProductController from '../controllers/product.controller.js';
import { authMiddleware } from '../utils.js';

import { verifyToken } from "../utils.js";


// Define los nuevos objetos CM y PM con los metodos y datos del json
const CM = new CartController;

// La nueva clase PM en principio la necesito para ver si el producto que se ingresa
// para incorporar al carrito esta en la clase productos
const PM = new ProductController;
 

const cartsRouter = Router();

//cartsRouter.use(authMiddleware); // Ver si es necesario. Aplica el middleware a todas las rutas de este router. 



cartsRouter.get("/", async (req, res) => {
    // Desde la raiz se obtienen todos los carritos
    
    const { limit } = req.query;

    let carts = await CM.get();
    if (limit) {
        carts = carts.slice(0, limit);
    }

    res.send(carts);
});


cartsRouter.get('/:cid', async (req, res) => {
    // Dado el id de un carrito lo muestra con sus productos utiizando populate
    let cartId = req.params.cid;
    const cart = await CM.getCartProd(cartId);

    if (cart.error) {
        return res.status(404).send({ error: cart.error });
    }

    res.send({ cart });
    
});


cartsRouter.post("/", async (req, res) => {
    //Desde la raiz mas api/carts/ se agrega un carrito nuevo sin productos. Ruta definida en app.js
    try {
        const response = await CM.add();
        res.json(response);
    } catch (error) {
        res.send("Error al crear carrito")
    }
})




/*cartsRouter.post("/productos/:pid", async (req, res) => {
    
    //Desde la raiz mas api/carts/ se agrega un producto dado a un carrito nuevo. usado desde HB. Ruta definida en app.js
    
    // Para BE Mod2 ya viene el carrito creado y la sesion del usuario, habria que agregar productos mientras  el usuario
    // vea el carrito/agregue productos/vea carrito y salga, generar ticket y terminar transaccion
    const { pid } = req.params;
    let { quantity } = req.body;
    
    if (!quantity) {
        quantity = 1 } 

    
    if (!pid || !quantity) {
        return res.status(400).send({ error: "Faltan datos para crear o agregar al carrito" });
    }

    try {

        // Verificar si el producto existe
        const resultp = await PM.getOne(pid);
       
        if (resultp.error) {
            return res.status(404).send({ error: "Producto no existe" });
        }

        // Agregar carrito vacio
        const resultc = await CM.add();
        if (resultc.errors) {
            return res.status(404).send({ errors: "Error al crear nuevo carrito en cartsRouter.put" });
        }
        let cid = resultc._id;

        // Intentar agregar o actualizar el producto en el carrito
        const result = await CM.updateProd(cid, pid, quantity);

        // Verificar si ocurrió un error en addproductCart
        
        if (result.error) {
            
            return res.status(400).send({ error: result.error });
        }

        // Responder según el resultado exitoso
        res.status(201).send({ message: result.message });
    } catch (error) {
        // Manejar cualquier error inesperado
        console.error(error);
        res.status(500).send({ error: "Error interno del servidor." });
    }
});*/

cartsRouter.post("/productos/:pid", verifyToken, authMiddleware, async (req, res) => {
    
    //Desde la raiz mas api/carts/ se agrega un producto dado a un carrito nuevo. usado desde HB. Ruta definida en app.js
    
    // Para BE Mod2 ya viene el carrito creado y la sesion del usuario, habria que agregar productos mientras  el usuario
    // vea el carrito/agregue productos/vea carrito y salga, generar ticket y terminar transaccion
    // Se deja de crear un carrito vacio porque ya viene en los datos del usuario. A ese carrito es al que se deben agregar los productos.
    
    const { pid } = req.params;
    let { quantity } = req.body;
    
    const { method, user } = req.authUser;

    console.log(`Método de autenticación: ${method}`);
    console.log(`Usuario autenticado: ${JSON.stringify(user)}`);

    if (!quantity) {
        quantity = 1 } 

    
    if (!pid || !quantity) {
        return res.status(400).send({ error: "Faltan datos para crear o agregar al carrito" });
    }

    try {

        // Verificar si el producto existe
        const resultp = await PM.getOne(pid);
       
        if (resultp.error) {
            return res.status(404).send({ error: "Producto no existe" });
        }

        // veo que datos tengo de la sesion de usuario y llega hasta aqui desde endpoint /products
        const { method, user } = req.authUser;
        const cartId = user.cart ? user.cart.toString() : null; 
       
        if (method === 'GitHub') {
            console.log(`Usuario autenticado github: ${JSON.stringify(user.cart)}`);
            if (!cartId) {
                return res.status(400).send({ error: "No se encontró carrito asociado al usuario de GitHub." });
            }
        } else if (method === 'JWT') {
            cartId = user.cart;
            if (!cartId) {
                return res.status(400).send({ error: "No se encontró carrito asociado al usuario de JWT." });
            }
        }

        console.log(`Carrito asociado (${method}): ${cartId}`);

        //return res.status(201).send({ message: "No quiero dar de alta carrito desde cartsRouter.post" });
    
        // Agregar carrito vacio no lo hago si es GH, si es JWT lo hago y tengo que asociarselo al username.
         // veo que datos tengo de la sesion de usuario y llega hasta aqui desde endpoint /products
        //const userGitHubLogin = req.session?.passport?.user;
       // const userJWTLogin = req.user;
      //  console.log("En post productos/:pid de carts.router: ", userGitHubLogin, userJWTLogin)
        
        const resultc = await CM.add();
        if (resultc.errors) {
            return res.status(404).send({ errors: "Error al crear nuevo carrito en cartsRouter.put" });
        }
        
        // veo que datos tengo de la sesion de usuario y llega hasta aqui desde endpoint /products
       // const userGitHubLogin = req.session?.passport?.user?;
       // const userJWTLogin = req.user?;


        let cid = resultc._id;

        // Intentar agregar o actualizar el producto en el carrito
        const result = await CM.updateProd(cid, pid, quantity);

        // Verificar si ocurrió un error en addproductCart
        
        if (result.error) {
            
            return res.status(400).send({ error: result.error });
        }

        // Responder según el resultado exitoso
        res.status(201).send({ message: result.message });
    } catch (error) {
        // Manejar cualquier error inesperado
        console.error(error);
        res.status(500).send({ error: "Error interno del servidor." });
    }
});

cartsRouter.put("/:cid/productos/:pid", async (req, res) => {
    const { cid, pid } = req.params;
    let { quantity } = req.body;
    
    if (!quantity) {
        quantity = 1 } 

    if (!cid || !pid || !quantity) {
        return res.status(400).send({ error: "Faltan datos para crear o agregar al carrito" });
    }

    try {
        // Verificar si el producto existe
        const resultp = await PM.getOne(pid);
       
        if (resultp.error) {
            return res.status(404).send({ error: "Producto no existe" });
        }

        // Intentar agregar o actualizar el producto en el carrito
        const result = await CM.updateProd(cid, pid, quantity);

        // Verificar si ocurrió un error en addproductCart
        
        if (result.error) {
            
            return res.status(400).send({ error: result.error });
        }

        // Responder según el resultado exitoso
        res.status(201).send({ message: result.message });
    } catch (error) {
        // Manejar cualquier error inesperado
        console.error(error);
        res.status(500).send({ error: "Error interno del servidor." });
    }
});


cartsRouter.delete("/:cid/productos/:pid", async (req, res) => {
    
    // elimina un producto del carrito
    
    const { cid, pid } = req.params;
    
    if (!cid || !pid ) {
        return res.status(400).send({ error: "Faltan datos para eliminar el producto" });
    }

    try {
        // Llamar al método para eliminar el producto del carrito
        const result = await CM.deleteProd(cid, pid);

        if (!result.success) {
            return res.status(404).send({ error: result.error });
        }

        res.status(200).send({ message: result.message });
    } catch (error) {
        console.error("Error en el servidor:", error);
        res.status(500).send({ error: "Error interno del servidor." });
    }
});

cartsRouter.delete("/:cid", async (req, res) => {
   
    // Elimina carrito y sus productos
   
    const { cid } = req.params;

    try {
        // Llamar al método para eliminar el carrito
        const result = await CM.deleteCart(cid);

        if (!result.success) {
            return res.status(404).send({ error: result.error });
        }

        res.status(200).send({ message: result.message });
    } catch (error) {
        console.error("Error en el servidor:", error);
        res.status(500).send({ error: "Error interno del servidor." });
    }
});


export default cartsRouter;