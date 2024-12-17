import express from "express";
import { verifyToken } from "./middlewares/verifyToken.js"; // Middleware que valida el token
import productModel from "./models/product.js"; // Modelo de productos

const router = express.Router();

router.get("/", verifyToken, async (req, res) => {
  const { limit, page, sort, search, category } = req.query;

  console.log("En views.router session antes render: ", req.session?.cookie?.expires);

  let query = {};

  if (search) {
    query.title = { $regex: search, $options: "i" };
  }

  if (category) {
    query.category = category;
  }

  try {
    const options = {
      limit: parseInt(limit) || 6,
      page: parseInt(page) || 1,
      sort: {},
    };

    if (sort) {
      options.sort.price = sort === "asc" ? 1 : -1;
    }

    // Validar inicio de sesión con GitHub o JWT
    const isGitHubLogin = req.session?.passport?.user?.role === "USER";
    const isJWTLogin = req.user?.role === "USER"; // req.user proviene del middleware verifyToken

    if (isGitHubLogin || isJWTLogin) {
      const productList = await productModel.paginate(query, options);

      res.render("home", {
        title: "Productos desde HTML",
        style: "productList.css",
        productList: productList.docs,
        totalPages: productList.totalPages,
        currentPage: productList.page,
        hasNextPage: productList.hasNextPage,
        hasPrevPage: productList.hasPrevPage,
        nextPage: productList.nextPage,
        prevPage: productList.prevPage,
      });
    } else {
      res.status(401).send({ error: "Usuario no autenticado o no tiene el rol adecuado", data: [] });
    }
  } catch (error) {
    console.error("Error en views.router:", error);
    res.status(500).send({ error: "Error al obtener productos" });
  }
});

export default router;
