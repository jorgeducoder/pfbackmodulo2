import { Router } from "express";
import { cartManagerMdb } from "../dao/cartManagerMdb.js";
import { ProductManagerMdb } from "../dao/productManagerMdb.js";

// Define los nuevos objetos CM y PM con los metodos y datos del json
const CM = new cartManagerMdb;

// La nueva clase PM en principio la necesito para ver si el producto que se ingresa
// para incorporar al carrito esta en la clase productos
const PM = new ProductManagerMdb;
 

const cartsRouter = Router();


cartsRouter.get("/", async (req, res) => {
    // Desde la raiz se obtienen todos los carritos
    
    const { limit } = req.query;

    let carts = await CM.getCarts();
    if (limit) {
        carts = carts.slice(0, limit);
    }

    res.send(carts);
});


cartsRouter.get('/:cid', async (req, res) => {
    // Dado el id de un carrito lo muestra con sus productos utiizando populate
    let cartId = req.params.cid;
    const cart = await CM.getcartProducts(cartId);

    if (cart.error) {
        return res.status(404).send({ error: cart.error });
    }

    res.send({ cart });
    
});


cartsRouter.post("/", async (req, res) => {
    //Desde la raiz mas api/carts/ se agrega un carrito nuevo sin productos. Ruta definida en app.js
    try {
        const response = await CM.addCart();
        res.json(response);
    } catch (error) {
        res.send("Error al crear carrito")
    }
})




cartsRouter.post("/productos/:pid", async (req, res) => {
    
    //Desde la raiz mas api/carts/ se agrega un producto dado a un carrito nuevo. usado desde HB. Ruta definida en app.js
    
    const { pid } = req.params;
    let { quantity } = req.body;
    
    if (!quantity) {
        quantity = 1 } 

    
    if (!pid || !quantity) {
        return res.status(400).send({ error: "Faltan datos para crear o agregar al carrito" });
    }

    try {

        // Verificar si el producto existe
        const resultp = await PM.getProductbyId(pid);
       
        if (resultp.error) {
            return res.status(404).send({ error: "Producto no existe" });
        }

        // Agregar carrito vacio
        const resultc = await CM.addCart();
        if (resultc.errors) {
            return res.status(404).send({ errors: "Error al crear nuevo carrito en cartsRouter.put" });
        }
        let cid = resultc._id;

        // Intentar agregar o actualizar el producto en el carrito
        const result = await CM.addproductCart(cid, pid, quantity);

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
        const resultp = await PM.getProductbyId(pid);
       
        if (resultp.error) {
            return res.status(404).send({ error: "Producto no existe" });
        }

        // Intentar agregar o actualizar el producto en el carrito
        const result = await CM.addproductCart(cid, pid, quantity);

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
        const result = await CM.deleteProductFromCart(cid, pid);

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
        const result = await CM.deleteCartById(cid);

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