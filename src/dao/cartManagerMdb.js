import cartModel from "./models/cartModel.js";
import mongoose from "mongoose";

// reutiliza los manager para mantener los mismos nombres de los metodos y no tener que cambiar la llamada a ellos en los routers

class cartManagerMdb {

    async getCarts() {
        // Retorna todos los carritos del objeto sin populate

        try {
            return await cartModel.find().lean().populate('products._id'); // se agrega lean() porque mongo devuelve un objeto mongo 

        } catch (error) {
            console.error(error.message);
            throw new Error("Error al buscar los carritos");
        }
    }


    async getCartbyId(id) {
        // Obtener un carrito por su ID sin populate
        const cart = await cartModel.findOne({ _id: id });

        if (!cart) throw new Error(`El carrito ${id} no existe!`);

        return cart;

    }

    
    async getcartProducts(cid) {
        try {
            // Buscar el carrito por su ID y populate de los productos con nombre modelo y atributo de los ID en el array de productos
            const cart = await cartModel.findById(cid).populate('products._id');
    
            if (!cart) {
                return { error: 'Carrito no encontrado' };
            }
    
            return cart;
        } catch (err) {
            console.error('Error al obtener los productos del carrito:', err);
            return { error: 'Error al obtener el carrito' };
        }
    }
    


    async addCart(cart) {

        try {
            const result = await cartModel.create(cart);
            console.log("Carrito creado sin  productos");
            return result;
        } catch (e) {
            console.error("Error al agregar el carrito\n", e);

        }
    }

    

    
    async addproductCart(cid, pId, cantidad) {
        try {
            // Verificar que la cantidad sea válida
            if (cantidad <= 0) {
                return { error: "La cantidad debe ser mayor a cero." };
            }
    
            // Buscar el carrito
            const cartp = await cartModel.findById(cid);
            if (!cartp) {
                
                return { error: "Carrito no encontrado." };
            }
    
            // Buscar el producto en el carrito por su ID
            const productoEncontrado = cartp.products.find(product => product._id.toString() === pId);
    
            if (productoEncontrado) {
                // Si el producto existe, actualizar su cantidad sumando la cantidad nueva
                productoEncontrado.quantity += cantidad;
                await cartp.save();
                console.log('Cantidad actualizada.');
                return { message: "Cantidad actualizada.", status: "updated" };
            } else {
                // Si el producto no existe, agregarlo al carrito con la cantidad proporcionada
                cartp.products.push({ _id: pId, quantity: cantidad });
                await cartp.save();
                console.log('Producto agregado al carrito.');
                return { message: "Producto agregado al carrito.", status: "added" };
            }
        } catch (err) {
            console.error('Error al actualizar el carrito:', err);
            // Devolver el error en lugar de lanzarlo
            return { error: 'Error al actualizar el carrito.' };
        }
    }
    
    async deleteProductFromCart(cid, pid) {
        try {
            // Buscar el carrito por su ID
            const cart = await cartModel.findById(cid);
    
            if (!cart) {
                return { success: false, error: `Carrito no encontrado ${cid}` };
            }
    
            // Buscar el producto en el carrito
            const productIndex = cart.products.findIndex(product => product._id.toString() === pid);
    
            if (productIndex === -1) {
                return { success: false, error: `Producto con ID ${pid} no encontrado en el carrito` };
            }
    
            // Eliminar el producto del carrito
            cart.products.splice(productIndex, 1);  // Elimina el producto en la posición encontrada
    
            // Guardar el carrito actualizado
            await cart.save();
    
            return { success: true, message: `Producto con ID ${pid} eliminado del carrito` };
        } catch (err) {
            console.error("Error al eliminar el producto del carrito:", err);
            return { success: false, error: "Error al eliminar el producto del carrito" };
        }
    }
    
    
    async deleteCartById(cid) {
        try {
            // Verificar si el ID es un ObjectId válido
            if (!mongoose.Types.ObjectId.isValid(cid)) {
                return { success: false, error: `El ID ${cid} no es un ObjectId válido!` };
            }
    
            const cart = await cartModel.findByIdAndDelete(cid);
    
            if (!cart) {
                return { success: false, error: `El carrito con ID ${cid} no fue encontrado.` };
            }
    
            return { success: true, message: `Carrito con ID ${cid} eliminado exitosamente.` };
        } catch (err) {
            console.error('Error al eliminar el carrito:', err);
            return { success: false, error: 'Error al eliminar el carrito.' };
        }
    }
    

}



export { cartManagerMdb };




