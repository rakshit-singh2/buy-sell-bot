import React, { useState } from "react";
import { TextField, Button, Container, Typography, Paper, Box } from "@mui/material";

const RegisterPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleRegister = () => {
    if (!email || !password) {
      setMessage("Email and Password are required.");
      return;
    }

    // Fetch existing users
    const existingUsers = JSON.parse(localStorage.getItem("users")) || [];

    // Check if user already exists
    const userExists = existingUsers.some((user) => user.email === email);

    if (userExists) {
      setMessage("User already registered. Please log in.");
      return;
    }

    // Save new user
    const newUser = { email, password };
    localStorage.setItem("users", JSON.stringify([...existingUsers, newUser]));

    setMessage("Registration successful! You can now log in.");
    setEmail("");
    setPassword("");
  };

  return (
    <Container className="loginbox" maxWidth="sm">
      <Paper elevation={3} sx={{ padding: 4, mt: 5, textAlign: "center" }}>
        <Typography variant="h5" gutterBottom>
          Register
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
          <Button variant="contained" color="primary" onClick={handleRegister}>
            Register
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default RegisterPage;
