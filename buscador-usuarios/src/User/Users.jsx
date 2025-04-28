import { useState } from "react";
import { useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../CSS/Users.css";

export default function Usuarios() {
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone) => /^\d{10,}$/.test(phone);
  const validateName = (name) => name.trim().length >= 8;
  const [confirmPassword, setConfirmPassword] = useState("");

  const defaultUser = {
    email: "",
    name: "",
    phone: "",
    photo: null,
    password: "",
    is_superuser: false,
    is_staff: false,
    is_active: false,
  };

  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [newUser, setNewUser] = useState(defaultUser);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (query.length === 0) {
    }
    fetchUsers(); // Se llama solo una vez al montar
  }, []);
  useEffect(() => {
    if (query.length > 0) {
      fetchUsers();
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

  const fetchUsers = async () => {
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
          "http://localhost:8000/api/user/search/",
          config
        );
        setUsers(response.data);
        setIsSearching(true);
        setIsCreating(false);
        setSelectedUser(null);
      } catch (error) {
        if (error.response?.status === 401) {
          const newAccessToken = await refreshToken();
          if (newAccessToken) {
            config.headers.Authorization = `Bearer ${newAccessToken}`;
            const retryResponse = await axios.get(
              "http://localhost:8000/api/user/search/",
              config
            );
            setUsers(retryResponse.data);
            setIsSearching(true);
            setIsCreating(false);
            setSelectedUser(null);
          }
        } else {
          throw error;
        }
      }
    } catch (err) {
      console.error("Error al obtener usuarios:", err);
      toast.error(err.response?.data?.message || "Error al obtener usuarios");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoChange = (e) => {
    setNewUser({ ...newUser, photo: e.target.files[0] });
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setNewUser({
      ...user,
      password: "",
      photo: null,
    });
    setIsCreating(true);
  };

  const handleSaveUser = async () => {
    const { name, email, phone, password } = newUser;
    if (!name || !email || !phone || (!password && !selectedUser)) {
      toast.warning("Por favor completa todos los campos obligatorios.");
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

      const formData = new FormData();
      formData.append("name", newUser.name);
      formData.append("email", newUser.email);
      formData.append("phone", newUser.phone);
      if (password) formData.append("password", password);
      formData.append("is_superuser", newUser.is_superuser);
      formData.append("is_staff", newUser.is_staff);
      formData.append("is_active", newUser.is_active);
      if (newUser.photo) {
        formData.append("photo", newUser.photo);
      }

      const config = {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "multipart/form-data",
        },
      };

      const endpoint = selectedUser
        ? `http://localhost:8000/api/user/update/${selectedUser.id}/`
        : "http://localhost:8000/api/user/register/";

      const method = selectedUser ? axios.put : axios.post;

      try {
        await method(endpoint, formData, config);
        toast.success(
          selectedUser ? "Usuario actualizado." : "Usuario creado exitosamente."
        );
        setNewUser(defaultUser);
        setSelectedUser(null);
        setIsCreating(false);
        setIsSearching(false);
      } catch (error) {
        if (error.response?.status === 401) {
          const newAccessToken = await refreshToken();
          if (newAccessToken) {
            config.headers.Authorization = `Bearer ${newAccessToken}`;
            await method(endpoint, formData, config);
            toast.success(
              selectedUser
                ? "Usuario actualizado."
                : "Usuario creado exitosamente."
            );
            setNewUser(defaultUser);
            setSelectedUser(null);
            setIsCreating(false);
            setIsSearching(false);
          }
        } else {
          throw error;
        }
      }
    } catch (err) {
      const emailError = err.response?.data?.email?.[0];
      if (emailError) {
        toast.error("Email ya registrado");
      } else {
        toast.error(
          err.response?.data?.message || "Error al guardar el usuario"
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid =
    validateName(newUser.name) &&
    validateEmail(newUser.email) &&
    validatePhone(newUser.phone) &&
    newUser.password.trim() &&
    newUser.password === confirmPassword;

  return (
    <div className="usuarios-container">
      <div className="usuarios-actions">
        <input
          type="text"
          placeholder="Buscar usuarios..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchUsers()}
        />
        <div className="action-buttons">
          <button
            className="search-button"
            onClick={fetchUsers}
            disabled={isLoading}
          >
            {isLoading ? "CARGANDO..." : "BUSCAR"}
          </button>
          <button
            className="create-button"
            onClick={() => {
              setIsCreating(true);
              setIsSearching(false);
              setSelectedUser(null);
              setNewUser(defaultUser);
            }}
            disabled={isLoading}
          >
            CREAR
          </button>
        </div>
      </div>

      {isCreating && (
        <div className="create-form">
          <h3>{selectedUser ? "Editar Usuario" : "Nuevo Usuario"}</h3>
          <input
            placeholder="Nombre *"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
          />
          {newUser.name && !validateName(newUser.name) && (
            <p className="error-text">
              El nombre debe tener al menos 8 caracteres
            </p>
          )}
          <input
            placeholder="Email *"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          />
          {newUser.email && !validateEmail(newUser.email) && (
            <p className="error-text">Correo inválido</p>
          )}
          <input
            placeholder="Teléfono *"
            value={newUser.phone}
            onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
          />
          {newUser.phone && !validatePhone(newUser.phone) && (
            <p className="error-text">
              El teléfono debe tener al menos 10 dígitos
            </p>
          )}
          <label>
            Foto:
            <input type="file" onChange={handlePhotoChange} />
          </label>
          <input
            type="password"
            placeholder={selectedUser ? "Nueva Contraseña" : "Contraseña *"}
            value={newUser.password}
            onChange={(e) =>
              setNewUser({ ...newUser, password: e.target.value })
            }
          />
          <input
            type="password"
            placeholder="Confirmar Contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {newUser.password &&
            confirmPassword &&
            newUser.password !== confirmPassword && (
              <p className="error-text">Las contraseñas no coinciden</p>
            )}

          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={newUser.is_superuser}
                onChange={(e) =>
                  setNewUser({ ...newUser, is_superuser: e.target.checked })
                }
              />
              Superusuario
            </label>
            <label>
              <input
                type="checkbox"
                checked={newUser.is_staff}
                onChange={(e) =>
                  setNewUser({ ...newUser, is_staff: e.target.checked })
                }
              />
              Staff
            </label>
            <label>
              <input
                type="checkbox"
                checked={newUser.is_active}
                onChange={(e) =>
                  setNewUser({ ...newUser, is_active: e.target.checked })
                }
              />
              Active
            </label>
          </div>

          <div className="form-buttons">
            <button
              onClick={handleSaveUser}
              disabled={!isFormValid || isLoading}
            >
              {isLoading
                ? "GUARDANDO..."
                : selectedUser
                ? "ACTUALIZAR"
                : "GUARDAR"}
            </button>
            <button
              onClick={() => {
                setIsCreating(false);
                setSelectedUser(null);
              }}
              disabled={isLoading}
            >
              CANCELAR
            </button>
          </div>
        </div>
      )}

      {isSearching && (
        <>
          {isLoading && <p>Cargando usuarios...</p>}
          <table className="usuarios-table">
            <thead>
              <tr>
                <th>NOMBRE</th>
                <th>EMAIL</th>
                <th>ÚLTIMO LOGIN</th>
                <th>TELÉFONO</th>
           
                <th>ACTIVE</th>
                <th>STAFF</th>
                <th>SUPERUSER</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} onClick={() => handleEditUser(user)}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    {user.last_login
                      ? new Date(user.last_login).toLocaleString()
                      : "Aún no existe"}
                  </td>
                  <td key={user.id}>{user.phone}</td>
                  
                  <td>{user.is_active ? "✔️" : "❌"}</td>
                  <td>{user.is_staff ? "✔️" : "❌"}</td>
                  <td>{user.is_superuser ? "✔️" : "❌"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
