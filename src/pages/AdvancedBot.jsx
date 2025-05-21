import React, { useState } from 'react'
import { Stack, Box, FormControlLabel, Switch, Typography } from "@mui/material";
import AdvancedSettingsComponent from "../components/AdvancedSettings";
import AdvancedDashboard from "../components/AdvancedDashboard";

const AdvancedBot = () => {
    const [config, setConfig] = useState({
        router: null,
        token: null,
        buyAmounts: [],      // ← NEW
        sellAmounts: [],     // ← NEW
        buyGaps: [],         // ← NEW
        sellGaps: [],        // ← NEW
        buyTransactions: 0,
        sellTransactions: 0,
        slippage: 0,
        isRunning: false,
        privateKey: null,
      });

    return (
        <Box sx={{ p: 5, mt: 4 }}>

            <Stack spacing={4} direction={{ xs: "column", md: "row" }}>
                <Box sx={{ width: { xs: "100%", md: "300px" }, flexShrink: 0 }}>
                    <AdvancedSettingsComponent config={config} setConfig={setConfig} />
                </Box>

                <Box sx={{ width: { xs: "100%", md: "calc(100% - 320px)" }, flexGrow: 1 }}>
                    <AdvancedDashboard setConfig={setConfig} config={config} />
                </Box>
            </Stack>

        </Box>
    )
}

export default AdvancedBot
