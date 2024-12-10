import mongoose from 'mongoose';
// Se agrega para definir el modelo de usuarios solicitado
// Esta línea nos evitará problemas de nombres si Mongoose crea alguna colección no existente
mongoose.pluralize(null);

const collection = 'users';


const schema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    age: { type: Number, required: false },
    password: { type: String, required: true },
    cart: { type:mongoose.Schema.Types.ObjectId, required: true, ref: "carts"},
    role: { type: String, enum: ["ADMIN", "PREMIUM", "USER"], default: "USER" }  // deberia ser requerido y debe ser enumerado con 3 roles
});

const model = mongoose.model(collection, schema);


export default model;
