// src/components/Layout.jsx
import { Outlet, Link, useNavigate } from 'react-router-dom';

export default function Layout({ onLogout }) {
  const name = localStorage.getItem('user_name');
  const photo = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/User_icon_2.svg/800px-User_icon_2.svg.png';

  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout(); // limpia el token
    navigate('/login'); // redirige al login
  };

  return (
    <div className="dashboard-wrapper">
      <aside className="sidebar">
        <h2>Mi Panel</h2>
        <nav>
          <ul>
            <li><button className="nav-button" onClick={() => navigate("/")}>Inicio</button></li>
            <li><button className="nav-button" onClick={() => navigate("/usuarios")}>Usuarios</button></li>
            <li><button disabled className="nav-button">Reportes</button></li>
            <li><button disabled className="nav-button">Configuración</button></li>
          </ul>
        </nav>
      </aside>

      <div className="main-container">
        <header className="navbar">
          <h1>Dashboard</h1>
          <div className="user-info">
            <span>Hola, {name}</span>
            <img src={photo} alt="Foto de perfil" className="profile-pic" />
            <button className="logout-btn" onClick={handleLogout}>
              Cerrar sesión
            </button>
          </div>
        </header>

        <main className="content">
          <Outlet />
        </main>

        <footer className="footer">
          &copy; 2025 Mi App. Todos los derechos reservados.
        </footer>
      </div>
    </div>
  );
}
