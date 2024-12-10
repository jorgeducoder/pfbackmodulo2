import { Router } from "express";
//import { ProductManager } from "../dao/productManager.js";

import { auth } from './users.router.js';

import { ProductManagerMdb } from "../dao/productManagerMdb.js";
import { cartManagerMdb } from "../dao/cartManagerMdb.js";

import productModel from '../dao/models/productModel.js';


const router = Router();
//const products = new ProductManager("./src/saborescaseros.json");
const products = new ProductManagerMdb();
const CM = new cartManagerMdb()


router.get("/", async (req, res) => {
  const { limit, page, sort, search, category } = req.query;

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

    // Ejecutar la consulta de paginación
    const productList = await productModel.paginate(query, options);
    
    // Renderizar la vista Handlebars con los datos paginados
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

  } catch (error) {
    res.status(500).send({ error: 'Error al obtener productos' });
  }
});


// renderizo form y lista de productos actualizada desde socket


router.get("/realtimeproducts", async (req, res) => {    // en endpoint products/realtimeproducts muestra form para agregar y lista actualizada
  try {
    const productList = await products.getProduct();
    // renderizo la handlebars definida
    res.render("realTimeProducts",
      {
        title: "Real Time Products",
        style: "realtimeproducts.css",
        productList
      }
    );
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Ruta para obtener los productos de un carrito

router.get("/cart/:cartId", async (req, res) => {
  const { cartId } = req.params;

  try {
    // Buscar el carrito por su ID
    const cart = await CM.getcartProducts(cartId);

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
    
  //const data = req.session.userData;  jwt y sesion, con jwt no se muestra profile, se muestra token
  // Si uso session los datos del usuario tendrian que estar en user y no en userData para usar dos cons data = .....
  const data = req.session.passport.user;
  console.log(" El usuario en profile: ", data);
  res.status(200).render('profile', data);
});


export default router;