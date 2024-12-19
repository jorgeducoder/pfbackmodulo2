// Para hacer publica la carpeta publics cuando se suba el prpoyecto a un servidor

import { fileURLToPath } from "url";
import { dirname } from "path";

// Para trabajar con helpers en handlebars
import Handlebars from 'handlebars';

// bcrypt para trabajar con claves encriptadas y jwt para trabajar con jason web token, config porque hay variables para JWT
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from './config.js';

import CartService from './controllers/cart.controller.js';

const service = new CartService();

// Este config contiene varias variables que en mi proyecto estan en otros lados, y algunas variables nuevas, A REVISAR
// import config from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default __dirname;



// Helper para calcular el subtotal
Handlebars.registerHelper('calcSubtotal', function (quantity, price) {
  return quantity * price;
});

// Helper para calcular el total del carrito
Handlebars.registerHelper('calcTotal', function (products) {
  return products.reduce((acc, item) => acc + item.quantity * item.productId.price, 0);
});


export const createHash = (password) => bcrypt.hashSync(password, bcrypt.genSaltSync(10));

export const isValidPassword = (passwordToVerify, storedHash) => bcrypt.compareSync(passwordToVerify, storedHash);

export const createToken = (payload, duration) => jwt.sign(payload, config.SECRET, { expiresIn: duration });


/**
 * Middleware para verificar autenticación con JWT o GitHub y usar en /products para tener el carrito ya creado del usuarios
 */
export const authMiddleware = (req, res, next) => {
    if (req.session?.passport?.user) {
        // Usuario autenticado por GitHub
        req.authUser = {
            method: 'GitHub',
            user: req.session.passport.user,
        };
        console.log(`En authMiddleware Autenticado por GitHub:`, req.authUser.user);
    } else if (req.user) {
        // Usuario autenticado por JWT
        req.authUser = {
            method: 'JWT',
            user: req.user,
        };
        console.log(`En authMiddleware. Autenticado por JWT:`, req.authUser.user);
    } else {
        // Sin autenticación válida
        return res.status(401).send({ error: 'En utils authMiddleware. No autenticado' });
    }
    next();
};


/**
 * Este middleware chequea si llega un token JWT por alguna de las 3 vías habituales
 * (headers, cookies o query). Si todo está ok, extrae su carga útil (payload)
 * y la agrega al objeto req (req.user) para que pueda ser usada en distintos endpoints
 */
/*export const verifyToken = (req, res, next) => {
    
    // Verificar sesión activa con GitHub
    if (req.session?.passport?.user) {
        console.log("Autenticado con GitHub:", req.session.passport.user);
        return next(); // Permitir la solicitud
    };
    
    const headerToken = req.headers.authorization ? req.headers.authorization.split(' ')[1] : undefined;
    const cookieToken = req.cookies && req.cookies[`${config.APP_NAME}_cookie`] ? req.cookies[`${config.APP_NAME}_cookie`] : undefined;
    const queryToken = req.query.access_token ? req.query.access_token : undefined;
    const receivedToken = headerToken || cookieToken || queryToken;
    console.log("Token recibido en verifyToken :", receivedToken);
   
    
    if (!receivedToken) return res.status(401).send({ error: 'Se requiere token', data: [] });

    jwt.verify(receivedToken, config.SECRET, (err, payload) => {
        if (err) return res.status(403).send({ error: 'Token no válido', data: [] });
        
        req.user = payload;
        console.log("Token recibido :", req.user);
        next();
    });
    
};*/

/**
 * Este middleware chequea si llega un token JWT por alguna de las 3 vías habituales
 * (headers, cookies o query). Si todo está ok, extrae su carga útil (payload)
 * y la agrega al objeto req (req.user) para que pueda ser usada en distintos endpoints
 */

export const verifyToken = async (req, res, next) => {
    // Verificar sesión activa con GitHub
    if (req.session?.passport?.user) {
        console.log("Autenticado con GitHub:", req.session.passport.user);
        return next(); // Permitir la solicitud
    }

    const headerToken = req.headers.authorization ? req.headers.authorization.split(' ')[1] : undefined;
    const cookieToken = req.cookies && req.cookies[`${config.APP_NAME}_cookie`] ? req.cookies[`${config.APP_NAME}_cookie`] : undefined;
    const queryToken = req.query.access_token ? req.query.access_token : undefined;
    const receivedToken = headerToken || cookieToken || queryToken;
    console.log("Token recibido en verifyToken:", receivedToken);

    if (!receivedToken) return res.status(401).send({ error: 'Se requiere token', data: [] });

    jwt.verify(receivedToken, config.SECRET, async (err, payload) => {
        if (err) return res.status(403).send({ error: 'Token no válido', data: [] });

        try {
            // Asociar datos adicionales como cartId al req.user
            console.log("En verifytoken busco carrito de usuario con: ", payload.cartId, payload);
            
           // const userCart = await service.getCartByUserid(payload.cartID); // Da error y en payload tengo lo que necesito
            
            //console.log("En verifytoken get me devuelve: ", userCart);

            //req.user = { ...payload, cartId: userCart?.id || null }; // Agregar cartId al token decodificado
            //console.log("Token verificado con datos adicionales:", req.user);

            //req.user = { ...payload}; no hace falta
             req.user = payload;
            console.log("req.user igual a payload:", req.user);

            next();
        } catch (error) {
            console.error("Error al obtener datos adicionales en verifyToken:", error);
            return res.status(500).send({ error: 'Error interno al procesar el token', data: [] });
        }
    });
};



import nodemailer from 'nodemailer';

// Configuración del transporte de Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail', // u otro
    auth: {
        user: 'jeduclosson@gmail.com', // 
        pass: 'ipnm gcpf tltv euel'      // 
    }
});

// Función para enviar correos electrónicos
export const enviarCorreo = (destinatario, asunto, mensaje) => {
    return transporter.sendMail({
        from: 'jedhermida@gmail.com', // Cambia esto por tu email
        to: destinatario,
        subject: asunto,
        html: mensaje
    });
};









