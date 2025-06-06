import React, { useEffect, useState } from "react";
import { TextField, Button, Container, Typography, Paper, Box } from "@mui/material";
import { useAppDispatch } from "../redux/store";
import { loginSuccess } from "../redux/slices/auth";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    if (users.length === 0) {
      navigate("/auth/register");
    }
  }, [navigate]);
  
  const handleLogin = () => {
    const storedUsers = JSON.parse(localStorage.getItem("users")) || [];
    const foundUser = storedUsers.find(
      (user) => user.email === email && user.password === password
    );

    if (foundUser) {
      dispatch(loginSuccess({
        token: "fake-token-123",
        user: foundUser.email,
        email: foundUser.email,
        user_id: foundUser.email + "-id"
      }));
      setError("");
    } else {
      setError("Invalid email or password!");
    }
  };


  return (
    <Container className="loginbox" maxWidth="sm">
      <Paper elevation={3} sx={{ padding: 4, mt: 5, textAlign: "center" }}>
        <Typography variant="h5" gutterBottom>
          Login
        </Typography>
        {error && <Typography color="error">{error}</Typography>}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Password"
            variant="outlined"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button variant="contained" color="primary" onClick={handleLogin}>
            Login
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/auth/register")}
          >
            Register
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginPage;
