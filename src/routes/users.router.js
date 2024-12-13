import { Router } from 'express';
import passport from 'passport';

// sustituyo el uploader a como se utiliza para products, desde el middlewares
//import { uploader } from '../uploader.js';
//import { uploader } from "../middlewares/multer.js";
import UserController from '../controllers/user.controller.js';
import initAuthStrategies from '../auth/passport.config.js';
import { createToken, verifyToken } from '../utils.js';
import { enviarCorreo } from '../utils.js';

const router = Router();
const manager = new UserController();
initAuthStrategies();

export const auth = (req, res, next) => {
    //if ((req.session?.userData && req.session?.userData.admin) || req.session?.passport.user) {
        //if (req.session?.userData && req.session?.userData.admin)  {
        if (req.session?.passport.user)  { 
            console.log("Entre a auth :", req.session)
          next();
    } else {
        res.status(401).send({ error: 'No autorizadoen auth', data: [] });
    }
}

router.get('/', async (req, res) => {
    try {
        const data = await manager.get();
        res.status(200).send({ error: null, data: data });
    } catch (err) {
        res.status(500).send({ error: 'Error interno de ejecución del servidor', data: [] });
    }
});



router.delete('/:id?', auth, async (req, res) => {
    try {
        const id = req.params.id;
        
        if (!id) {
            res.status(400).send({ error: 'Se requiere parámetro id', data: null });
        } else {
            const filter = { _id: id };
            const options = {};
            
            const process = await manager.delete(filter, options);
            if (!process) {
                res.status(404).send({ error: 'No se encuentra el usuario', data: [] });
            } else {
                res.status(200).send({ error: null, data: process });
            }
        }
    } catch (err) {
        res.status(500).send({ error: 'Error interno de ejecución del servidor', data: [] });
    }
});

// Registro de un usuario nuevo

router.post('/register', async (req, res) => {
    const { firstname, lastname, username, password } = req.body;
    
    if (firstname != '' && lastname != '' && username != '' && password != '') {
        console.log("usuario en register: ", username);
        const process = await manager.register({ firstName: firstname, lastName: lastname, email: username, password: password });

        if (process) { 
            console.log(" Paso el if en register del user.router :", process)
            //res.status(200).send({ error: null, data: 'Usuario registrado, bienvenido!' });
            
            const mensaje = `
                <h1>¡Bienvenido, ${firstname}!</h1>
                <p>Gracias por registrarte en nuestra plataforma.</p>
               `;

             await enviarCorreo(username, 'Bienvenido a Nuestra Plataforma', mensaje);
            
             res.redirect('/views/profile');
             //res.redirect("/products");

        } else {
            res.status(401).send({ error: 'Ya existe un usuario con ese email', data: [] });
        }
    } else {
        res.status(400).send({ error: 'Faltan campos: obligatorios firstname, lastname, email, password', data: [] });
    }
});


// Login con passport, a través de proveedor externo (Github)
// Habilitamos 2 endpoints pq uno redirecciona al proveedor (ghlogin) y el otro vuelve con el resultado (githubcallback)
router.get('/ghlogin', passport.authenticate('ghlogin', { scope: ['user:email'] }), async (req, res) => {});

router.get('/githubcallback', passport.authenticate('ghlogin', { failureRedirect: '/views/login' }), async (req, res) => {
    req.session.save(err => {
        if (err) return res.status(500).send({ error: 'Error al almacenar datos de sesión', data: [] });

        // res.status(200).send({ error: null, data: 'Usuario autenticado, sesión iniciada!' });
       console.log("Datos de la sesion en ghlogin: ", req.session);
        res.redirect('/products/realtimeproducts');
        //res.redirect('/profile');
    });
});

// Login manual contra nuestra base de datos, utilizando tokens (JWT = JSON Web Tokens)

router.post('/jwtlogin', async (req, res) => {
    const { username, password } = req.body;
    
    if (username != '' && password != '') {
        const process = await manager.authenticate(username, password);
        console.log("Login manual jwt: ", username, password);
        if (process) {
            const payload = { username: username, admin: true };
            const token = createToken(payload, '1h');
            
            //res.status(200).send({ error: null, data: { autentication: 'ok', token: token } });
            
            // Aqui redirijo a la lista de productos 
            console.log("Datos de la sesion manual con JWT: ", req.session, payload);           
            res.redirect('/products');
            
           
        } else {
            res.status(401).send({ error: 'Usuario o clave no válidos', data: [] });
        }
    } else {
        res.status(400).send({ error: 'Faltan campos: obligatorios username, password', data: [] });
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).send({ error: 'Error al cerrar sesión', data: [] });
        
        // res.status(200).send({ error: null, data: 'Sesión cerrada' });
        res.redirect('/views/jwtlogin');
    });
});

// Endpoint protegido por middleware propio (auth)
router.get('/private', auth, (req, res) => {
    res.status(200).send({ error: null, data: 'Este contenido solo es visible por usuarios autenticados' });
});

/**
 * Endpoint protegido por token (verifyToken)
 * 
 * En este caso no protegemos mediante control de datos de sesión, sino por token JWT.
 * Cuando el cliente realiza una solicitud a este endpoint, debe adjuntar su token (credencial),
 * y el middleware verifyToken se encargará de revisar su validez para decidir si le permite
 * continuar o no.
 */
router.get('/private2', verifyToken, (req, res) => {
    res.status(200).send({ error: null, data: 'Este contenido solo es visible por usuarios autenticados' });
});


export default router;