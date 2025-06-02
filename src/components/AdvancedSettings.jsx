import { Card, CardContent, Typography, TextField, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import { isAddress } from "viem";

const Settings = ({ config, setConfig }) => {
  const [router, setRouter] = useState("");
  const [token, setToken] = useState("");

  const [buyMinAmount, setBuyMinAmount] = useState("");
  const [buyMaxAmount, setBuyMaxAmount] = useState("");
  const [buyMinGap, setBuyMinGap] = useState("");
  const [buyMaxGap, setBuyMaxGap] = useState("");
  const [sellMinAmount, setSellMinAmount] = useState("");
  const [sellMaxAmount, setSellMaxAmount] = useState("");
  const [sellMinGap, setSellMinGap] = useState("");
  const [sellMaxGap, setSellMaxGap] = useState("");

  const [buyTransactions, setBuyTransactions] = useState(null);
  const [sellTransactions, setSellTransactions] = useState(null);
  const [slippage, setSlippage] = useState();
  const [privateKey, setPrivateKey] = useState("");

  useEffect(() => {
    setConfig((prev) => ({
      ...prev,
      router,
      token,
      privateKey,
      slippage,
      buyTransactions,
      sellTransactions,
      buyMinAmount,
      buyMaxAmount,
      buyMinGap,
      buyMaxGap,
      sellMinAmount,
      sellMaxAmount,
      sellMinGap,
      sellMaxGap
    }));
  }, [
    router, token, privateKey, slippage, buyTransactions, sellTransactions,
    buyMinAmount, buyMaxAmount, buyMinGap, buyMaxGap,
    sellMinAmount, sellMaxAmount, sellMinGap, sellMaxGap
  ]);

  return (
    <Card>
      <CardContent className="sidebar">
        <Typography variant="h6">Bot Settings</Typography>
        <Stack spacing={2} sx={{ mt: 2 }}>
          <TextField
            label="Router Address"
            variant="outlined"
            value={router}
            error={!!router && !isAddress(router)}
            helperText={!!router && !isAddress(router) ? "Invalid Ethereum address" : ""}
            onChange={(e) => setRouter(e.target.value.replace(/\s/g, ''))}
            fullWidth
            disabled={config.isRunning}
          />

          <TextField
            label="Token Address"
            variant="outlined"
            value={token}
            error={!!token && !isAddress(token)}
            helperText={!!token && !isAddress(token) ? "Invalid Ethereum address" : ""}
            onChange={(e) => setToken(e.target.value.replace(/\s/g, ''))}
            fullWidth
            disabled={config.isRunning}
          />

          <TextField
            label="Number of buys"
            type="number"
            value={buyTransactions}
            onChange={(e) => setBuyTransactions(parseInt(e.target.value) || 0)}
            fullWidth
            disabled={config.isRunning}
          />

          <TextField
            label="Buy Min Amount"
            type="text"
            value={buyMinAmount}
            onChange={(e) => setBuyMinAmount(e.target.value)}
            fullWidth
            disabled={config.isRunning}
          />

          <TextField
            label="Buy Max Amount"
            type="text"
            value={buyMaxAmount}
            onChange={(e) => setBuyMaxAmount(e.target.value)}
            fullWidth
            disabled={config.isRunning}
          />

          <TextField
            label="Buy Min Gap (sec)"
            type="number"
            value={buyMinGap}
            onChange={(e) => setBuyMinGap(e.target.value)}
            fullWidth
            disabled={config.isRunning}
          />

          <TextField
            label="Buy Max Gap (sec)"
            type="number"
            value={buyMaxGap}
            onChange={(e) => setBuyMaxGap(e.target.value)}
            fullWidth
            disabled={config.isRunning}
          />

          <TextField
            label="Number of sells"
            type="number"
            value={sellTransactions}
            onChange={(e) => setSellTransactions(parseInt(e.target.value) || 0)}
            fullWidth
            disabled={config.isRunning}
          />

          <TextField
            label="Sell Min Amount"
            type="text"
            value={sellMinAmount}
            onChange={(e) => setSellMinAmount(e.target.value)}
            fullWidth
            disabled={config.isRunning}
          />

          <TextField
            label="Sell Max Amount"
            type="text"
            value={sellMaxAmount}
            onChange={(e) => setSellMaxAmount(e.target.value)}
            fullWidth
            disabled={config.isRunning}
          />

          <TextField
            label="Sell Min Gap (sec)"
            type="number"
            value={sellMinGap}
            onChange={(e) => setSellMinGap(e.target.value)}
            fullWidth
            disabled={config.isRunning}
          />

          <TextField
            label="Sell Max Gap (sec)"
            type="number"
            value={sellMaxGap}
            onChange={(e) => setSellMaxGap(e.target.value)}
            fullWidth
            disabled={config.isRunning}
          />

          <TextField
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
          />

          <TextField
            label="Private Key (without 0x)"
            value={privateKey}
            error={!!privateKey && !/^[0-9a-fA-F]{64}$/.test(privateKey)}
            helperText={!!privateKey && !/^[0-9a-fA-F]{64}$/.test(privateKey) ? "Invalid Private Key" : ""}
            onChange={(e) => setPrivateKey(e.target.value.replace(/\s/g, ''))}
            fullWidth
            disabled={config.isRunning}
          />
        </Stack>
      </CardContent>
    </Card>
  );
};

export default Settings;
