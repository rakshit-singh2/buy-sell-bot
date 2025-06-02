import { Container } from "@mui/material";
import { Outlet, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const AuthLayout = () => {

    const { isLoggedIn } = useSelector((state) => state.auth);

    if (isLoggedIn) {
        return <Navigate to="/" />
    }

    return (
        <>
            <Container sx={{ mt: 5 }} maxWidth="sm" >
                <Outlet />
            </Container>
        </>
    );
};

export default AuthLayout;
