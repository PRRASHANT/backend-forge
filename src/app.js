const express = require("express");
const cors = require("cors");

const app = express();

/* Middlewares */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* Health check route */
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "OK",
        message: "API running"
    });
});

module.exports = app;