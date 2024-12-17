import passport from 'passport';
import local from 'passport-local';
import GitHubStrategy from 'passport-github2';
import userManager from '../controllers/user.controller.js';

import config from '../config.js';
import cartManager from '../controllers/cart.controller.js';
import { enviarCorreo } from '../utils.js';
//import { cartManagerMdb } from '../dao/cartManagerMdb.js';

const cartmanager = new cartManager();
const manager = new userManager();

const localStrategy = local.Strategy;

const initAuthStrategies = () => {
    passport.use('login', new localStrategy(
        {passReqToCallback: true, usernameField: 'username'},
        async (req, username, password, done) => {
            try {
                if (username != '' && password != '') {
                    // Para simplificar el código, podemos llamar directamente al manager.authenticate(). Ver dao/users.manager.js.
                    const process = await manager.authenticate(username, password);
                    if (process) {
                        // Si el username (email) y los hash coinciden, process contendrá los datos de usuario,
                        // simplemente retornamos esos datos a través de done(), Passport los inyectará en el
                        // objeto req de Express, como req.user.
                        
                        return done(null, process);
                    } else {
                        return done('Usuario o clave no válidos', false);
                    }
                } else {
                    return done('Faltan campos: obligatorios username, password', false);
                }
            } catch (err) {
                return done(err, false);
            }
        }
    ));

    passport.use('ghlogin', new GitHubStrategy(
        {
            clientID: config.GITHUB_CLIENT_ID,
            clientSecret: config.GITHUB_CLIENT_SECRET,
            callbackURL: config.GITHUB_CALLBACK_URL
        },
        async (req, accessToken, refreshToken, profile, done) => {
            try {
                // Si passport llega hasta acá, es porque la autenticación en Github
                // ha sido correcta, tendremos un profile disponible
                console.log("En passport.config este es el profile de ghlogin: ", profile._json?.email);
                const email = profile._json?.email || null;
                console.log("En passport.config este es el email :", email);
                // Necesitamos que en el profile haya un email
                // Más adelante agregaremos un control alternativo en caso
                // que el profile llegado desde Github no contenga ningún email usable
                if (email) {
                    
                    // Tratamos de ubicar en NUESTRA base de datos un usuario
                    // con ese email, si no está lo creamos y lo devolvemos,
                    // si ya existe retornamos directamente esos datos
                    const foundUser = await manager.getOne({ email: email });
                    
                    if (!foundUser) {
                        
                        const emptyCart = await cartmanager.add({}); // crea un carrito vacío tmbn para GH
                
                        const user = {
                            firstName: profile._json.name.split(' ')[0],
                            lastName: profile._json.name.split(' ')[1],
                            email: email,
                            password: 'none',
                            cart: emptyCart._id // asigna el ID del carrito al campo `cart`
                        }
                        console.log("En passport.config este es el user nuevo USER y cart vacio: ", user);
                        const process = await manager.add(user);

                        // Aqui if process enviar mail de registrado
                        console.log("En passport.config process dsps add: ", process);
                        if (process) {
                            const mensajegh = `
                                            <h1>¡Bienvenido, ${process.firstName}!</h1>
                                            <p>Gracias por registrarte desde GitHub en nuestra plataforma.</p>
                                           `;
                            
                                            await enviarCorreo(process.email, 'Bienvenido a Nuestra Plataforma', mensajegh);
                        
                                        
                                        return done(null, process)};
                                                        
                    } else {
                        return done(null, foundUser);
                    }
                } else {
                    return done(new Error('Faltan datos de perfil'), null);
                }
            } catch (err) {
                return done(err.message, false);
            }
        }
    ));

    passport.serializeUser((user, done) => {
        done(null, user);
    });
        
    passport.deserializeUser((user, done) => {
        done(null, user);
    });
};

export default initAuthStrategies;
