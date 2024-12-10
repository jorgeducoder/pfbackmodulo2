import mongoose from "mongoose";

const cartCollection = "carts";

const cartSchema = new mongoose.Schema({
    // products ya esta definido para el populate
    products: {
        type: [
            {
                _id: {
                    // El tipo del ID generado por Mongo
                    type: mongoose.Schema.ObjectId,
                    // Ponemos la referencia al objeto products
                    ref: "products"
                },
                quantity: {
                    type: Number,
                    default: 1
                }
            }
        ],
        // El array de products se genera vacio en el POST por lo que por defecto creo un array vacio
        // en mi modelo
        default: []
    }
});
// por convencion a la coleccion carts se le asigna una variable cartCollection y
// se agrega que cree el modelo con la coleccion y el esquema
export const cartModel = mongoose.model(cartCollection, cartSchema);
export default cartModel;