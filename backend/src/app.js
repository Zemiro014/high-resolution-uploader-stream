const express = require("express");
const storageRoutes = require("./routers/storageRoutes");
const cors = require('cors');

const corsOptions = {
  origin: process.env.NODE_ENV === 'production' ? false : 'http://localhost:5173'
};

const app = express();
app.use(cors(corsOptions));
app.use(express.json());

// Rotas
app.use("/api/storage", storageRoutes);

module.exports = app;