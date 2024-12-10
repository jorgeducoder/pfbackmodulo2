// EJEMPLO DE CLASE


// Importante que este archivo este incluido en mi plantilla porque desde aqui vamos a trabajar con socket.
// en mi proyecto utilizo realTimepPoductsScript.js

const socket = io();
// El cliente envia el id (message) y el contenido del mensaje para el servidor en app.js

console.log("Defini socket = io()");

socket.emit("message", "Hola me estoy comunicando desde un websocket!");

// Del lado del cliente, donde estamos parados ahora, tambien pone como se reciben los mensajes del socket servidor.

socket.on('evento_para_socket_individual', data => {
    console.log('>>>>>>>> evento_para_socket_individual\n', data);
})

socket.on('evento_para_todos_menos_el_socket_actual', data => {
    console.log('>>>>>>>> evento_para_todos_menos_el_socket_actual\n', data);
})

socket.on('evento_para_todos', data => {
    console.log('>>>>>>>> evento_para_todos\n', data);
});