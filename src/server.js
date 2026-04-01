require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

/* Connect database first */
connectDB();

/* Start server */
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});