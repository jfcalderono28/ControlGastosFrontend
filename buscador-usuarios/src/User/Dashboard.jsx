import { useEffect, useState } from "react";
import "../CSS/Dashboard.css";
//https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/User_icon_2.svg/800px-User_icon_2.svg.png

function Dashboard({ onLogout }) {
  const [user, setUser] = useState({
    name: "",
    photo: "",
    is_staff: false,
  });

  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const name = localStorage.getItem("user_name");
    const photo = "";
    const isStaff = localStorage.getItem("is_staff") === "true";

    setUser({ name, photo, is_staff: isStaff });
  }, []);

  const toggleMenu = () => setShowMenu((prev) => !prev);

  return (
    <div className="dashboard-wrapper">
      <div className="main-container">
        <main className="content">
          <div className="cards">
            {user.is_staff && (
              <div className="card">
                <div className="card-image">
                  <img
                    src="https://cdn.pixabay.com/photo/2016/04/15/18/05/computer-1331579_640.png"
                    alt="Imagen del componente"
                  />
                </div>
                <div className="card-title">
                  <h3>Usuarios</h3>
                </div>
              </div>
            )}

            {user.is_staff && (
              <div className="card">
                <div className="card-image">
                  <img
                    src="https://media.istockphoto.com/id/526956171/es/vector/moneda-con-d%C3%B3lar-simple-icono-sobre-fondo-blanco.jpg?s=612x612&w=0&k=20&c=acSFe_LexxQP39T7U5VizbHmUnaFiPHSs2eGDRkqhOo="
                    alt="Imagen del componente"
                  />
                </div>
                <div className="card-title">
                  <h3>Monedas</h3>
                </div>
              </div>
            )}
            {user.is_staff && (
              <div className="card">
                <div className="card-image">
                  <img
                    src="https://static.vecteezy.com/system/resources/previews/036/100/242/non_2x/country-concept-line-icon-simple-element-illustration-country-concept-outline-symbol-design-vector.jpg"
                    alt="Imagen del componente"
                  />
                </div>
                <div className="card-title">
                  <h3>Country</h3>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
