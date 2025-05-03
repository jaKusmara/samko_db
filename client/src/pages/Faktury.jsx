import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getUserInvoices } from "../api/api";
import { useNavigate } from "react-router-dom";

export default function Faktury() {
  // Získanie id z localStorage
  const userId = localStorage.getItem("id_pouzivatela");
  const navigate = useNavigate();

  console.log(userId)

  // Načítanie faktúr cez react-query
  const {
    data: invoices = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["invoices", userId],
    queryFn: () => getUserInvoices(userId),
    enabled: !!userId,
  });

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#191921] text-white">
        <p>Nie ste prihlásený. Prosím, prihláste sa.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#191921] text-white">
        <p>Načítavam faktúry...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#191921] text-white">
        <p>Chyba pri načítaní faktúr.</p>
      </div>
    );
  }

  console.log(invoices)

  return (
    <div className="bg-[#191921] min-h-screen p-4 flex flex-col">
      {/* Navigačný panel */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-white">Moje faktúry</h1>
        <button
          onClick={() => navigate("/ponuka")}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition"
        >
          Späť na ponuku
        </button>
      </div>
      {/* Obsah */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
        {invoices.length > 0 ? (
          invoices.map((invoice) => (
            <InvoiceCard key={invoice.id_faktura} invoice={invoice} />
          ))
        ) : (
          <p className="text-white col-span-full text-center">
            Nemáte žiadne faktúry.
          </p>
        )}
      </div>
    </div>
  );
}

function InvoiceCard({ invoice }) {
  const { id_faktura, datum_vystavenia, suma, suma_s_dph, stav, komentar } =
    invoice;

  // Prevod súm na čísla, ak sú reťazce alebo iný typ
  const sumValue = Number(suma) || 0;
  const sumWithTaxValue = Number(suma_s_dph) || 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 flex flex-col justify-between">
      <div>
        <h2 className="text-xl font-semibold mb-2">Faktúra #{id_faktura}</h2>
        <p className="text-gray-600 text-sm mb-1">
          Dátum: <span className="font-medium">{new Date(datum_vystavenia).toLocaleDateString()}</span>
        </p>
        <p className="text-gray-600 text-sm mb-1">
          Suma: <span className="font-medium">{sumValue.toFixed(2)} €</span>
        </p>
        <p className="text-gray-600 text-sm mb-1">
          S DPH: <span className="font-medium">{sumWithTaxValue.toFixed(2)} €</span>
        </p>
        {stav && (
          <p className="text-gray-600 text-sm mb-1">
            Stav: <span className="font-medium capitalize">{stav}</span>
          </p>
        )}
      </div>
      {komentar && (
        <p className="text-gray-500 text-xs italic mt-2">{komentar}</p>
      )}
    </div>
  );
}
