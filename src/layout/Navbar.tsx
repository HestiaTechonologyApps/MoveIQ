// src/components/AdminComponents/AdminNavbar.tsx
import React, { useEffect, useState } from "react";
import { BsBell, BsChevronDown } from "react-icons/bs";
import { Container, Image, Offcanvas, Button, Navbar } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import AuthService from "../services/common/Auth.services";
import Profile from "./Profile";
import ActivityPanel from "./ActivityPanel";
import KiduYearSelector from "../components/KiduYearSelector";
import { useYear } from "../context/YearContext";
import  profileImg from "../assets/Images/profile.jpeg"
import { getFullImageUrl } from "../constants/API_ENDPOINTS";

const NavbarComponent: React.FC = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [username, setUsername] = useState<string>("Username");
  const [profilePic, setProfilePic] = useState<string>(profileImg);
   const { selectedYear, setSelectedYear } = useYear();
  const navigate = useNavigate();
  // Fetch username from localStorage
  useEffect(() => {
  try {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);

      if (parsedUser?.userName) {
        queueMicrotask(() => {
          setUsername(parsedUser.userName);
        });
      }
       // ✅ FIXED: Use correct field name (profileImagePath instead of profilePic)
       if (parsedUser?.profileImagePath) {
        setProfilePic(getFullImageUrl(parsedUser.profileImagePath));
      }
    }
    
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
  } catch (error) {
    console.error("Error parsing user from localStorage:", error);
  }
}, []);

  const toggleSettings = () => setShowSettings((prev) => !prev);
  const handleClose = () => setShowNotifications(false);
  const handleShow = () => setShowNotifications(true);

  const handleYearSelect = (year: number) => {
    setSelectedYear(year);
    console.log("Selected Year Updated Globally:", year);
  };

  const handleLogout = () => {
    AuthService.logout();
    navigate("/");
  };

  return (
    <>
      <Navbar
        expand="lg"
        fixed="top"
        className="bg-white"
        style={{
          height: "60px",
          zIndex: 999,
          paddingLeft: "15px",
          paddingRight: "15px",
        }}
      >
        <Container
          fluid
          className="d-flex shadow align-items-center justify-content-between"
          style={{
            marginLeft: window.innerWidth >= 768 ? "70px" : "0px",
            transition: "margin-left 0.3s ease-in-out",
          }}
        >
          {/* Left Side */}
          <div className="d-flex align-items-center head-font">
            <p
              className="mb-0 text-dark"
              style={{
                fontSize: "12px",
                fontWeight: 500,
              }}
            >
              <span style={{ color: "#FF2A2A" }}>Welcome</span>
              <br />
              {username}
            </p>
          </div>

          {/* Right Side */}
          <div className="d-flex align-items-center gap-1">

            {/* Year Dropdown */}
            <div className="me-3">
              <KiduYearSelector
                startYear={2023}
                onYearSelect={handleYearSelect}
                defaultYear={selectedYear}
              />
            </div>

            {/* Notifications */}
            <BsBell
              size={20}
              className="cursor-pointer"
              onClick={handleShow}
            />

            {/* Profile Section */}
            <div
              className="d-flex align-items-center cursor-pointer border-none py-1 ms-3"
              onClick={toggleSettings}
            >
              <Image
                //src={profileImg}
                src={profilePic}
                alt="profile"
                className="rounded-circle me-2 border border-2"
                style={{ width: "30px", height: "30px", objectFit: "cover" }}
              />
              <div className="text-end">
                <p className="mb-0" style={{ color: "#787486", fontSize: "12px" }}>
                  {username}
                </p>
              </div>
              <BsChevronDown className="ms-2" />
            </div>

            {/* Logout Button */}
            <Button
              size="sm"
              className="d-flex align-items-center"
              style={{
                fontSize: "12px",
                fontWeight: 500,
                borderRadius: "20px",
                backgroundColor:"white",
                border:"none",
                color:"#808080ff"
              }}
              onClick={handleLogout}
            >
              {/* <BsBoxArrowRight size={14} className="me-1"/> */}
              Logout
            </Button>
          </div>
        </Container>
      </Navbar>

      {/* Notification Offcanvas */}
      <ActivityPanel show={showNotifications} handleClose={handleClose} />

      {/* Admin Settings Offcanvas */}
      <Offcanvas
        show={showSettings}
        onHide={() => setShowSettings(false)}
        placement="end"
      >
        <Offcanvas.Header closeButton>
          <h5 className="fw-semibold text-center" style={{ color: "#18575A" }}>
            Account Settings
          </h5>
        </Offcanvas.Header>
        <Offcanvas.Body className="p-0">
         < Profile />
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default NavbarComponent;
