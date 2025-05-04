import axios from "axios";

const API_URL = "/api"; // Vite proxy prefix

//
// 1. Vyhľadávanie tovaru podľa kategórie s triedením
export const getProductsByCategory = async (categoryName, sort = "asc") => {
  const response = await axios.get(
    `${API_URL}/products/category/${encodeURIComponent(
      categoryName
    )}?sort=${sort}`
  );
  return response.data;
};

//
// 2. Vyhľadávanie tovaru podľa kategórie ID s triedením
export const getProductsByCategoryId = async (categoryId, sort = "asc") => {
  const response = await axios.get(
    `${API_URL}/products/categoryId/${encodeURIComponent(
      categoryId
    )}?sort=${sort}`
  );
  return response.data;
};

//
// 3. Vyhľadávanie tovaru podľa vozidla a modelu s triedením
export const getProductsByVehicle = async (brand, model, sort = "asc") => {
  const response = await axios.get(
    `${API_URL}/products/vehicle/${encodeURIComponent(
      brand
    )}/${encodeURIComponent(model)}?sort=${sort}`
  );
  return response.data;
};

//
// 4. Vyhľadávanie tovaru podľa značky vozidla s triedením
export const getProductsByBrand = async (brand, sort = "asc") => {
  const response = await axios.get(
    `${API_URL}/products/brand/${encodeURIComponent(brand)}?sort=${sort}`
  );
  return response.data;
};

//
// 5. Vyhľadávanie tovaru podľa mena s triedením
export const getProductsByName = async (productName, sort = "asc") => {
  const response = await axios.get(
    `${API_URL}/products/name/${encodeURIComponent(productName)}?sort=${sort}`
  );
  return response.data;
};

//
// 6. Vyhľadávanie tovaru podľa predajne s triedením
export const getProductsInStore = async (storeName, sort = "asc") => {
  const response = await axios.get(
    `${API_URL}/products/store/${encodeURIComponent(storeName)}?sort=${sort}`
  );
  return response.data;
};

//
// 7. Výpis kategórií
export const getCategories = async () => {
  const response = await axios.get(`${API_URL}/categories`);
  return response.data;
};

//
// 8. Pridanie do košíka
export const addToCart = async (userId, productId, quantity) => {
  const response = await axios.post(`${API_URL}/cart/add`, {
    userId,
    productId,
    quantity,
  });
  return response.data;
};

//
// 9. Výpis košíka používateľa
export const getUserCart = async (userId) => {
  const response = await axios.get(`${API_URL}/cart/user/${userId}`);
  return response.data;
};

//
// 10. Odstránenie položky z košíka
export const removeFromCart = async (userId, productId) => {
  const response = await axios.delete(
    `${API_URL}/cart/user/${userId}/${productId}`
  );
  return response.data;
};

//
// 11. Vytvorenie faktúry
export const createInvoice = async (userId) => {
  const response = await axios.post(`${API_URL}/invoice/user/${userId}`);
  return response.data;
};

// 12. Výpis faktúr používateľa
export const getUserInvoices = async (userId) => {
  const response = await axios.get(`${API_URL}/invoices/user/${userId}`);
  return response.data;
};

//
// 13. Aktualizácia skladu po nákupe
export const updateStockAfterPurchase = async (userId, storeId) => {
  const response = await axios.put(`${API_URL}/stock/user/${userId}`, {
    storeId,
  });
  return response.data;
};

//
// 14. Login
export const login = async (name, password) => {
  const response = await axios.post(`${API_URL}/user/login`, {
    name,
    password,
  });

  return response.data;
};

//
// 15. Register
export const register = async (name, password, password2) => {
  const response = await axios.post(`${API_URL}/user/register`, {
    name,
    password,
    password2,
  });

  return response.data;
};

// 16. Zobraziť všetky DPF filtre pre vybrané vozidlo
export const getDpfFilters = async (vehicleId) => {
  const url = `${API_URL}/products/dpf/${encodeURIComponent(vehicleId)}`;
  const { data } = await axios.get(url);
  return data;
};

//
// 17. Predajne, kde je menej ako 10 kusov oleja 10W-40
export const getStoresLowOil10w40 = async () => {
  const response = await axios.get(`${API_URL}/stores/low-oil-10w40`);
  return response.data;
};

//
// 18. Zoznam kategórií a ich priemerná cena pre tovar na sklade
export const getCategoriesAvgPrice = async () => {
  const response = await axios.get(`${API_URL}/categories/average-price`);
  return response.data;
};
