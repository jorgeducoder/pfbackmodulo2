import { Router } from "express";
//import { cartManagerMdb } from "../dao/cartManagerMdb.js";
//import { ProductManagerMdb } from "../dao/productManagerMdb.js";
import CartController from '../controllers/cart.controller.js';
import ProductController from '../controllers/product.controller.js';
import TicketController from '../controllers/ticket.controller.js';
import { authMiddleware } from '../utils.js';

import { verifyToken } from "../utils.js";


// Define los nuevos objetos CM y PM con los metodos y datos del json
const CM = new CartController;

// La nueva clase PM en principio la necesito para ver si el producto que se ingresa
// para incorporar al carrito esta en la clase productos
const PM = new ProductController;
 
//const TM = new Ticket;
 const TM = new TicketController;

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
    console.log("En cartsrouter get de carrito y productos: ", cart)
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


cartsRouter.post("/productos/:pid", verifyToken, authMiddleware, async (req, res) => {
    
    //Desde la raiz mas api/carts/ se agrega un producto dado a un carrito nuevo. usado desde HB. Ruta definida en app.js
    
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

cartsRouter.post('/:cid/purchase', async (req, res) => {

    const cartId = req.params.cid;
    const cart = await CM.getOne(cartId);
    console.log("En purchase : ", cart);
    let totalAmount = 0; // Inicializamos el total del carrito

    try {
        // Verificar si el carrito existe
        if (!cart) {
            return res.status(404).json({ message: 'En Post Tickets: Carrito no encontrado' });
        }
       // Extraer los IDs de los productos del carrito
        const productsIds = cart.products.map(p => p._id);

        const productsWithInsufficientStock = [];
        const productsToIncludeInTicket = [];

        // Buscar los productos en la coleccion de productos, utilizo get del controller que llama a getProduct del service y hace un find.lean
        console.log("En purchase1 productos en carrito : ", productsIds);
        
       // console.log("En purchase1a productos en BD del carrito : ", productsEnBd);
        

        console.log("En purchase2 productos en carrito a buscar stock: ", cart.products);

        // ... (lógica para verificar el stock y actualizar los productos con insufficientStock)

        for (const cartProduct of cart.products) {
            
            console.log("En purchase3 en el for con un producto: ", cartProduct, cartProduct._id);
           
            const product = await PM.getOne(cartProduct._id);  // leo todos los atributos del producto

            console.log("En purchase3a en el for con un producto: ", product, product.data._id, product.data.stock);

            // Verifico stock y si no hay guardo la lista de productos, si hay actualizo el stock
            if (product.data.stock < cartProduct.quantity) {
                
                console.log("En purchase4 cantidad menor a stock: ", product.data.stock, cartProduct.quantity);
                //productsWithInsufficientStock.push(cartProduct._id);
                productsWithInsufficientStock.push({
                    _id: cartProduct._id,
                    quantity: cartProduct.quantity,
                });

                console.log("En purchase4a cantidad menor a stock: ", productsWithInsufficientStock);
            } else {
              // Restar el stock del producto

              console.log("En purchase5 cantidad mayor o igual a stock: ", cart.id, product.data.stock, cartProduct.quantity);
              product.data.stock -= cartProduct.quantity;
              //await product.save();
              await PM.updateProductStock(product.data._id, product.data.stock);
              // Calcular el total parcial
             totalAmount += product.data.price * cartProduct.quantity;
             // Agregar producto al ticket
             productsToIncludeInTicket.push({
                productId: cartProduct._id,
                quantity: cartProduct.quantity,
             });

            }
          }
          

        // Crear el ticket
        let nextId = 1;
        function generateSequentialCode() {
        return nextId++;
        }
        
        if (productsToIncludeInTicket.length > 0) { 
             const ticket = {
                
                code: generateSequentialCode(), // Función para generar un código único
                purchase_datetime: new Date(), // Fecha y hora actuales
                amount: totalAmount, // Total calculado durante el bucle
                //purchaser: cart.user.email, // Lo tengo que sacar de user o sesion
                products: productsToIncludeInTicket
                                    
                }
                console.log("En purchase 6 ticket: ", ticket);
                await TM.add(ticket);
        };
        
        
        // Actualizar el carrito para que contenga solo productos sin stock suficiente
        cart.products = productsWithInsufficientStock;
        console.log("En purchase 7 productos sin stock: ", cart.products);
        await CM.updateCartController(cartId, { products: cart.products });
        res.json({ productsWithInsufficientStock });
  
    } catch (error) {
        console.error("Error en el servidor:", error);
        res.status(500).send({ error: "Error interno del servidor." });
    }
});


export default cartsRouter;