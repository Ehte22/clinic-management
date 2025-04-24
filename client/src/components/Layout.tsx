import { Box, useMediaQuery, Drawer } from "@mui/material";
import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { useTheme } from "@mui/material/styles";
import { Outlet } from "react-router-dom";

const drawerWidth = 320;
const navbarHeight = 64;

const Layout = () => {
  const theme = useTheme();
  const isXsScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isSmScreen = useMediaQuery(theme.breakpoints.down("md"));
  const isLgScreen = useMediaQuery(theme.breakpoints.up("md"));

  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (isXsScreen) {
      setOpen(false);
    }
  }, [isXsScreen]);

  useEffect(() => {
    if (isSmScreen) {
      setOpen(false);
    }
  }, [isSmScreen]);

  useEffect(() => {
    if (isLgScreen) {
      setOpen(true);
    }
  }, [isLgScreen]);

  return (
    <Box sx={{ display: "flex", height: "100vh", flexDirection: "column" }}>
      <Box
        sx={{ zIndex: theme.zIndex.drawer + 1, }}
      >
        <Navbar open={open} toggleSideBar={() => setOpen(!open)} />
      </Box>

      {isXsScreen ? (
        <Drawer
          anchor="left"
          open={open}
          onClose={() => setOpen(false)}
          sx={{
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
            },
          }}
        >
          <Sidebar open={open} setOpen={setOpen} />
        </Drawer>
      ) : (
        <Sidebar open={open} setOpen={setOpen} />
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          marginTop: `${navbarHeight}px`,
          px: { xs: "12px", sm: "16px", md: "28px" },
          py: "28px",
          marginLeft: isXsScreen ? 0 : open ? `${drawerWidth}px` : "64px",
          backgroundColor: "#F3F3F3",
          transition: theme.transitions.create(["margin-left", "width"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
