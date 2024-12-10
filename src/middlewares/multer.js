import multer from "multer";

// Configuración de multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "/public/img"); // Ruta donde se guardarán los archivos. Asi esta en diapos cb(null, __dirname+"/public/img")
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

export const uploader = multer({ storage });
