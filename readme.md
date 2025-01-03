Cosas que hace este proyecto:

Utiliza nodejs, express y MongoDb Atlas, Mongoose, Multer, Handlebars y Websockets.

Se agregan para modulo II del curso extensiones para manejar sessions passport y JWT.

Para implementar el backend de un ecommerce con carrito y productos.

Se agrega el CRUD y registro de usuarios

Utilza Postman para las pruebas de CRUD en cada coleccion.


En el endpoint http://localhost:8080/products lista los productos en la base con paginate limit = 6 y page = 1 por defecto

http://localhost:8080/products?limit=10&page=1&sort=asc ordena por precio ascendente

http://localhost:8080/products?category=Pizzas&limit=5&page=2&sort=desc ordena desc y muestra los que tienen category = Pizzas

http://localhost:8080/products?search=Muzza&limit=5&page=1 busca los productos que tienen title Muzza en la pagina 1


En el endpoint http://localhost:8080/products/realtimeproducts muestra el formulario para dar de alta un producto y la lista actualizada con el producto dado de alta.Tambien en la lista se permite dar de baja un producto.

En el endpoint http://localhost:8080/products/cart/66f3650633e31703b2f07743 muestra los productos de un carrito.

http://localhost:8080/products/cart/6765a74b2a3e6484a22fd092 este es otro carrito con productos.

MANEJO DE USUARIOS:

Se agrega el manager de usuarios, los views y los users router correspndientes. 

Se agregan las vistas Handlebars para renderizar el registro, login y perfil de usuarios.

En el endpoint http://localhost:8080/views/register con datos de un nuevo usuario en forma manual, va a http://localhost:8080/api/users/register y da de alta el usuario con
el add del manager.

En el mismo endpoint si se inicia sesion con Github va al endpoint api/users/ghlogin, autentica con passport y da de alta el usuario con el add del manager y los datos de github.

En el endpoint http://localhost:8080/views/jwtlogin si se inicia sesion con email y password manual, y se valida con JWT devuelve el token.

En el endpoint http://localhost:8080/views/jwtlogin si se inicia sesion con GiHub, valida con passport y va a http://localhost:8080/views/profile para renderizar el usuario logeado.

NO se utilizan:

Los endpoints api/users/login para datos manuales y session local, y el endpoint api/users/pplogin para datos manuales y passport,
pero cambiando los endpoint en los views.router correspndientes se podrian utilizar. 

Todos los datos se guardan en MongoDb. El usuario se da de alta con un _ID a un carrito vacio que se crea junto con el usuario.

La preentrega se integra con el proyecto final del modulo I.

PROYECTO FINAL:

Se incluye el modelo MVC (Models, Views, Controllers aislando la capa de acceso a datos de los manager para trabajar con cualquier base de datos).
Los manager se pasan a llamar user.service.mongo y los Controllers user.controller.js que llaman a las funciones para el CRUD.

Si el usuario se registra manual (estrategia con passport passport.config.js) o con github (estrategia con JWT) es un USER y se redirige a /products para ingresar productos al carrito vacio.

Se incluye DTO y envio de mail al registrarse un usuario con nodemailer en ambas estrategias de autenticacion. 

En ambas estrategias cuando el usuario hace login, si el usuario es USER se redirige al endpoint /products.

Si el usuario es ADMIN se redirige al endpoint /products/realtimeproducts


MANEJO DE TICKETS:

En el endpoint http://localhost:8080/api/carts/66f3650633e31703b2f07743/purchase  verifica el stock de los productos de un carrito y para el que tiene stock genera un ticket, para el resto genera un json y los deja en el carrito. 



Errores que no crashean la aplicacion:
--------------------------------------

Cuando se registra un usuario o cuando hace login, se corta la conexion al servidor al ir al endpoint, pero si se reintenta ingresa al endpoint. Esto sucede con cualquier tipo de registro y login.

Se comenta mongo.singleton porque no lista productos en  /productos y /realtimeproducts, probablemente con problemas en el paginate.

Se deja conexion a mongodb en app.js porque si se elimina da problemas al cargar los datos en /products.

A mejorar:
--------------------------------------

Mover la autorizacion y autenticacion al mismo midd 