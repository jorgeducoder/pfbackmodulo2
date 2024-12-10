// Aqui tenemos el socket cliente que interactua con el socket servidor. 
// Vamos a interacuar con socket.on y socket.emit para enviar a  y recibir del servidor

const socket = io();

console.log("Defini socket = io()");

socket.emit("message", "Hola me estoy comunicando desde un websocket!");

const form = document.getElementById("formulario");
const tableBody = document.getElementById("table-body");

function getProducts() {
  console.log("voy a emitir", products)

  socket.emit("getProducts", (products) => {
    emptyTable();
    showProducts(products);
  });
}

function emptyTable() {
  tableBody.innerHTML = "";
}

function showProducts(products) {
  products.forEach((product) => {
    const row = createTableRow(product);
    tableBody.appendChild(row);
  });
}

socket.on("products", (data) => {
  console.log("Lista de productos recibida del servidor:", data);
  emptyTable();
  showProducts(data);
});



function createTableRow(product) {
  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${product._id}</td>
    <td class="text-nowrap">${product.title}</td>
    <td>${product.description}</td>
    <td class="text-nowrap">$ ${product.price}</td>
    <td>${product.category}</td>
    <td>${product.stock}</td>
    <td>${product.status}</td>
    <td>${product.code}</td>
    <td><a href="${product.thumbnails}" target="_blank">Ver imagen</a></td>  
    <td><button class="btn btn-effect btn-dark btn-jif bg-black" onClick="deleteProduct('${product._id}')">Eliminar</button></td>
  `;
  return row;
}

// de gpt <a href="/images/${product.imageFilename}" target="_blank">Ver imagen</a></td>  Enlazar a la imagen en el servidor -->*/

function deleteProduct(productId) {
  //const id = parseInt(productId);
  console.log("ID del producto a eliminar en deletePoduct:", productId);
  emptyTable();

  // hace el emit para el socket.on en sockets.js

  socket.emit("delete", productId);
}



// Agregar un event listener para el evento "addProductSuccess" emitido desde el servidor
socket.on("addProductSuccess", () => {
  // Restablecer el formulario después de que se confirme que el producto se ha agregado correctamente
  form.reset();
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const fileInput = document.getElementById("thumbnails");
  const imageFile = fileInput.files[0];

  const reader = new FileReader();
  reader.onload = function (event) {
    const imageData = event.target.result;
    const productData = {
      title: document.getElementById("title").value,
      portions: parseInt(document.getElementById("porciones").value),
      description: document.getElementById("description").value,
      stock: parseInt(document.getElementById("stock").value),
      price: parseInt(document.getElementById("price").value),
      category: document.getElementById("category").value,
      code: document.getElementById("code").value,
      status: true,
      imageData: imageData  // Agregar la imagen como parte de los datos del producto
    };
    console.log("antes de enviar emit:", productData);
    socket.emit("add", productData);
    

  };
  reader.readAsDataURL(imageFile);

});


// HAcia abajo ya estaba
function previewImage() {
  const fileInput = document.getElementById("thumbnails");
  const imagePreview = document.getElementById("imagePreview");
  const cancelButtonContainer = document.getElementById(
    "cancelButtonContainer"
  );

  if (fileInput.files && fileInput.files[0]) {
    const reader = new FileReader();

    reader.onload = function (event) {
      const image = document.createElement("img");
      image.src = event.target.result;
      image.style.maxWidth = "200px";
      image.style.maxHeight = "200px";

      imagePreview.innerHTML = "";
      imagePreview.appendChild(image);
      cancelButtonContainer.innerHTML = `<button class="btn btn-danger" style="padding: 0.2rem 0.4rem;border-radius: 50%;margin: 0.4rem;font-size: 1.5em;" onclick="cancelImageSelection()"><i class="fa fa-close" id="btnCerrar" aria-hidden="true"></i></button>`;
    };
    reader.readAsDataURL(fileInput.files[0]);
    showCancelButton();
  } else {
    imagePreview.innerHTML = "";
    cancelButtonContainer.innerHTML = "";
    hideCancelButton();
  }
}
function cancelImageSelection() {
  const fileInput = document.getElementById("thumbnails");
  fileInput.value = "";
  const imagePreview = document.getElementById("imagePreview");
  imagePreview.innerHTML = "";
  cancelButtonContainer.innerHTML = "";
}

function hideCancelButton() {
  const cancelButtonContainer = document.getElementById(
    "cancelButtonContainer"
  );
  cancelButtonContainer.style.display = "none";
}

function showCancelButton() {
  const cancelButtonContainer = document.getElementById(
    "cancelButtonContainer"
  );
  cancelButtonContainer.style.display = "block";
}


