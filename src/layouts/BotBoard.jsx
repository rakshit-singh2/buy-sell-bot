import { useState } from "react";
import { Drawer, List, ListItem, ListItemIcon, ListItemText, IconButton } from "@mui/material";
import { Home, Menu } from "@mui/icons-material";
import SmartToyIcon from '@mui/icons-material/SmartToy';
import LogoutIcon from '@mui/icons-material/Logout';
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useSelector } from "react-redux";

function BotBoard() {
  const { isLoggedIn } = useSelector((state) => state.auth);
  if (!isLoggedIn) {
    return <Navigate to={"/auth/login"} />;
  }
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <>
      <Header />
      <IconButton onClick={toggleDrawer} sx={{ position: "fixed", top: 20, left: 20, zIndex: 1000 }}>
        <Menu />
      </IconButton>
      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer}>
        <List sx={{ width: 250 }}>
          <ListItem sx={{ cursor: "pointer" }} onClick={() => { navigate('/'); toggleDrawer(); }}>
            <ListItemIcon>
              <Home />
            </ListItemIcon>
            <ListItemText primary="Home" />
          </ListItem>
          {/* Navigation */}
          {/* <ListItem sx={{ cursor: "pointer" }} onClick={() => { navigate('/'); toggleDrawer(); }}>
            <ListItemIcon>
              <SmartToyIcon />
            </ListItemIcon>
            <ListItemText primary="Bot" />
          </ListItem> */}
          <ListItem onClick={() => { navigate('/logout'); toggleDrawer(); }}>
            <ListItemIcon><LogoutIcon /></ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
      </Drawer>
      <Outlet />
      <Footer />
    </>
  );
}

export default BotBoard;
