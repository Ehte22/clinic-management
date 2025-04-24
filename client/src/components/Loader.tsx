import { Box, CircularProgress } from '@mui/material'

const Loader = () => {
    return <>
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
            <CircularProgress color="secondary" />
        </Box>
    </>
}

export default Loader