import { Card, CardContent, Typography, TextField, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import { isAddress } from "viem";

const Settings = ({ config, setConfig }) => {
  const [router, setRouter] = useState("");
  const [token, setToken] = useState("");
  const [sellAmounts, setSellAmounts] = useState([]);
  const [buyAmounts, setBuyAmounts] = useState([]);
  const [buyGaps, setBuyGaps] = useState([]);
  const [sellGaps, setSellGaps] = useState([]);
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
      buyAmounts,
      sellAmounts,
      buyGaps,
      sellGaps
    }));
  }, [router, token, privateKey, slippage, buyTransactions, sellTransactions, buyAmounts, sellAmounts, buyGaps, sellGaps]);


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

          <TextField
            label="Number of buys"
            type="number"
            variant="outlined"
            value={buyTransactions}
            onChange={(e) => setBuyTransactions(parseInt(e.target.value) || 0)}
            fullWidth
            input={{ step: "1", inputMode: "numeric" }}
            disabled={config.isRunning}
          />

          {Array.from({ length: buyTransactions || 0 }).map((_, i) => (
            <Stack key={`buy-${i}`} spacing={1}>
              <TextField
                label={`Buy Amount for Step ${i + 1}`}
                type="text"
                value={buyAmounts[i] || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  if (!/^\d*\.?\d*$/.test(val)) return;
                  const updated = [...buyAmounts];
                  updated[i] = val;
                  setBuyAmounts(updated);
                }}
                fullWidth
                disabled={config.isRunning}
              />
              <TextField
                label={`Buy Gap after Step ${i + 1} (sec)`}
                type="number"
                value={buyGaps[i] || ""}
                onChange={(e) => {
                  const updated = [...buyGaps];
                  updated[i] = parseInt(e.target.value) || 0;
                  setBuyGaps(updated);
                }}
                fullWidth
                disabled={config.isRunning}
              />
            </Stack>
          ))}

          <TextField
            label="Number of sells"
            type="number"
            variant="outlined"
            value={sellTransactions}
            onChange={(e) => setSellTransactions(parseInt(e.target.value) || 0)}
            fullWidth
            input={{ step: "1", inputMode: "numeric" }}
            disabled={config.isRunning}
          />

          {Array.from({ length: sellTransactions || 0 }).map((_, i) => (
            <Stack key={`sell-${i}`} spacing={1}>
              <TextField
                label={`Sell Amount for Step ${i + 1}`}
                type="text"
                value={sellAmounts[i] || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  if (!/^\d*\.?\d*$/.test(val)) return;
                  const updated = [...sellAmounts];
                  updated[i] = val;
                  setSellAmounts(updated);
                }}
                fullWidth
                disabled={config.isRunning}
              />
              <TextField
                label={`Sell Gap after Step ${i + 1} (sec)`}
                type="number"
                value={sellGaps[i] || ""}
                onChange={(e) => {
                  const updated = [...sellGaps];
                  updated[i] = parseInt(e.target.value) || 0;
                  setSellGaps(updated);
                }}
                fullWidth
                disabled={config.isRunning}
              />
            </Stack>
          ))}

          <TextField
            label="Slippage"
            type="number"
            variant="outlined"
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
            label="Private Key"
            variant="outlined"
            value={privateKey}
            error={!!privateKey && !/^[0-9a-fA-F]{64}$/.test(privateKey)} // checks if it's a valid 64 hex chars string
            helperText={!!privateKey && !/^[0-9a-fA-F]{64}$/.test(privateKey) ? "Invalid Private Key" : ""}
            onChange={(e) => {
              const value = e.target.value.replace(/\s/g, '') // remove spaces
              setPrivateKey(value)
            }}
            fullWidth
            disabled={config.isRunning}
          />
        </Stack>
      </CardContent>
    </Card>
  );
};

export default Settings;
