import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Menu, styled, Tooltip, Typography } from '@mui/material'
import MoreVertIcon from '@mui/icons-material/MoreVert';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GridCloseIcon } from '@mui/x-data-grid';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

interface IActionsProps {
    id: string
    deleteAction?: (id: string) => any
    showDelete?: boolean
    showEdit?: boolean
}

const ActionsMenu: React.FC<IActionsProps> = ({ id, deleteAction, showEdit = true, showDelete = true }) => {

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const [openDialog, setOpenDialog] = useState(false)

    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };
    const navigate = useNavigate()

    const handleEdit = (id: string) => {
        navigate(`update/${id}`)
    };

    const handleDelete = () => {
        if (deleteAction) {
            deleteAction(id)
            setOpenDialog(false)
        }
    };

    return <>
        <Box >
            <Tooltip title="Actions">
                <IconButton
                    onClick={handleClick}
                    size="small"
                    aria-controls={open ? 'actions-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                >
                    <MoreVertIcon />
                </IconButton>
            </Tooltip>
        </Box>
        <Menu
            anchorEl={anchorEl}
            id="actions-menu"
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


            {showEdit &&
                <Box sx={{ px: 3 }}>
                    <Button fullWidth color='inherit' sx={{ color: "#424242", textTransform: "none" }}
                        onClick={() => handleEdit(id)} >
                        Edit
                    </Button>
                </Box>
            }
            {
                showDelete &&
                <Box sx={{ px: 3 }}>
                    <Button fullWidth color='inherit' sx={{ color: "#424242", textTransform: "none" }}
                        onClick={() => setOpenDialog(true)}>
                        Delete
                    </Button>
                </Box>
            }
        </Menu >

        {/* Delete Modal */}
        < BootstrapDialog
            onClose={() => setOpenDialog(false)}
            aria-labelledby="customized-dialog-title"
            open={openDialog}
        >
            <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
                Delete Item
            </DialogTitle>
            <IconButton
                aria-label="close"
                onClick={() => setOpenDialog(false)}
                sx={(theme) => ({
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    color: theme.palette.grey[500],
                })}
            >
                <GridCloseIcon />
            </IconButton>
            <DialogContent dividers>
                <Typography gutterBottom>
                    Are you sure you want to delete this item?
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button autoFocus onClick={handleDelete}
                    sx={{ backgroundColor: "red", textTransform: "none" }}>
                    Delete
                </Button>
            </DialogActions>
        </ BootstrapDialog>
    </>
}

export default ActionsMenu