import express from "express";
import handlebars from "express-handlebars";
import { Server } from "socket.io";

// Agregadas para usarlas con usuarios
import session from 'express-session';
import cookieParser from 'cookie-parser';
import FileStore from 'session-file-store';
import passport from 'passport';



import __dirname from "./utils.js";

import './utils/handlebarsHelper.js';  // Importar los helpers de Handlebars


// importo los routers
import router from "./routes/products.router.js";
import cartsRouter from "./routes/carts.router.js";
import viewsRouter from "./routes/views.router.js";

// Para autenticar en endpoints que quiera
//import authRouter from './routes/auth.router.js'; de otro pique


// lo utilizo en el socket import { ProductManager } from "./service/ProductManager.js";
import Socket from "./socket.js";
import mongoose from "mongoose";


import config from './config.js';

import usersRouter from './routes/users.router.js';


// hasta aqui


const app = express();

const fileStorage = FileStore(session); // para usuarios con session

// MongoDB connect pongo comentarios porque se conecta desde Mongo Singleton pero lo saco porque no renderiza los productos

//Antes del ? donde empiezan los query params se pone el nombre de la BD a la que quiero acceder que es ecommerce
const uri = "mongodb+srv://jeduclosson:HoIOatEgfADTFsA6@cluster0.ngvrtai.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(uri);


const port = 8080;
// lo utilizo en el socket const products = new ProductManager();

// Middleware

//  app.use(express.static(`${__dirname}/../public`)); no esta en otros proyectos (en el de chat esta asi) esta este app.use(express.static('public')); 

// Para decirle que tu servidor puede recibir datos primitivos desde el cuerpo de la app debes decirle que va a usar la herramienta de express
// para poder utilizar JSON en tus rutas

app.use(express.json()); // Tu server podra leer los datos recibidos por los cuerpos de las paginas (req.body)
app.use(express.urlencoded({ extended: true })); //Podra leer cantidades grandes de datos/complejos. JSON muy grandes 
app.use(express.static('public')); // esta en otros

// handlebars config

// Configuración de Handlebars con las opciones de seguridad desactivadas, agregada por error HB al renderizar
app.engine("handlebars", handlebars.engine({
  runtimeOptions: {
      allowProtoPropertiesByDefault: true,  // Permitir acceso a propiedades de prototipo
      allowProtoMethodsByDefault: true      // Permitir acceso a métodos de prototipo
  }
}));

//app.engine("handlebars", handlebars.engine());
app.set("views", `${__dirname}/views`);
app.set("view engine", "handlebars");


// para usuarios
app.use(cookieParser(config.SECRET));
app.use(session({
    secret: config.SECRET,
    resave: true,
    saveUninitialized: true,
    store: new fileStorage({ path: './sessions', ttl: 60, retries: 0 }),
}));

app.use(passport.initialize());
app.use(passport.session());

// routers - cambio a cartsRouter y dejo solo router porque asi se llaman los router en cart.router.js y product.router.js respectivamente
// El use del viewsRouter lleva el path definido en el get de views.router.js
// si el path de viewsRouter lo pongo en /products, en el endpoint se ejecuta localhost:8080/products
app.use("/api/products", router); // endpoint donde se muestran los productos de la base con get, otras operaciones con postman
app.use("/api/carts", cartsRouter); // idem que anterior
app.use("/products", viewsRouter); // endpoint donde se muestra vista de /products  y /products/realtimeproducts productos en tiempo real


app.use('/views', viewsRouter); // endpoint donde se registra o se logea un usuario con distintas estrategias, session, jwt, pp
app.use('/api/users', usersRouter); // endpoint para mostrar usuarios ingresados
// Para autenticar usuarios antes de ir al endpoint
//app.use('/auth', authRouter); de otro pique
//app.use('/static', express.static(`${config.DIRNAME}/public`));  ya estaria mas arriba

// Se inicia un servidor HTTP
const httpServer = app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});


// Se inicia un servidor websocket en io
const io = new Server(httpServer);
// Se llama a Sockets.js con el servidor websocket definido como parametro 
// para ejecutar las acciones correspondientes. Sockets.js se importo al inicio.
Socket(io);

