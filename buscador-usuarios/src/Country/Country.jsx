import React, { useState, useEffect } from "react";
import axios from "axios";
import "../CSS/Country.css";

export default function Country() {
  const [countries, setCountries] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const defaultCountry = {
    name_country: "", // Asegúrate de que sea una cadena vacía
    currencies_ids: [], // Asegúrate de que sea un array vacío
  };
  const [newCountry, setNewCountry] = useState(defaultCountry);
  const [selectedCountry, setSelectedCountry] = useState(null);

  useEffect(() => {
    if (query.length === 0) {
    }
    fetchCountries(); // Se llama solo una vez al montar
  }, []);
  useEffect(() => {
    if (query.length > 0) {
      fetchCountries();
    }
  }, [query]);
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
      return null;
    }
  };

  const fetchCountries = async () => {
    setIsLoading(true);
    try {
      let accessToken = localStorage.getItem("access");
      if (!accessToken) {
        console.log("No hay token. Inicia sesión nuevamente.");
        setIsLoading(false);
        return;
      }

      const config = {
        params: { query },
        headers: { Authorization: `Bearer ${accessToken}` },
      };

      const response = await axios.get(
        "http://localhost:8000/api/country/search/",
        config
      );

      setCountries(response.data);
      setIsSearching(true);
    } catch (error) {
      if (error.response?.status === 401) {
        const newAccessToken = await refreshToken();
        if (newAccessToken) {
          const config = {
            params: { query },
            headers: { Authorization: `Bearer ${newAccessToken}` },
          };
          const retryResponse = await axios.get(
            "http://localhost:8000/api/country/search/",
            config
          );
          setCountries(retryResponse.data);
          setIsSearching(true);
        }
      } else {
        console.error("Error al obtener países", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCurrencies = async () => {
    try {
      let accessToken = localStorage.getItem("access");
      if (!accessToken) {
        console.log("No hay token. Inicia sesión nuevamente.");
        return;
      }

      const config = {
        headers: { Authorization: `Bearer ${accessToken}` },
      };

      const response = await axios.get(
        "http://localhost:8000/api/currency/search/",
        config
      );
      setCurrencies(response.data);
    } catch (error) {
      console.error("Error al obtener monedas", error);
    }
  };

  const handleSaveCountry = async () => {
    const { name_country, currencies_ids } = newCountry;
    if (!name_country || currencies_ids.length === 0) {
      console.log("Todos los campos son obligatorios.");
      return;
    }

    setIsLoading(true);
    try {
      let accessToken = localStorage.getItem("access");
      if (!accessToken) {
        console.log("No hay token. Inicia sesión nuevamente.");
        setIsLoading(false);
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      };

      // Añadir el country_id si estamos editando un país
      const dataToSend = selectedCountry
        ? { ...newCountry, country_id: selectedCountry.id } // Incluir el ID del país
        : newCountry;

      const endpoint = selectedCountry
        ? `http://localhost:8000/api/country/update/`
        : "http://localhost:8000/api/country/register/";

      const method = selectedCountry ? axios.put : axios.post;

      await method(endpoint, dataToSend, config);
      console.log(
        selectedCountry ? "País actualizado." : "País creado exitosamente."
      );
      setNewCountry(defaultCountry);
      setSelectedCountry(null);
      setIsCreating(false);
      setIsSearching(false); // Oculta la búsqueda después de crear o actualizar
      fetchCountries();
    } catch (error) {
      console.error("Error al guardar el país", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCountry = (country) => {
    setSelectedCountry(country);
    setNewCountry({
      name_country: country.name_country,
      currencies_ids: country.currencies.map((currency) => currency.id),
    });
    setIsCreating(true);
  };

  return (
    <div className="usuarios-container">
      <div className="usuarios-actions">
        <input
          type="text"
          placeholder="Buscar países..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsCreating(false); // Oculta el formulario de creación al escribir en el input
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              fetchCountries();
              setIsCreating(false); // Oculta el formulario de creación al presionar Enter
            }
          }}
        />
        <div className="action-buttons">
          <button
            onClick={() => {
              fetchCountries();
              setIsCreating(false); // Oculta el formulario de creación al buscar
            }}
            disabled={isLoading}
          >
            {isLoading ? "CARGANDO..." : "BUSCAR"}
          </button>
          <button
            onClick={() => {
              setIsCreating(true);
              setIsSearching(false); // Oculta la búsqueda y muestra el formulario de creación
              setSelectedCountry(null);
              setNewCountry(defaultCountry);
            }}
            disabled={isLoading}
          >
            CREAR
          </button>
        </div>
      </div>

      {/* Mostrar formulario de creación o edición */}
      {isCreating && (
        <div className="create-form">
          <h3>{selectedCountry ? "Editar País" : "Nuevo País"}</h3>
          <input
            placeholder="Nombre *"
            value={newCountry.name_country || ""} // Asegúrate de que nunca sea `undefined`
            onChange={(e) =>
              setNewCountry({ ...newCountry, name_country: e.target.value })
            }
          />

          <div className="checkbox-group">
            <label>Monedas</label>
            <div className="checkboxes">
              {currencies.map((currency) => (
                <div key={currency.id} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={newCountry.currencies_ids?.includes(currency.id)} // Usa `?.` para prevenir posibles errores si `currencies_ids` es `undefined`
                    onChange={(e) => {
                      if (e.target.checked) {
                        setNewCountry((prev) => ({
                          ...prev,
                          currencies_ids: [...prev.currencies_ids, currency.id],
                        }));
                      } else {
                        setNewCountry((prev) => ({
                          ...prev,
                          currencies_ids: prev.currencies_ids.filter(
                            (id) => id !== currency.id
                          ),
                        }));
                      }
                    }}
                  />
                  <label>{currency.name_currency}</label>
                </div>
              ))}
            </div>
          </div>

          <div className="form-buttons">
            <button onClick={handleSaveCountry} disabled={isLoading}>
              {isLoading
                ? "GUARDANDO..."
                : selectedCountry
                ? "ACTUALIZAR"
                : "GUARDAR"}
            </button>
            <button
              onClick={() => {
                setIsCreating(false);
                setSelectedCountry(null);
              }}
              disabled={isLoading}
            >
              CANCELAR
            </button>
          </div>
        </div>
      )}

      {/* Mostrar tabla de países */}
      {isSearching && (
        <table className="usuarios-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Monedas</th>
            </tr>
          </thead>
          <tbody>
            {countries.map((country) => (
              <tr key={country.id} onClick={() => handleEditCountry(country)}>
                <td>{country.name}</td>
                <td>
                  {country.currencies.length > 0
                    ? country.currencies.map((currency) => (
                        <div key={currency.id}>{currency.name}</div>
                      ))
                    : "Sin monedas"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
