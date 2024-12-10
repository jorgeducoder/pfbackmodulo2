// Aqui hay que hacer el post y el delete desde websocket, y los demas metodos probar que se hagan con Postman.
// Luego para el carrito lo mismo


import { Router } from "express";

// importo el uploader para subir las imagenes, una por producto
import { uploader } from "../middlewares/multer.js";

//import { ProductManager } from "../dao/productManager.js";  lo sustituimos por acceso a la base

import { ProductManagerMdb } from "../dao/productManagerMdb.js";

//const PM = new ProductManager("./src/saborescaseros.json");  
const PM = new ProductManagerMdb;

// Define los metodos para el router de usuarios
const router = Router();



router.get("/", async (req, res) => {
    const {limit} = req.query;
    // Debe ir adentro del get porque utilizo products para el params, si carga uno solo es el que queda para el slice
    let products = await PM.getProduct();
    if (limit) {
       products = products.slice(0, limit);
       }
   // getProductbyId(id);
    res.send(products);
});  

router.get('/:pid', async (req, res) => {
    
    let productId = req.params.pid;
    // Convierto el tipo para que no haya problemas en ProductManager con el ===
    const products = await PM.getProductbyId(parseInt(productId));
    res.send({products});
});


// Nuevo POST  recibe en uploader la/s imagenes


router.post("/", uploader.single("img"), async (req, res) => {
    // En la practica integradora no usamos el post, solo el socket del server para agregar un producto a MongoDB.
    
    const { nombre, porciones, recetadesc, stock, price, categoria, status } = req.body;
    // aunque en el form se controla que ingrese valores numericos si vienen undefined se controla de esta manera
    const porcionesNum = parseInt(porciones, 10);
    const stockNum = parseInt(stock, 10);
    const priceNum = parseInt(price);

    console.log("req.body en products.router:", req.body);
    console.log("Archivo de imagen en products.router:", req.file); // req.file si se subio un archivo

    
    if (!nombre || isNaN(porcionesNum) || !recetadesc || isNaN(stockNum) || isNaN(priceNum) || !categoria)
     
    return res.status(400).send({error: "Faltan datos para agregar al producto!"});
    
    // asigna la imagen a una constante
    const imgPath = req.file ? req.file.path : "";

    try {
        const newProduct = await PM.addProduct({
            title: nombre,
            portions: porcionesNum,
            description: recetadesc,
            thumbnails: imgPath,
            stock: stockNum,
            price: priceNum,
            category: categoria,
            status: "T"
            
        });
        console.log("newProduct en products.router: ", newProduct);
        res.status(201).send(newProduct);


    }catch (error) {
        console.error(error);
        res.status(500).send({error: "Error al procesar la solicitud!"});
    }
 });

 // UPDATE

router.put("/:pid", async (req, res) => {
    const pid = req.params.pid;
    await PM.updateProduct(pid, req.body);
    res.status(200).send({message: "Producto actualizado correctamente!"});
})

router.delete("/:pid", async (req, res) => {
    const pid = req.params.pid;
    await PM.deleteProduct(pid);
    console.log("Se elimino:", pid);
    res.status(201).send({message: "Producto eliminado correctamente!"});
});

export default router;