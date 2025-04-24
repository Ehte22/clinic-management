import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import Logout from '@mui/icons-material/Logout';
import { Button } from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { useSignOutMutation } from '../redux/apis/auth.api';
import { useNavigate } from 'react-router-dom';
import { useGetUserByIdQuery } from '../redux/apis/user.api';
import Toast from './Toast';

const AccountMenu = () => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const { user } = useSelector((state: RootState) => state.auth)

    const [signOut, { data, error, isLoading, isSuccess, isError }] = useSignOutMutation()
    const { data: userData } = useGetUserByIdQuery(user?._id ?? "", { skip: !user?._id })

    const navigate = useNavigate()

    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleSignOut = () => {
        if (user) {
            signOut()
        }
    }

    useEffect(() => {
        if (isSuccess) {
            setTimeout(() => {
                navigate("/sign-in")
            }, 2000);
        }
    }, [isSuccess, navigate])

    return <>
        {isSuccess && <Toast type="success" message={data} />}
        {isError && <Toast type="error" message={error as string} />}
        <Box >
            <Tooltip title={`${userData?.firstName} ${userData?.lastName}`}>
                <IconButton
                    onClick={handleClick}
                    size="small"
                    sx={{ ml: 2 }}
                    aria-controls={open ? 'account-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                >
                    <Avatar
                        src={userData?.profile}
                        alt={`${userData?.firstName} ${userData?.lastName}`}
                        sx={{ width: 32, height: 32 }}
                    ></Avatar>
                </IconButton>
            </Tooltip>
        </Box>
        <Menu
            anchorEl={anchorEl}
            id="account-menu"
            open={open}
            onClose={handleClose}
            onClick={handleClose}
            slotProps={{
                paper: {
                    elevation: 0,
                    sx: {
                        overflow: 'visible',
                        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                        mt: 1.5,
                        '& .MuiAvatar-root': {
                            width: 48,
                            height: 48,
                            ml: -0.5,
                            mr: 1,
                        },
                        '&::before': {
                            content: '""',
                            display: 'block',
                            position: 'absolute',
                            top: 0,
                            right: 14,
                            width: 10,
                            height: 10,
                            bgcolor: 'background.paper',
                            transform: 'translateY(-50%) rotate(45deg)',
                            zIndex: 0,
                        },
                    },
                },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
            <Box sx={{ display: "flex", px: "16px", py: "8px", gap: 1.5 }}>
                <Avatar
                    sx={{ cursor: "pointer" }}
                    src={userData?.profile}
                    alt={`${userData?.firstName} ${userData?.lastName}`}
                    onClick={() => navigate(`/profile/${userData?._id}`)}

                />
                <Box>
                    <Typography sx={{ fontWeight: "bold" }}>{`${userData?.firstName} ${userData?.lastName}`}</Typography>
                    <Typography sx={{ fontSize: "12px", mt: "4px" }}>{userData?.email}</Typography>
                </Box>
            </Box>

            <Divider />

            <Box sx={{ px: "12px", pt: "16px", textAlign: "end" }}>
                <Button onClick={handleSignOut} loading={isLoading} color='inherit' sx={{ border: "1px solid black", fontSize: "13px", fontWeight: "normal", textTransform: "none" }}>
                    <Logout sx={{ fontSize: "18px", color: "black", marginRight: "6px" }} />
                    Sign Out
                </Button>
            </Box>
        </Menu>
    </ >

}

export default AccountMenu
