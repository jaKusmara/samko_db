import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import {
  getCategories,
  getProductsByCategory,
  getProductsByBrand,
  getProductsByVehicle,
  getProductsByName,
  getProductsInStore,
  getUserCart,
  addToCart,
  removeFromCart,
  createInvoice,
  updateStockAfterPurchase,
} from "../api/api";
import { useNavigate } from "react-router";

// Debounce hook for text inputs
function useDebouncedValue(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

const Products = () => {
  const [selectedCategory, setSelectedCategory] = useState("Tovar");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedStore, setSelectedStore] = useState("");
  const [sortingOption, setSortingOption] = useState("asc");
  const userId = localStorage.getItem("id_pouzivatela");

  const navigate = useNavigate();

  const debouncedModel = useDebouncedValue(selectedModel, 500);
  const debouncedSearch = useDebouncedValue(searchInput, 500);

  const queryClient = useQueryClient();

  // Mutations
  const addCartMutation = useMutation({
    mutationFn: (productId) => addToCart(userId, productId, 1),
    onSuccess: () => queryClient.invalidateQueries(["cart", userId]),
  });

  const removeCartMutation = useMutation({
    mutationFn: (productId) => removeFromCart(userId, productId),
    onSuccess: () => queryClient.invalidateQueries(["cart", userId]),
  });

  const invoiceMutation = useMutation({
    mutationFn: () => createInvoice(userId),
    onSuccess: () => queryClient.invalidateQueries(["cart", userId]),
  });

  const stockMutation = useMutation({
    mutationFn: (storeId) => updateStockAfterPurchase(userId, storeId),
    onSuccess: () => queryClient.invalidateQueries(["products"]),
  });

  const handleCheckout = async () => {
    try {
      const invoiceRes = await invoiceMutation.mutateAsync();
      if (selectedStore) {
        await stockMutation.mutateAsync(selectedStore);
      }
      alert(
        `Faktúra: suma ${invoiceRes.suma} €, s DPH ${invoiceRes.sumaSDph} €`
      );
    } catch {
      alert("Chyba pri dokončení objednávky.");
    }
  };

  // Queries
  const { data: categories = [], error: categoriesError } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const {
    data: products = [],
    error: productsError,
    isLoading: productsLoading,
  } = useQuery({
    queryKey: [
      "products",
      selectedCategory,
      selectedBrand,
      debouncedModel,
      debouncedSearch,
      selectedStore,
      sortingOption,
    ],
    queryFn: () => {
      if (debouncedSearch)
        return getProductsByName(debouncedSearch, sortingOption);
      if (selectedBrand && debouncedModel)
        return getProductsByVehicle(
          selectedBrand,
          debouncedModel,
          sortingOption
        );
      if (selectedBrand)
        return getProductsByBrand(selectedBrand, sortingOption);
      if (selectedStore)
        return getProductsInStore(selectedStore, sortingOption);
      return getProductsByCategory(selectedCategory, sortingOption);
    },
    keepPreviousData: true,
  });

  // Handlers
  const handleAddToCart = (productId) => {
    addCartMutation.mutate(productId);
  };

  const { data: cartItems = [] } = useQuery({
    queryKey: ["cart", userId],
    queryFn: () => getUserCart(userId),
  });

  const subtotal = cartItems.reduce(
    (sum, item) =>
      sum + parseFloat(item.celkova_cena || item.cena * item.mnozstvo),
    0
  );

  if (productsLoading) return <div>Načítavam produkty...</div>;
  if (productsError || categoriesError) return <div>Chyba pri načítaní!</div>;

  // Odhlásenie funkcia
  const handleLogout = () => {
    localStorage.removeItem("id_pouzivatela");
    alert("Odhlásenie úspešné!");
    navigate("/");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 min-h-screen">
      {/* Filters & Products */}
      <div className="bg-[#191921] text-white p-6 shadow-md lg:col-span-3 flex flex-col">
        <nav className="flex flex-col md:flex-row items-center md:justify-between bg-[#191921] p-4 text-white mb-8">
          {/* Logo */}
          <div className="flex justify-center md:justify-start w-full md:w-auto mb-4 md:mb-0">
            <img src="/icon.png" alt="Logo školy" className="w-16" />
            <img src="/logo_fei.png" alt="Logo školy" className="w-16" />
          </div>

          {/* Tlačidlá */}
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => navigate("/faktury")}
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition"
            >
              Faktúry
            </button>
            <button
              onClick={handleLogout}
              className="w-full sm:w-auto px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md transition"
            >
              Odhlásiť sa
            </button>
          </div>
        </nav>

        {/* Filters */}
        <div className="bg-gray-800 p-4 rounded-md mb-6 space-y-4">
          <h3 className="text-white text-lg font-semibold">Filtrovanie</h3>

          <select
            className="w-full p-2 rounded-md text-black"
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setSelectedBrand("");
              setSelectedModel("");
            }}
          >
            {categories.map((cat) => (
              <option key={cat.id_kategorie} value={cat.nazov}>
                {cat.nazov}
              </option>
            ))}
          </select>

          <select
            className="w-full p-2 rounded-md text-black"
            value={selectedBrand}
            onChange={(e) => {
              setSelectedBrand(e.target.value);
              setSelectedModel("");
            }}
          >
            <option value="">-- Zvoľte značku --</option>
            <option>BMW</option>
            <option>Volkswagen</option>
            <option>KIA</option>
            <option>Mercedes-Benz</option>
            <option>Hyundai</option>
            <option>Audi</option>
            <option>Ford</option>
            <option>Peugeot</option>
            <option>Toyota</option>
            <option>Škoda</option>
          </select>

          <input
            type="text"
            className="w-full p-2 rounded-md text-black"
            placeholder="Zadajte model vozidla"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
          />

          <input
            type="text"
            className="w-full p-2 rounded-md text-black"
            placeholder="Hľadať podľa názvu"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />

          <select
            className="w-full p-2 rounded-md text-black"
            value={selectedStore}
            onChange={(e) => {
              setSelectedStore(e.target.value);
              setSelectedBrand("");
              setSelectedModel("");
              setSearchInput("");
            }}
          >
            <option value="">-- Zvoľte predajňu --</option>
            <option>Predajňa Bratislava</option>
            <option>Predajňa Košice</option>
            <option>Predajňa Trenčín</option>
            <option>Predajňa Žilina</option>
            <option>Predajňa Nitra</option>
          </select>

          <div>
            <label className="block text-white mb-1">
              Triedenie podľa ceny:
            </label>
            <select
              className="w-full p-2 rounded-md text-black"
              value={sortingOption}
              onChange={(e) => setSortingOption(e.target.value)}
            >
              <option value="asc">Vzostupne</option>
              <option value="desc">Zostupne</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.length > 0 ? (
              products.map((item) => (
                <ProductCard
                  key={item.id_tovar}
                  product={item}
                  onAddToCart={handleAddToCart}
                />
              ))
            ) : (
              <div className="text-white">Žiadne produkty nenájdené.</div>
            )}
          </div>
        </main>
      </div>

      {/* Sticky Cart */}
      <aside className="bg-gray-200 p-6 rounded-md shadow-md w-full sticky top-4 self-start h-max">
        <h2 className="text-2xl font-bold mb-6">Nákupný košík</h2>
        <div className="space-y-4 max-h-[70vh] overflow-auto">
          {cartItems.length ? (
            cartItems.map((item) => (
              <div
                key={item.id_tovar}
                className="bg-white p-3 rounded-md shadow-md"
              >
                <h3 className="font-semibold">{item.nazov}</h3>
                <p>Cena za kus: {item.cena} €</p>
                <p>Množstvo: {item.mnozstvo}</p>
                <p>Medzisúčet: {item.celkova_cena} €</p>
                <button
                  className="bg-red-700 text-white px-2 py-1 mt-2 rounded-sm"
                  onClick={() => removeCartMutation.mutate(item.id_tovar)}
                >
                  Odstrániť
                </button>
              </div>
            ))
          ) : (
            <div>Košík je prázdny</div>
          )}
          {cartItems.length > 0 && (
            <>
              <div className="mt-4 p-3 bg-gray-100 rounded font-semibold text-lg">
                Celkový súčet: {subtotal.toFixed(2)} €
              </div>
              <button
                className="mt-2 w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                onClick={handleCheckout}
              >
                Dokončiť objednávku
              </button>
            </>
          )}
        </div>
      </aside>
    </div>
  );
};

export default Products;

function ProductCard({ product, onAddToCart }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-4 flex flex-col justify-between">
      <div>
        <h3 className="text-xl font-semibold text-gray-800">{product.nazov}</h3>
        {product.cena && (
          <p className="text-gray-600 mt-2">
            Cena: <span className="font-bold">{product.cena} €</span>
          </p>
        )}
        {product.pocet && (
          <p className="text-gray-600 mt-2">
            Mnozstvo: <span className="font-bold">{product.pocet} ks</span>
          </p>
        )}
        {product.stav && (
          <p className="text-gray-600 mt-2">
            Stav: <span className="font-bold">{product.stav} </span>
          </p>
        )}
      </div>
      <button
        onClick={() => onAddToCart(product.id_tovar)}
        className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
      >
        Pridať do košíka
      </button>
    </div>
  );
}
