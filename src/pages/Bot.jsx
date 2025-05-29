import React, { useState } from 'react';
import { Stack, Box, FormControlLabel, Switch, Typography } from "@mui/material";
import SettingsComponent from "../components/Settings";
import Dashboard from "../components/Dashboard";

const Bot = () => {
    const [config, setConfig] = useState({
        router: null,
        token: null,
        amounts: [],           // Amount per transaction step
        gaps: [],              // Gap (in seconds) per step
        transactions: 0,       // Number of transactions
        slippage: 0,           // % slippage
        privateKey: null,
        isRunning: false,
    });

    const [buy, setBuy] = useState(true);

    return (
        <Box className="boxs" sx={{ p: 5, mt: 4, minHeight: "100vh"}}>
            <Box sx={{ textAlign: "center", mb: 2 }}>
                <Typography variant="h6">Select Mode</Typography>
                <FormControlLabel
                    className='switch'
                    control={<Switch checked={!buy} onChange={() => setBuy(prev => !prev)} />}
                    label={!buy ? "Sell Mode" : "Buy Mode"}
                    disabled={config.isRunning}
                />
            </Box>
            <Stack spacing={4} direction={{ xs: "column", md: "row" }}>
                <Box sx={{ width: { xs: "100%", md: "300px" }, flexShrink: 0 }}>
                    <SettingsComponent config={config} setConfig={setConfig} buy={buy} />
                </Box>
                <Box sx={{ width: { xs: "100%", md: "calc(100% - 320px)" }, flexGrow: 1 }}>
                    <Dashboard setConfig={setConfig} config={config} buy={buy} />
                </Box>
            </Stack>
        </Box>
    );
};

export default Bot;
