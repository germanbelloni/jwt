const express = require("express");
process.loadEnvFile();
const app = express();
const jwt = require("jsonwebtoken");
const port = process.env.PORT || 3000;
const secretKey = process.env.SECRET_KEY;
const usuarios = require("./datos/usuarios.js");
const productos = require("./datos/productos.js");

//Middleware
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
  console.log(usuarios);
});

//Login del usuario donde se genera el JWT
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  console.log(`Datos recibidos: usuario: ${username}, password: ${password}`);
  //Autenticacion del usuario
  const user = usuarios.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) {
    return res.status(401).send({ error: "Credenciales invalidas" });
  } else {
    const token = jwt.sign({ username }, secretKey, { expiresIn: "1h" });
    return res.json({ token });
  }
});

//Midlleware para verificar el token JWT
const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).json({ error: "No token provided" });

  //Verificacion del token
  jwt.verify(token, secretKey, (err, decoded) => {
    err
      ? res.status(401).json({ error: "Invalid token" })
      : (req.decoded = decoded);
    next();
  });
};

//Ruta protegida por token
app.get("/productos", verifyToken, (req, res) => {
  res.json(productos);
});

app.get("/protected", verifyToken, (req, res) => {
  res.json({ message: `Hola ${req.decoded.username}` });
});

app.listen(port, () => {
  console.log(`Corriendo en puerto http://localhost:${port}`);
});
