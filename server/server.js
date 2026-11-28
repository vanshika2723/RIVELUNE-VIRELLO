const express = require("express");
const cors = require("cors");
require("dotenv").config();
const db = require("./config/db");
const orderRoutes = require("./routes/orderRoutes");
const adminAuthRoutes = require("./routes/adminAuthRoutes");
const adminRoutes = require("./routes/adminRoutes");
const productRoutes = require("./routes/productRoutes");
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/orders", orderRoutes);
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/admin", adminRoutes);

app.use("/api/products", productRoutes);
app.get("/", (req, res) => {
  res.json({
    message: "RIVELUNE API is running successfully!",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    status: "Server is healthy",
  });
});

const PORT = process.env.PORT || 5000;
// Database connection test
app.get("/api/db-test", (req, res) => {
  db.query("SELECT 1 AS test", (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Database query failed",
        error: err.message,
      });
    }

    res.json({
      success: true,
      message: "RIVELUNE database query successful!",
      result: results[0],
    });
  });
});
app.listen(PORT, () => {
  console.log(`RIVELUNE server running on port ${PORT}`);
});