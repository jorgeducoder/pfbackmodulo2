import Handlebars from 'handlebars';


// Helper para calcular el total del carrito
Handlebars.registerHelper('calcTotal', function (products) {
  const acc =  products.reduce((acc, item) => acc + item.quantity * item.price, 0); 
  return acc;
});
