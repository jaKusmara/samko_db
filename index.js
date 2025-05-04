const express = require("express");
const cors = require("cors");
const path = require("path");
const productController = require("./controllers/productController");
const app = express();
const port = 3000;

// MIDDLEWARE
app.use(cors());
app.use(express.json());

// ROUTES
app.get(
  "/products/category/:categoryName",
  productController.getProductsByCategory
);
app.get(
  "/products/vehicle/:brand/:model",
  productController.getProductsByVehicle
);
app.get("/products/brand/:brand", productController.getProductsByBrand);
app.get(
  "/products/categoryId/:categoryId",
  productController.getProductsByCategoryId
);
app.get("/products/name/:productName", productController.getProductsByName);
app.get("/products/store/:storeName", productController.getProductsInStore);

// Login
app.post("/user/login", productController.login);
app.post("/user/register", productController.register);

// Categories
app.get("/categories", productController.getCategories);

// Cart
app.post("/cart/add", productController.addToCart);
app.get("/cart/user/:userId", productController.getUserCart);
app.delete("/cart/user/:userId/:productId", productController.removeFromCart);

// Invoices
app.post("/invoice/user/:userId", productController.createInvoice);
app.get("/invoices/user/:userId", productController.getUserInvoices);

// Stock update after purchase
app.put("/stock/user/:userId", productController.updateStockAfterPurchase);

// 1. Zobraziť všetky DPF filtre pre vybrané vozidlo
app.get("/products/dpf/:vehicleId", productController.getDpfFilters);

// Predajne s < 10 kusmi oleja 10W-40
app.get("/stores/low-oil-10w40", productController.getStoresLowOil);

// Zoznam kategórií a ich priemerná cena pre tovar na sklade
app.get("/categories/average-price", productController.getCategoriesAvgPrice);

// FRONTEND SERVING
const clientPath = path.join(__dirname, "client", "dist");
app.use(express.static(clientPath));
app.get("*", (req, res) => {
  res.sendFile(path.join(clientPath, "index.html"));
});

// START SERVER
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
