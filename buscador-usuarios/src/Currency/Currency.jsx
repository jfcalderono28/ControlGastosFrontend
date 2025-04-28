import { useState } from "react";
import { useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../CSS/Currency.css";

export default function Currency() {
  const defaultCurrency = {
    name_currency: "",
  };

  const [currencies, setCurrencies] = useState([]);
  const [query, setQuery] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [newCurrency, setNewCurrency] = useState(defaultCurrency);
  const [selectedCurrency, setSelectedCurrency] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (query.length === 0) {
    }
    fetchCurrencies(); // Se llama solo una vez al montar
  }, []);
  useEffect(() => {
    if (query.length > 0) {
      fetchCurrencies();
    }
  }, [query]);

  const refreshToken = async () => {
    try {
      const refresh = localStorage.getItem("refresh");
      const response = await axios.post(
        "http://localhost:8000/api/token/refresh/",
        { refresh }
      );
      localStorage.setItem("access", response.data.access);
      return response.data.access;
    } catch (error) {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      toast.error("Sesión expirada. Por favor inicia sesión nuevamente.");
      return null;
    }
  };

  const fetchCurrencies = async () => {
    setIsLoading(true);
    try {
      let accessToken = localStorage.getItem("access");
      if (!accessToken) {
        toast.error("No hay token. Inicia sesión nuevamente.");
        setIsLoading(false);
        return;
      }

      const config = {
        params: { query },
        headers: { Authorization: `Bearer ${accessToken}` },
      };

      try {
        const response = await axios.get(
          "http://localhost:8000/api/currency/search/",
          config
        );
        setCurrencies(response.data);
        setIsSearching(true);
        setIsCreating(false);
        setSelectedCurrency(null);
      } catch (error) {
        if (error.response?.status === 401) {
          const newAccessToken = await refreshToken();
          if (newAccessToken) {
            config.headers.Authorization = `Bearer ${newAccessToken}`;
            const retryResponse = await axios.get(
              "http://localhost:8000/api/currency/search/",
              config
            );
            setCurrencies(retryResponse.data);
            setIsSearching(true);
            setIsCreating(false);
            setSelectedCurrency(null);
          }
        } else {
          throw error;
        }
      }
    } catch (err) {
      toast.error("Error al obtener monedas");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCurrency = (currency) => {
    setSelectedCurrency(currency);
    setNewCurrency({
      name_currency: currency.name_currency,
    });
    setIsCreating(true);
  };

  const handleSaveCurrency = async () => {
    const { name_currency } = newCurrency;
    if (!name_currency) {
      toast.warning("Todos los campos son obligatorios.");
      return;
    }

    setIsLoading(true);
    try {
      let accessToken = localStorage.getItem("access");
      if (!accessToken) {
        toast.error("No hay token. Inicia sesión nuevamente.");
        setIsLoading(false);
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      };

      const endpoint = selectedCurrency
        ? `http://localhost:8000/api/currency/update/${selectedCurrency.id}/`
        : "http://localhost:8000/api/currency/register/";

      const method = selectedCurrency ? axios.put : axios.post;

      await method(endpoint, newCurrency, config);
      toast.success(
        selectedCurrency ? "Moneda actualizada." : "Moneda creada exitosamente."
      );
      setNewCurrency(defaultCurrency);
      setSelectedCurrency(null);
      setIsCreating(false);
      setIsSearching(false);
    } catch (error) {
      toast.error("Error al guardar la moneda");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="usuarios-container">
      <div className="usuarios-actions">
        <input
          type="text"
          placeholder="Buscar monedas..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchCurrencies()}
        />
        <div className="action-buttons">
          <button onClick={fetchCurrencies} disabled={isLoading}>
            {isLoading ? "CARGANDO..." : "BUSCAR"}
          </button>
          <button
            onClick={() => {
              setIsCreating(true);
              setIsSearching(false);
              setSelectedCurrency(null);
              setNewCurrency(defaultCurrency);
            }}
            disabled={isLoading}
          >
            CREAR
          </button>
        </div>
      </div>

      {isCreating && (
        <div className="create-form">
          <h3>{selectedCurrency ? "Editar Moneda" : "Nueva Moneda"}</h3>
          <input
            placeholder="Nombre *"
            value={newCurrency.name_currency}
            onChange={(e) =>
              setNewCurrency({ ...newCurrency, name_currency: e.target.value })
            }
          />

          <div className="form-buttons">
            <button onClick={handleSaveCurrency} disabled={isLoading}>
              {isLoading
                ? "GUARDANDO..."
                : selectedCurrency
                ? "ACTUALIZAR"
                : "GUARDAR"}
            </button>
            <button
              onClick={() => {
                setIsCreating(false);
                setSelectedCurrency(null);
              }}
              disabled={isLoading}
            >
              CANCELAR
            </button>
          </div>
        </div>
      )}

      {isSearching && (
        <table className="usuarios-table">
          <thead>
            <tr>
              <th>NOMBRE</th>
            </tr>
          </thead>
          <tbody>
            {currencies.map((currency) => (
              <tr
                key={currency.id}
                onClick={() => handleEditCurrency(currency)}
              >
                <td>{currency.name_currency}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
