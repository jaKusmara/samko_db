// pages/DashboardPage.jsx
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getDpfFilters,
  getStoresLowOil10w40,
  getCategoriesAvgPrice,
} from "../api/api";
import { useNavigate } from "react-router-dom";

export default function DashboardPage() {
  const [vehicleIdInput, setVehicleIdInput] = useState("2");
  const vehicleId = parseInt(vehicleIdInput, 10);
  const navigate = useNavigate();

  const {
    data: dpfData,
    isLoading: loadingDpf,
    error: errorDpf,
  } = useQuery({
    queryKey: ["dpfFilters", vehicleId],
    queryFn: () => getDpfFilters(vehicleId),
    enabled: Number.isInteger(vehicleId) && vehicleId > 0,
    staleTime: 5 * 60_000,
  });

  const {
    data: oilData,
    isLoading: loadingOil,
    error: errorOil,
  } = useQuery({
    queryKey: ["storesLowOil10w40"],
    queryFn: getStoresLowOil10w40,
    staleTime: 2 * 60_000,
  });

  const {
    data: catData,
    isLoading: loadingCat,
    error: errorCat,
  } = useQuery({
    queryKey: ["categoriesAvgPrice"],
    queryFn: getCategoriesAvgPrice,
    staleTime: 10 * 60_000,
  });

  if (loadingDpf || loadingOil || loadingCat) return <p>Načítavam údaje…</p>;
  if (errorDpf || errorOil || errorCat)
    return <p>Nastala chyba pri načítaní.</p>;

  return (
    <div className="min-h-screen p-6 bg-[#191921] text-white">
      <nav className="mb-6">
        <button
          onClick={() => navigate("/ponuka")}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition"
        >
          Vrátiť sa späť
        </button>
      </nav>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {/* DPF Filters Card */}
        <div className="bg-gray-800 rounded-xl shadow p-6 flex flex-col">
          <h2 className="text-2xl font-semibold mb-4">
            DPF filtre pre vozidlo #
            <input
              type="number"
              value={vehicleIdInput}
              onChange={(e) => setVehicleIdInput(e.target.value)}
              className="ml-2 w-16 bg-gray-700 text-white border border-gray-600 rounded px-2 py-1"
            />
          </h2>
          <div className="flex-1 overflow-y-auto">
            {dpfData && dpfData.length ? (
              dpfData.map(({ dpf_filter, predajna, pocet_kusov }) => (
                <div
                  key={`${dpf_filter}-${predajna}`}
                  className="border-b border-gray-700 last:border-b-0 py-2"
                >
                  <p className="font-medium">{dpf_filter}</p>
                  <p className="text-sm text-gray-300">
                    {predajna}: <span className="font-semibold">{pocet_kusov} ks</span>
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-400">Žiadne dáta.</p>
            )}
          </div>
        </div>

        {/* Low-Oil Stores Card */}
        <div className="bg-gray-800 rounded-xl shadow p-6 flex flex-col">
          <h2 className="text-2xl font-semibold mb-4">Predajne s &lt;10 ks oleja 10W-40</h2>
          <div className="flex-1 overflow-y-auto">
            {oilData && oilData.length ? (
              oilData.map(({ predajna, tovar, pocet }) => (
                <div key={`${predajna}-${tovar}`} className="border-b border-gray-700 last:border-b-0 py-2">
                  <p className="font-medium">{predajna}</p>
                  <p className="text-sm text-gray-300">
                    {tovar}: <span className="font-semibold">{pocet} ks</span>
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-400">Žiadne dáta.</p>
            )}
          </div>
        </div>

        {/* Categories Avg Price Card */}
        <div className="bg-gray-800 rounded-xl shadow p-6 flex flex-col">
          <h2 className="text-2xl font-semibold mb-4">Priemerná cena podľa kategórie (skladom)</h2>
          <div className="flex-1 overflow-y-auto">
            {catData && catData.length ? (
              catData.map(({ kategoria, priemerna_cena }) => (
                <div key={kategoria} className="border-b border-gray-700 last:border-b-0 py-2">
                  <p className="font-medium">{kategoria}</p>
                  <p className="text-sm text-gray-300">
                    <span className="font-semibold">{priemerna_cena} €</span>
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-400">Žiadne dáta.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
