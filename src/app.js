import express from "express";
import handlebars from "express-handlebars";
import { Server } from "socket.io";

import __dirname from "./utils.js";

import './utils/handlebarsHelper.js';  // Importar los helpers de Handlebars


// importo los routers
import router from "./routes/products.router.js";
import cartsRouter from "./routes/carts.router.js";
import viewsRouter from "./routes/views.router.js";


// lo utilizo en el socket import { ProductManager } from "./service/ProductManager.js";
import Socket from "./socket.js";
import mongoose from "mongoose";

// Agregadas para usarlas con usuarios

import cookieParser from 'cookie-parser';
import session from 'express-session';
import FileStore from 'session-file-store';
import passport from 'passport';

import config from './config.js';

import usersRouter from './routes/users.router.js';


// hasta aqui


const app = express();

const fileStorage = FileStore(session); // para usuarios con session

// MongoDB connect

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


app.use('/views', viewsRouter);
app.use('/api/users', usersRouter);

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

