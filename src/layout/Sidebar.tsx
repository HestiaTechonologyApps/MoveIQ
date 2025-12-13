import React, { useEffect, useState } from "react";
import { Nav, Navbar, Container, Collapse } from "react-bootstrap";
import { NavLink, useNavigate } from "react-router-dom";
import { BsGridFill, BsPeople, BsGear, BsPersonFill, BsChevronDown, BsCashStack, BsCarFront, } from "react-icons/bs";
import { BiLogOut } from "react-icons/bi";
import AuthService from "../services/common/Auth.services";
import { FaCarSide, FaFileInvoice} from "react-icons/fa6";
import  profileImg from "../assets/Images/profile.jpeg"
import { getFullImageUrl } from "../constants/API_ENDPOINTS";

const Sidebar: React.FC = () => {
    const [hovered, setHovered] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [vehiclesOpen, setVehiclesOpen] = useState(false);
    const [profilePic, setProfilePic] = useState<string>(profileImg);
    const navigate = useNavigate();

    const menuItems = [
        { icon: <BsGridFill />, label: "Dashboard", path: "/dashboard", exact: true },
        { icon:<FaCarSide />, label: "My Trips", path: "/dashboard/total-trips" },
        { icon: <BsPeople />, label: "Customers", path: "/dashboard/customer-list" },
        { icon: <BsPersonFill />, label: "Drivers", path: "/dashboard/driver-list" },
        { icon: <FaFileInvoice />, label: "Invoices", path: "/dashboard/invoice-management" },
        { icon: <BsCashStack />, label: "Expenses", path: "/dashboard/expense-list" },
    ];

    const vehiclesSubMenu = [
        { label: "Vehicles", path: "/dashboard/vehicle/vehicle-list" },
        { label: "Maintenance", path: "/dashboard/vehicle/maintenance-list" },
    ]

    const settingsSubMenu = [
        { label: "Users", path: "/dashboard/settings/user-list" },
        { label: "Company", path: "/dashboard/settings/company-list" },
        { label: "Expense Types", path: "/dashboard/settings/expense-type-list" },
    ];

    useEffect(() => {
  try {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);

       //Use correct field name (profileImagePath instead of profilePic)
      if (parsedUser?.profileImagePath) {
        setProfilePic(getFullImageUrl(parsedUser.profileImagePath));
      }
    }

    // 🔄 LISTEN FOR CHANGES TO PROFILE PIC
    // window.addEventListener("profile-pic-updated", () => {
    //   const updatedUser = localStorage.getItem("user");
    //   if (updatedUser) {
    //     const parsed = JSON.parse(updatedUser);
    //     setProfilePic(getFullImageUrl(parsed.profilePic));
    //   }
    // });
    // ✅ FIXED: Event listener to update profile pic when changed in Profile component
    const handleProfilePicUpdate = () => {
      const updatedUser = localStorage.getItem("user");
      if (updatedUser) {
        const parsed = JSON.parse(updatedUser);
        // ✅ FIXED: Use correct field name
        if (parsed?.profileImagePath) {
          setProfilePic(getFullImageUrl(parsed.profileImagePath));
        }
      }
    };

    window.addEventListener("profile-pic-updated", handleProfilePicUpdate);

    // ✅ ADDED: Cleanup event listener on unmount
    return () => {
      window.removeEventListener("profile-pic-updated", handleProfilePicUpdate);
    };

  } catch (err) {
     console.error("Sidebar image load error:", err);
  }
}, []);

    const handleLogout = () => {
        AuthService.logout();
        navigate("/login", { replace: true });
    };

    return (
        <>
            {/* Sidebar for medium+ screens */}
            <div
                className="d-none d-md-flex flex-column rounded-3 align-items-center py-3 position-fixed"
                style={{
                    width: hovered ? "200px" : "70px",
                    minHeight: "100vh",
                    backgroundColor: "#18575A",
                    transition: "width 0.3s",
                    zIndex: 1000,
                }}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
            >
                {/* Profile section */}
                <div className="profile-section text-center mb-4">
                    {hovered ? (
                        <p className="mt-2 text-white fw-bold" style={{ fontSize: "15px" }}>
                           <span>MoveIQ</span>
                        </p>
                    ) : <p className="fw-bolder fs-6 text-white head-font"><span style={{fontSize:"8px"}}>MoveIQ</span></p>}
                    <img
                       // src={profileImg}
                        src={profilePic}
                        alt="profile"
                        className="rounded-circle mb-2"
                        style={{
                            width: hovered ? "80px" : "45px",
                            height: hovered ? "80px" : "45px",
                            border: "2px solid white",
                            transition: "all 0.3s",
                        }}
                    />
                </div>
                <div
                    style={{
                        flex: 1,
                        width: "100%",
                        maxHeight: "calc(100vh - 190px)",
                        overflowY: hovered ? "auto" : "hidden",
                        overflowX: hovered ? "hidden" : "hidden",
                        scrollbarWidth: "thin",
                        scrollbarColor: "#c0d5d6ff transparent",
                    }}
                    className="admin-sidebar-scroll"
                >
                    {/* Navigation items */}
                    <Nav className="flex-column gap-2 w-100 text-center">
                        {menuItems.map((item, index) => (
                            <div className="text-start" key={index}>
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    end={item.exact}
                                    className={({ isActive }) =>
                                        `d-flex align-items-center p-2  ${isActive ? "bg-white text-success" : "text-white"
                                        } ${hovered ? "justify-content-start ms-5 me-5" : "justify-content-center"} rounded mx-2`
                                    }
                                    style={{ fontSize: "14px", textDecoration: "none" }}
                                >
                                    {item.icon}
                                    {hovered && <span className="ms-2 rounded">{item.label}</span>}
                                </NavLink>
                            </div>
                        ))}

                        {/* Vehicles */}
                        <div
                            className={`flex-column gap-2 w-100 text-center mt-1 ${hovered ? "justify-content-start mt-2" : "justify-content-center"} rounded `}
                            style={{ fontSize: "14px", textDecoration: "none" }}
                            onClick={() => setVehiclesOpen(!vehiclesOpen)}
                        >
                            <BsCarFront className="text-white" />
                            {hovered && (
                                <>
                                    <span className="ms-2 text-white" style={{ cursor: "pointer" }}>Vehicles</span>
                                    <BsChevronDown
                                        className="ms-2 text-white"
                                        style={{ transition: "transform 0.3s", cursor: "pointer", transform: vehiclesOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                                    />
                                </>
                            )}
                        </div>

                        <Collapse in={vehiclesOpen && hovered}>
                            <div className="flex-column text-light mt-2" >
                                {vehiclesSubMenu.map((sub) => (
                                    <NavLink
                                        key={sub.path}
                                        to={sub.path}
                                        end
                                        className={({ isActive }) =>
                                            `d-block p-1 ${isActive ? "bg-white text-success rounded mx-3" : "text-white"}`
                                        }
                                        style={{ fontSize: "12px", textDecoration: "none" }}
                                    >
                                        {sub.label}
                                    </NavLink>
                                ))}
                            </div>
                        </Collapse>

                        {/* Settings */}
                        <div
                            className={`flex-column gap-2 w-100 text-center ${hovered ? "justify-content-start mt-3" : "justify-content-center"} rounded  mt-2`}
                            style={{ fontSize: "14px", textDecoration: "none" }}
                            onClick={() => setSettingsOpen(!settingsOpen)}
                        >
                            <BsGear className="text-white" />
                            {hovered && (
                                <>
                                    <span className="ms-2 text-white" style={{ cursor: "pointer" }}>Settings</span>
                                    <BsChevronDown
                                        className="ms-2 text-white"
                                        style={{ transition: "transform 0.3s", cursor: "pointer", transform: settingsOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                                    />
                                </>
                            )}
                        </div>

                        <Collapse in={settingsOpen && hovered}>
                            <div className="flex-column text-light mt-2" >
                                {settingsSubMenu.map((subItem) => (
                                    <NavLink
                                        key={subItem.path}
                                        to={subItem.path}
                                        end
                                        className={({ isActive }) =>
                                            `d-block p-1 ${isActive ? "bg-white text-success rounded mx-3" : "text-white"}`
                                        }
                                        style={{ fontSize: "12px", textDecoration: "none" }}
                                    >
                                        {subItem.label}
                                    </NavLink>
                                ))}
                            </div>
                        </Collapse>

                        {/* Logout */}
                        <p
                            onClick={handleLogout}
                            className="d-flex align-items-center justify-content-center p-2 text-white mt-5 mx-3 rounded fw-semibold"
                            style={{ fontSize: "16px", textDecoration: "none", backgroundColor: "#1b6668ff", cursor: "pointer" }}
                        >
                            <BiLogOut />
                            {hovered && <span className="ms-2">Logout</span>}
                        </p>
                    </Nav>
                </div>

            </div>

            {/* Bottom navbar for small screens */}
            <Navbar
                fixed="bottom"
                expand="md"
                className="d-md-none"
                style={{ backgroundColor: "#18575A" }}
            >
                <Container fluid className="justify-content-around">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.exact}
                            className={({ isActive }) =>
                                `d-flex flex-column align-items-center ${isActive ? "text-warning" : "text-white"
                                }`
                            }
                            style={{ fontSize: "10px", textDecoration: "none" }}
                        >
                            {item.icon}
                            <span style={{ fontSize: "10px" }}>{item.label}</span>
                        </NavLink>
                    ))}
                </Container>
            </Navbar>

            {/* Inline minimal WebKit scrollbar styles */}
            <style>
                {`
          .admin-sidebar-scroll::-webkit-scrollbar {
            width: 8px;
          }
          .admin-sidebar-scroll::-webkit-scrollbar-thumb {
            background: rgba(192,213,214,0.9);
            border-radius: 6px;
          }
          .admin-sidebar-scroll::-webkit-scrollbar-track {
            background: transparent;
          }
        `}
            </style>
        </>
    );
};

export default Sidebar;