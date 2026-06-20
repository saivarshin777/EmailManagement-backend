import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaHome,
  FaEnvelope,
  FaUsers,
  FaChartBar,
  FaBell,
  FaCog,
  FaSignOutAlt,
  FaBars,
  FaCrown,
  FaPalette,
  FaProjectDiagram,
} from "react-icons/fa";

function Sidebar({ activePage, setActivePage }) {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();

  const menuItems = [
    { name: "Dashboard", icon: <FaHome /> },
    { name: "Campaigns", icon: <FaEnvelope /> },
    { name: "Templates", icon: <FaPalette /> },
    { name: "Contacts", icon: <FaUsers /> },
    { name: "Automations", icon: <FaProjectDiagram /> },
    { name: "Analytics", icon: <FaChartBar /> },
    { name: "Notifications", icon: <FaBell /> },
    { name: "Settings", icon: <FaCog /> },
    { name: "Logout", icon: <FaSignOutAlt /> },
  ];

  const handleMenuClick = (itemName) => {
    if (itemName === "Logout") {
      const confirmLogout = window.confirm(
        "Are you sure you want to logout?"
      );

      if (confirmLogout) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("loggedInUser");

        alert("Logged out successfully");
        navigate("/login");
      }
    } else {
      setActivePage(itemName);
    }
  };

  return (
    <div className={open ? "sidebar" : "sidebar collapsed"}>
      <div className="top-section">
        <h2>
          Mail<span>Nova</span>
        </h2>

        <FaBars
          className="menu-icon"
          onClick={() => setOpen(!open)}
        />
      </div>

      <ul>
        {menuItems.map((item) => (
          <li
            key={item.name}
            className={activePage === item.name ? "active" : ""}
            onClick={() => handleMenuClick(item.name)}
          >
            {item.icon}
            {open && item.name}
          </li>
        ))}
      </ul>

      {open && (
        <div className="upgrade-box">
          <FaCrown
            style={{
              fontSize: "22px",
              marginBottom: "8px",
            }}
          />

          <h4>Workspace Plan</h4>
          <p>Plan usage, deliverability, and workspace controls</p>

          <button>Open Billing</button>
        </div>
      )}
    </div>
  );
}

export default Sidebar;
