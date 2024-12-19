import { Router } from "express";
//import { ProductManager } from "../dao/productManager.js";

import { auth } from './users.router.js';

//import { ProductManagerMdb } from "../dao/productManagerMdb.js";

import ProductController from '../controllers/product.controller.js';
import CartController from '../controllers/cart.controller.js';
//import { cartManagerMdb } from "../dao/cartManagerMdb.js";

import productModel from '../dao/models/productModel.js';

import { verifyToken } from "../utils.js"; // Middleware que valida el token

const router = Router();
//const products = new ProductManager("./src/saborescaseros.json");
const products = new ProductController();
const CM = new CartController()


router.get("/", verifyToken, async (req, res) => {
  const { limit, page, sort, search, category } = req.query;

  // En verifyToken pregunta si la sesion viene por passport, y si no hace la verificacion del token de JWT
  // Crear el filtro de búsqueda en función del parámetro "search" y "category"
  
  
  let query = {};

  if (search) {
    // Filtrar productos cuyo "title" coincida con el parámetro "search" (insensible a mayúsculas)
    query.title = { $regex: search, $options: 'i' };
  }

  if (category) {
    // Filtrar por categoría si se proporciona
    query.category = category;
  }

  try {
    // Configuración de paginación y ordenación
    const options = {
      limit: parseInt(limit) || 6, // Límite de productos por página
      page: parseInt(page) || 1,    // Número de página
      sort: {}                      // Ordenación
    };

    // Si se especifica un tipo de orden (por precio)
    if (sort) {
      if (sort === 'asc') {
        options.sort.price = 1;  // Ordenar por precio ascendente
      } else if (sort === 'desc') {
        options.sort.price = -1; // Ordenar por precio descendente
      }
    }

    /* Ejecutar la consulta de paginación y
     Renderizar la vista Handlebars con los datos paginados*/

    // Validar inicio de sesión con GitHub o JWT
    const isGitHubLogin = req.session?.passport?.user?.role === "USER";
    const isJWTLogin = req.user?.role === "USER"; // req.user proviene del middleware verifyToken
    console.log("En views.router rol de token:", req.user?.role)

    if (isGitHubLogin || isJWTLogin) {
        
        
        const productList = await productModel.paginate(query, options);
       
        
        res.render("home", {
        title: "Productos desde HTML",
        style: "productList.css",
        productList: productList.docs,      // La lista de productos (array de docs)
        totalPages: productList.totalPages, // Número total de páginas
        currentPage: productList.page,      // Página actual
        hasNextPage: productList.hasNextPage, // Indicador de página siguiente
        hasPrevPage: productList.hasPrevPage, // Indicador de página anterior
        nextPage: productList.nextPage,     // Siguiente página
        prevPage: productList.prevPage,     // Página anterior
        });
    } else {
    // Si el usuario no es ADMIN
    res.status(401).send({ error: "Usuario no autenticado o no tiene el rol adecuado", data: [] });
    };
  } catch (error) {
    
    console.error("Error en views.router:", error);
    res.status(500).send({ error: 'Error al obtener productos' });
  }
});


// renderizo form y lista de productos actualizada desde socket
// Para proyecto final mod2 cambio llamadas a funciones porque pasamos por el Controller
// en endpoint products/realtimeproducts muestra form para agregar y lista actualizada


// Con cambios para validar role de admin

router.get("/realtimeproducts", verifyToken, async (req, res) => {    
  
  try {
      // Verificar si el usuario tiene rol de ADMIN
      // Validar inicio de sesión con GitHub o JWT
      const isGitHubLogin = req.session?.passport?.user?.role === "ADMIN";
      const isJWTLogin = req.user?.role === "ADMIN"; // req.user proviene del middleware verifyToken
      console.log("En views.router RTP rol de token:", req.user?.role)
      
      if (isGitHubLogin || isJWTLogin) {
          // Llamo al método products.get porque uso el controller
          const productList = await products.get();
          
          // Renderizo la plantilla Handlebars definida
          res.render("realTimeProducts", {
              title: "Real Time Products",
              style: "realtimeproducts.css",
              productList
          });
      } else {
          // Si el usuario no es ADMIN
          res.status(401).send({ error: 'Usuario no es Admin RTP', data: [] });
      }
  } catch (error) {
      // Manejo de errores
      res.status(500).send(error.message);
  }
});


// Ruta para obtener los productos de un carrito

router.get("/cart/:cartId", async (req, res) => {
  const { cartId } = req.params;

  try {
    // Buscar el carrito por su ID
    const cart = await CM.getCartProd(cartId);

    if (!cart) {
      return res.status(404).json({ message: 'Carrito no encontrado' });
    }
    

    // Renderizar la vista de Handlebars pasando la lista de productos
    
    // Mapear productos y extraer solo los atributos necesarios
    const products = cart.products.map(product => {
      // Verificar que _id existe antes de acceder a sus propiedades
      if (product._id) {
        return {
          productId: product._id,
          title: product._id.title,
          description: product._id.description,
          price: product._id.price,
          category: product._id.category,
          quantity: product.quantity,
          subtotal: product.quantity * product._id.price,
          cartId: cart._id,
        };
      } else {
        // Si _id no existe, devolver un objeto vacío o con valores predeterminados
        return {
          title: 'Producto no encontrado',
          description: '-',
          price: 0,
          category: '-',
          quantity: product.quantity,
          subtotal: 0,
        };
      }
    });

    // Renderizar la vista de Handlebars pasando la lista de productos desestructurados
    res.render('cart', {
      title: 'Productos en el carrito',
      products,  // Ahora solo pasas los atributos que necesitas
    });

  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los productos del carrito', error: error.message });
  }
});

// routers de usuarios register, login, profile

// router para registrarse como usuario o github o google o ingresar si ya esta registrado
router.get('/register', (req, res) => {
  const data = {};
  console.log("Entro al views router a renderizar");
  res.status(200).render('register', data);
});


// router para login manual (login), o passport login (pplogin), o jwt login (jwtlogin)
// /views/jwtlogin es el router y login es el hbs.

router.get('/jwtlogin', (req, res) => {
  const data = {
      version: 'v3'
  };

  
  res.status(200).render('login', data);
});



router.get('/profile', auth, (req, res) => {
    
  //const data = req.session.userData;  //jwt y sesion, no muestro profile voy a /products
  // Si uso session los datos del usuario tendrian que estar en user y si uso GH  en userData 
  const data = req.session.passport.user; // Si inicio sesion con GH valido con passport
  console.log(" El usuario en profile: ", data);
  res.status(200).render('profile', data);
});


export default router;