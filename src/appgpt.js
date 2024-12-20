import express from 'express';
import session from 'express-session';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import cartsRouter from './routes/carts.router.js';
import productsRouter from './routes/products.router.js';
import authRouter from './routes/auth.router.js';

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
    session({
        secret: 'mi_secreto',
        resave: false,
        saveUninitialized: false,
    })
);
app.use(passport.initialize());
app.use(passport.session());

// Configurar rutas después de los middlewares
app.use('/api/carts', cartsRouter);
app.use('/api/products', productsRouter);
app.use('/auth', authRouter);

app.listen(3000, () => console.log('Servidor en puerto 3000'));
