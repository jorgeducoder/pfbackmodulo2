// Para hacer publica la carpeta publics cuando se suba el prpoyecto a un servidor

import { fileURLToPath } from "url";
import { dirname } from "path";

// Para trabajar con helpers en handlebars
import Handlebars from 'handlebars';

// bcrypt para trabajar con claves encriptadas y jwt para trabajar con jason web token, config porque hay variables para JWT
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from './config.js';

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
 * Este middleware chequea si llega un token JWT por alguna de las 3 vías habituales
 * (headers, cookies o query). Si todo está ok, extrae su carga útil (payload)
 * y la agrega al objeto req (req.user) para que pueda ser usada en distintos endpoints
 */
export const verifyToken = (req, res, next) => {
    const headerToken = req.headers.authorization ? req.headers.authorization.split(' ')[1] : undefined;
    const cookieToken = req.cookies && req.cookies[`${config.APP_NAME}_cookie`] ? req.cookies[`${config.APP_NAME}_cookie`] : undefined;
    const queryToken = req.query.access_token ? req.query.access_token : undefined;
    const receivedToken = headerToken || cookieToken || queryToken;
    
   
    
    if (!receivedToken) return res.status(401).send({ error: 'Se requiere token', data: [] });

    jwt.verify(receivedToken, config.SECRET, (err, payload) => {
        if (err) return res.status(403).send({ error: 'Token no válido', data: [] });
        
        req.user = payload;
        next();
    });
    
};








