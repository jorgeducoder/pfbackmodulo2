import mongoose from 'mongoose';
// Se agrega para definir el modelo de tickets solicitado
// Esta línea nos evitará problemas de nombres si Mongoose crea alguna colección no existente
mongoose.pluralize(null);

const collection = 'tickets';

const ticketSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  purchase_datetime: { type: Date, default: Date.now },
  amount: { type: Number, required: true },
  purchaser: { type: String, required: false },
  products: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: { type: Number, required: true }
  }]
});

const model = mongoose.model(collection, ticketSchema);

export default model;
