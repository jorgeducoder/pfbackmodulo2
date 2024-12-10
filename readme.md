Cosas que hace este proyecto:

Utiliza nodejs, express y MongoDb Atlas, Mongoose, Multer, Handlebars y Websockets.

Se agregan para modulo II del curso extensiones para manejar sessions passport y JWT.

Para implementar el backend de un ecommerce con carrito y productos.

Se agrega el CRUD y registro de usuarios

Utilza Postman para las pruebas de CRUD en cada coleccion.


En el endpoint /products lista los productos en la base con paginate limit = 6 y page = 1 por defecto

http://localhost:8080/products?limit=10&page=1&sort=asc ordena por precio ascendente

http://localhost:8080/products?category=Pizzas&limit=5&page=2&sort=desc ordena desc y muestra los que tienen category = Pizzas

http://localhost:8080/products?search=Muzza&limit=5&page=1 busca los productos que tienen title Muzza en la pagina 1


En el endpoint /products/realtimeproducts muestra el formulario para dar de alta un producto y la lista actualizada con el producto dado de alta.Tambien en la lista se permite dar de baja un producto.

En el endpoint /products/cart/<cid> muestra los productos de un carrito.

MANEJO DE USUARIOS:

Se agrega el manager de usuarios, los views y los users router correspndientes. 

Se agregan las vistas Handlebars para renderizar el registro, login y perfil de usuarios.

En el endpoint views/register con datos de un nuevo usuario en forma manual, va a api/users/register y da de alta el usuario con
el add del manager.

En el mismo endpoint si se inicia sesion con Github va al endpoint api/users/ghlogin, autentica con passport y da de alta el usuario con el add del manager y los datos de github.

En el endpoint views/jwtlogin si se inicia sesion con email y password manual, y se valida con JWT devuelve el token.

En el endpoint viwes/jwtlogin si se inicia sesion con GiHub, valida con passport y va a views/profile para renderizar el usuario logeado.

NO se utilizan:

Los endpoints api/users/login para datos manuales y session local, y el endpoint api/users/pplogin para datos manuales y passport,
pero cambiando los endpoint en los views.router correspndientes se podrian utilizar. 

Todos los datos se guardan en MongoDb. El usuario se da de alta con un _ID a un carrito vacio que se crea junto con el usuario.

La preentrega se integra con el proyecto final del modulo I.

Errores que no crashean la aplicacion:

