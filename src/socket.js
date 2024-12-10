// Saco el intercambio del socket con el cliente fuera de app. En app tengo que importarlo
// Cuando pongo a coorer el servidor en APP, se ejecuta io.on 

//import ProductManager from "./dao/productManager.js";
// Cambio el import al de la DB y cambio en el views para que realtimeproducts vea los de la base 
import { ProductManagerMdb } from "./dao/productManagerMdb.js";


//La sentencia export default (io) => {  exporta 
// la función desde el archivo sockets.js


export default (io) => {
  const productManager = new ProductManagerMdb();
  

  //  Maneja la conexion y cuando un cliente se conecta al servidor se llama a la funcion handleConnection)
  io.on("connection", handleConnection);

  function handleConnection(socket) {
    console.log(`Nuevo cliente conectado ${socket.id}`);
    // Publicaa los productos y se pone a escuchar los eventos
    emitProducts(socket);
    // Publicaa los mensajes tambien. Si lo saco el nuevo cliente ve los mensajes cuando se identifica
    // y escribe un mensaje. Que es lo correcto.
   // emitMessages(socket);


    // En el endpoint realtimeproducts a traves del viewsrouter correspondiente
    // recibe los emit del add o el delete
    
       socket.on("add", async (product) => {
      try {
        // Guardar el producto en la base de datos
        await addProductAndEmit(product);
        // Emitir el evento "addProductSuccess" al cliente para confirmar que el producto se ha agregado correctamente
        socket.emit("addProductSuccess");
      } catch (error) {
        console.error("Error al guardar el producto:", error);
        // Puedes manejar el error aquí si es necesario
      }
    });

    socket.on("delete", async (id) => {
      console.log("ID del producto a eliminar en socket:", id);
      try {
        await deleteProductAndEmit(id);
      } catch (error) {
        console.error("Error al eliminar el producto:", error);
      }
      
    });

    
    
  }

  // Emite los productos a los clientes conectados


  async function emitProducts(socket) {
    const productsList = await productManager.getProduct();
    socket.emit("products", productsList);
  }

  async function addProductAndEmit(product) {
    await productManager.addProduct(product);
    emitProducts(io);
  }

  async function deleteProductAndEmit(id) {
    await productManager.deleteProduct(id);
    emitProducts(io);
  }

    
}
