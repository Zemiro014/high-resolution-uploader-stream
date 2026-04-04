const express = require("express");
const storageRoutes = require("./routers/storageRoutes");

const app = express();
app.use(express.json());

// Rotas
app.use("/api/storage", storageRoutes);

module.exports = app;