import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import AccountMenu from './AccountMenu';
import React from 'react';

interface INavbarProps {
    open: boolean
    toggleSideBar: () => void
}

const Navbar: React.FC<INavbarProps> = ({ open, toggleSideBar }) => {
    return <>
        <AppBar position="fixed" sx={{ height: "64px", width: "100%", boxShadow: "none", borderBottom: "1px solid lightgray" }}>
            <Toolbar>
                <IconButton
                    onClick={toggleSideBar}
                    size="large"
                    edge="start"
                    aria-label="menu"
                    sx={{ mr: 2 }}
                >
                    {open ? <MenuOpenIcon /> : <MenuIcon />}
                </IconButton>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }} >
                    Clinic Management
                </Typography>
                <AccountMenu />
            </Toolbar >
        </AppBar >
    </>
}

export default Navbar
