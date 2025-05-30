import { Card, CardContent, Typography, TextField, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import { isAddress } from "viem";

const Settings = ({ config, setConfig, buy }) => {
  const [router, setRouter] = useState("");
  const [token, setToken] = useState("");
  const [transactions, setTransactions] = useState(null);
  const [slippage, setSlippage] = useState();
  const [privateKey, setPrivateKey] = useState("");

  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [minGap, setMinGap] = useState("");
  const [maxGap, setMaxGap] = useState("");

  useEffect(() => {
    setConfig((prev) => {
      const newConfig = {
        ...prev,
        router,
        token,
        minAmount,
        maxAmount,
        minGap,
        maxGap,
        transactions,
        privateKey,
        slippage: buy ? 0 : slippage,
      };
      return JSON.stringify(prev) !== JSON.stringify(newConfig) ? newConfig : prev;
    });
  }, [router, token, transactions, privateKey, slippage, minAmount, maxAmount, minGap, maxGap, buy]);


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
          <Typography variant="subtitle1">Amount Range (in Token)</Typography>
          <Stack direction="row" spacing={2}>
            <TextField
              label="Min"
              type="number"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
              disabled={config.isRunning}
              fullWidth
            />
            <TextField
              label="Max"
              type="number"
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
              disabled={config.isRunning}
              fullWidth
            />
          </Stack>

          <Typography variant="subtitle1">Gap Range (in seconds)</Typography>
          <Stack direction="row" spacing={2}>
            <TextField
              label="Min"
              type="number"
              value={minGap}
              onChange={(e) => setMinGap(e.target.value)}
              disabled={config.isRunning}
              fullWidth
            />
            <TextField
              label="Max"
              type="number"
              value={maxGap}
              onChange={(e) => setMaxGap(e.target.value)}
              disabled={config.isRunning}
              fullWidth
            />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default Settings;
