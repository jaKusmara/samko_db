import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { login, register } from "../api/api";
import { useNavigate } from "react-router";

export default function Index() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // Prihlásenie mutácia
  const loginMutation = useMutation({
    mutationFn: ({ name, password }) => login(name, password),
    onSuccess: (data) => {
      console.log("Prihlásený používateľ:", data);
      // Uloženie ID používateľa do localStorage
      if (data.id_pouzivatel) {
        localStorage.setItem("id_pouzivatela", data.id_pouzivatel);
      }
      alert("Prihlásenie úspešné!");
      navigate("/ponuka");
    },
    onError: (err) => {
      console.error(err);
      setError(err.response?.data?.error || "Chyba pri prihlasovaní");
    },
  });

  // Registrácia mutácia
  const registerMutation = useMutation({
    mutationFn: ({ name, password, confirmPassword }) =>
      register(name, password, confirmPassword),
    onSuccess: (data) => {
      console.log("Registrovaný používateľ:", data);
      alert("Registrácia úspešná!");
      setIsLogin(true);
      setPassword("");
      setConfirmPassword("");
    },
    onError: (err) => {
      console.error(err);
      setError(err.response?.data?.error || "Chyba pri registrácii");
    },
  });

  const handleLogin = (e) => {
    e.preventDefault();
    setError(null);
    loginMutation.mutate({ name, password });
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Heslá sa nezhodujú");
      return;
    }
    registerMutation.mutate({ name, password, confirmPassword });
  };

  return (
    <div className="min-h-screen bg-[#191921] flex items-center justify-center p-4">
      <div className="w-full max-w-sm sm:max-w-md p-6 bg-white rounded-lg shadow-lg">
        <div className="flex justify-center  w-full md:w-auto mb-4 md:mb-0">
          <img src="/icon.png" alt="Logo školy" className="w-16" />
          <img src="/logo_fei.png" alt="Logo školy" className="w-16" />
        </div>
        <h1 className="text-2xl font-bold text-center mb-6">
          Prihlásenie / Registrácia
        </h1>

        {/* Prepínač medzi loginom a registráciou */}
        <div className="flex justify-center mb-4 space-x-2 sm:flex-row flex-col">
          <button
            onClick={() => setIsLogin(true)}
            className={`px-4 py-2 w-full sm:w-1/2 rounded-tl-lg rounded-tr-lg ${
              isLogin ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
            } mb-2 sm:mb-0`}
          >
            Prihlásiť sa
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`px-4 py-2 w-full sm:w-1/2 rounded-tl-lg rounded-tr-lg ${
              !isLogin ? "bg-green-500 text-white" : "bg-gray-200 text-gray-700"
            }`}
          >
            Registrovať sa
          </button>
        </div>

        {/* Chyba */}
        {error && <div className="text-red-500 text-center mb-4">{error}</div>}

        {/* Formulár */}
        {isLogin ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <fieldset className="border p-4 rounded-md">
              <div>
                <label
                  htmlFor="loginName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Meno:
                </label>
                <input
                  type="text"
                  id="loginName"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="loginPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Heslo:
                </label>
                <input
                  type="password"
                  id="loginPassword"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loginMutation.isLoading}
                className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 mt-4 disabled:opacity-50"
              >
                {loginMutation.isLoading ? "Načítavam..." : "Prihlásiť sa"}
              </button>
            </fieldset>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <fieldset className="border p-4 rounded-md">
              <div>
                <label
                  htmlFor="registerName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Meno:
                </label>
                <input
                  type="text"
                  id="registerName"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="registerPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Nové heslo:
                </label>
                <input
                  type="password"
                  id="registerPassword"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="registerConfirmPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Zopakuj heslo:
                </label>
                <input
                  type="password"
                  id="registerConfirmPassword"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={registerMutation.isLoading}
                className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 mt-4 disabled:opacity-50"
              >
                {registerMutation.isLoading ? "Načítavam..." : "Registrovať sa"}
              </button>
            </fieldset>
          </form>
        )}
      </div>
    </div>
  );
}
