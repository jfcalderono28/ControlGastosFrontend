import { useEffect, useState } from "react";
import axios from "axios";

export default function Usuarios() {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState(""); // State for search query
  const [error, setError] = useState(null);

  // Function to fetch user data
  const fetchUsers = async () => {
    try {
      const accessToken = localStorage.getItem("access");



      // Make sure query parameter is passed correctly
      const response = await axios.get("http://localhost:8000/api/user/search/", {
        params: { query }, // Send query param in the URL
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      setUsers(response.data); // Set user data
    } catch (err) {
      // Handle errors, such as token expiration
      if (
        err.response?.status === 401 &&
        err.response.data?.code === "token_not_valid"
      ) {
        try {
          const refreshToken = localStorage.getItem("refresh");
          const refreshResponse = await axios.post(
            "http://localhost:8000/api/token/refresh/",
            { refresh: refreshToken }
          );

          const newAccess = refreshResponse.data.access;
          localStorage.setItem("access", newAccess);

          // Retry the original request after refreshing the token
          fetchUsers();
        } catch (refreshError) {
          console.error("Token refresh failed. Please log in again.");
          setError("Tu sesión expiró. Inicia sesión nuevamente.");
        }
      } else {
        console.error("Error fetching user data:", err);
        setError("Error al obtener usuarios.");
      }
    }
  };

  // Trigger fetchUsers when the component mounts
  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="usuarios-container">
      <div className="usuarios-actions">
        <input
          type="text"
          placeholder="Buscar usuarios..."
          value={query}
          onChange={(e) => setQuery(e.target.value)} // Update query state
        />
        <button onClick={fetchUsers}>BUSCAR</button>
        <button>CREAR</button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <table className="usuarios-table">
        <thead>
          <tr>
            <th>NOMBRE</th>
            <th>EMAIL</th>
            <th>ULTIMO LOGIN</th>
            <th>PHONE</th>
            <th>ID_STATUS</th>
            <th>ID_ACTIVE</th>
            <th>ID_STAFF</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>Aún no existe</td>
              <td>{user.phone}</td>
              <td>{user.status_id}</td>
              <td>{user.is_superuser ? "✔️" : "❌"}</td>
              <td>{user.is_staff ? "✔️" : "❌"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
