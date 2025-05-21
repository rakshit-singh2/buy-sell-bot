import { Card, CardContent, Typography, TextField, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import { isAddress } from "viem";

const Settings = ({ config, setConfig, buy }) => {
  const [router, setRouter] = useState("");
  const [token, setToken] = useState("");
  const [transactions, setTransactions] = useState(null);
  const [slippage, setSlippage] = useState();
  const [privateKey, setPrivateKey] = useState("");
  const [amounts, setAmounts] = useState([]);
  const [gaps, setGaps] = useState([]);

  useEffect(() => {
    setConfig((prev) => {
      const newConfig = {
        ...prev,
        router,
        token,
        amounts,
        gaps,
        transactions,
        privateKey,
        slippage: buy ? 0 : slippage,
      };
      return JSON.stringify(prev) !== JSON.stringify(newConfig) ? newConfig : prev;
    });
  }, [router, token, amounts, gaps, transactions, privateKey, slippage, buy]);


  return (
    <Card>

      <CardContent className="sidebar">
        <Typography variant="h6">Bot Settings </Typography>
        <Stack spacing={2} sx={{ mt: 2 }}>
          <TextField
            label="Router Address"
            variant="outlined"
            value={router}
            error={!!router && !isAddress(router)}
            helperText={!!router && !isAddress(router) ? "Invalid Ethereum address" : ""}
            onChange={(e) => {
              const value = e.target.value.replace(/\s/g, '')
              setRouter(value)
            }}
            fullWidth
            disabled={config.isRunning}
          />

          <TextField
            label="Token Address"
            variant="outlined"
            value={token}
            error={!!token && !isAddress(token)}
            helperText={!!token && !isAddress(token) ? "Invalid Ethereum address" : ""}
            onChange={(e) => {
              const value = e.target.value.replace(/\s/g, '')
              setToken(value)
            }}
            fullWidth
            disabled={config.isRunning}
          />


          {!buy && <TextField
            label="Slippage"
            type="number"

            value={slippage}
            onChange={(e) => {
              let value = Number(e.target.value);
              if (value < 0) value = 0;
              if (value > 100) value = 100;
              setSlippage(value);
            }}
            fullWidth
            disabled={config.isRunning}
          />}

          <TextField
            label={`Number of ${buy ? 'buys' : 'sells'}`}
            type="number"
            variant="outlined"
            value={transactions}
            onChange={(e) => setTransactions(parseInt(e.target.value) || 0)}
            fullWidth
            input={{ step: "1", inputMode: "numeric" }}
            disabled={config.isRunning}
          />

          <TextField
            label="Private Key"
            variant="outlined"
            value={privateKey}
            error={!!privateKey && !/^[0-9a-fA-F]{64}$/.test(privateKey)}
            helperText={!!privateKey && !/^[0-9a-fA-F]{64}$/.test(privateKey) ? "Invalid Private Key" : ""}
            onChange={(e) => {
              const value = e.target.value.replace(/\s/g, '')
              setPrivateKey(value)
            }}
            fullWidth
            disabled={config.isRunning}
          />

          {Array.from({ length: transactions || 0 }).map((_, i) => (
            <Stack key={i} spacing={1}>
              <TextField
                label={`Amount for Step ${i + 1}`}
                type="text"
                value={amounts[i] || ""}
                onChange={(e) => {
                  const inputValue = e.target.value;
                  if (!/^\d*\.?\d*$/.test(inputValue)) return; // Validate numeric input

                  const updated = [...amounts];
                  updated[i] = inputValue;
                  setAmounts(updated);
                }}
                fullWidth
                disabled={config.isRunning}
              />

              <TextField
                label={`Gap after Step ${i + 1} (sec)`}
                type="number"
                value={gaps[i] || ""}
                onChange={(e) => {
                  const updated = [...gaps];
                  updated[i] = parseInt(e.target.value) || 0;
                  setGaps(updated);
                }}
                fullWidth
                disabled={config.isRunning}
              />
            </Stack>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default Settings;
