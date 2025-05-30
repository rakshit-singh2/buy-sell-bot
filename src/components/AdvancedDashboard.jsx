import {
  Card, CardContent, Typography, Button, Stack, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper,
  Link
} from "@mui/material";
import { useEffect, useState } from "react";
import { createWalletClient, createPublicClient, http, formatEther, getContract, parseUnits, encodeFunctionData } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import routerAbi from "../helpers/router.json";
import tokenAbi from "../helpers/token.json";
import { useAppSelector } from "../redux/store";

const createData = (count, bnbBalance, expectedRequirement, buyAmount, buyGap, sellAmount, sellGap, buyHash, tokenBalance, approveHash, sellHash, expectedBnb, minBnb, status, error) => {
  return { count, bnbBalance, expectedRequirement, buyAmount, buyGap, sellAmount, sellGap, buyHash, tokenBalance, approveHash, sellHash, expectedBnb, minBnb, status, error };
};


const Dashboard = ({ config, setConfig }) => {
  const chainDetails = useAppSelector((state) => state.chain.chainDetails);
  const [isRunning, setIsRunning] = useState(false);
  const [walletBalance, setWalletBalance] = useState('');
  const [tokenBalance, setTokenBalance] = useState('');

  useEffect(() => {
    setConfig((prev) => ({
      ...prev,
      isRunning
    }));
  }, [isRunning]);

  const [rows, setRows] = useState([]);

  useEffect(() => {
    setRows(
      Array.from({ length: Math.max(config.buyTransactions ?? 0, config.sellTransactions ?? 0) }, (_, i) => createData("Cycle " + (parseInt(i) + 1), "", "", "", "", "", "", "", "", "", "", "", "", ""))
    );
  }, [config.buyTransactions, config.sellTransactions]);

  const getRandomInRange = (min, max) => {
    const minNum = parseFloat(min);
    const maxNum = parseFloat(max);
    return (Math.random() * (maxNum - minNum) + minNum).toFixed(6);
  };

  const handleStartBot = async () => {
    setIsRunning(true);
    let i = 0;

    try {
      if (typeof config.privateKey !== "string") {
        console.error("Invalid private key format:", config.privateKey);
        return;
      }

      const walletClient = createWalletClient({
        chain: chainDetails.chain,
        transport: http(chainDetails.rpcUrl)
      });

      const publicClient = createPublicClient({
        chain: chainDetails.chain,
        transport: http(chainDetails.rpcUrl)
      });

      const router = getContract({
        address: config.router,
        abi: routerAbi,
        client: publicClient
      });

      const WBNB = await router.read.WETH();

      const tokenDecimal = await publicClient.readContract({
        address: config.token,
        abi: tokenAbi,
        functionName: "decimals",
      });

      const tokenSymbol = await publicClient.readContract({
        address: config.token,
        abi: tokenAbi,
        functionName: "symbol",
      });

      const account = privateKeyToAccount("0x" + config.privateKey.trim());

      const cycles = Math.max(config.buyTransactions, config.sellTransactions);
      let buyCount = config.buyTransactions;
      let sellCount = config.sellTransactions;

      for (i = 0; i < cycles; i++) {
        try {
          // --- BUY ---
          if (buyCount > 0) {
            const buyAmount = getRandomInRange(config.buyMinAmount, config.buyMaxAmount);
            const buyGap = getRandomInRange(config.buyMinGap, config.buyMaxGap);

            rows[i].buyAmount = buyAmount;
            rows[i].buyGap = buyGap;

            const currentBalance = await publicClient.getBalance({ address: account.address });
            rows[i].bnbBalance = `${formatEther(currentBalance)} BNB`;
            setWalletBalance(`Balance: ${formatEther(currentBalance)} BNB`);

            const amountsIn = await router.read.getAmountsIn([
              parseUnits(buyAmount, tokenDecimal),
              [WBNB, config.token]
            ]);
            const requiredBNB = amountsIn[0];

            rows[i].expectedRequirement = `${formatEther(requiredBNB)} BNB`;

            if (currentBalance < requiredBNB) {
              rows[i].error = "Insufficient BNB for buy";
              break;
            }

            const buyTxData = encodeFunctionData({
              abi: routerAbi,
              functionName: "swapExactETHForTokensSupportingFeeOnTransferTokens",
              args: [
                parseUnits(buyAmount, tokenDecimal),
                [WBNB, config.token],
                account.address,
                Math.floor(Date.now() / 1000) + 60 * 5
              ]
            });

            const buyTxHash = await walletClient.sendTransaction({
              account,
              to: config.router,
              value: requiredBNB,
              gas: 300000,
              data: buyTxData
            });

            rows[i].buyHash = buyTxHash;
            await publicClient.waitForTransactionReceipt({ hash: buyTxHash });
            buyCount--;

            await new Promise(resolve => setTimeout(resolve, Number(buyGap) * 1000));
          }

          // --- SELL ---
          if (sellCount > 0) {
            const sellAmount = getRandomInRange(config.sellMinAmount, config.sellMaxAmount);
            const sellGap = getRandomInRange(config.sellMinGap, config.sellMaxGap);

            rows[i].sellAmount = sellAmount;
            rows[i].sellGap = sellGap;

            const tokenBal = await publicClient.readContract({
              address: config.token,
              abi: tokenAbi,
              functionName: "balanceOf",
              args: [account.address]
            });

            rows[i].tokenBalance = `${formatEther(tokenBal)} ${tokenSymbol}`;
            setTokenBalance(`Token Balance: ${formatEther(tokenBal)} ${tokenSymbol}`);

            const approveTxHash = await walletClient.writeContract({
              account,
              address: config.token,
              abi: tokenAbi,
              functionName: "approve",
              args: [
                config.router,
                parseUnits(sellAmount, tokenDecimal)
              ]
            });

            rows[i].approveHash = approveTxHash;
            await publicClient.waitForTransactionReceipt({ hash: approveTxHash });

            const amountsOut = await router.read.getAmountsOut([
              parseUnits(sellAmount, tokenDecimal),
              [config.token, WBNB]
            ]);
            const expectedBNB = amountsOut[1];
            const minBNB = expectedBNB - (expectedBNB * BigInt(Math.floor(config.slippage * 100)) / BigInt(100));

            rows[i].expectedBnb = `${formatEther(expectedBNB)} BNB`;
            rows[i].minBnb = `${formatEther(minBNB)} BNB`;

            const sellTxData = encodeFunctionData({
              abi: routerAbi,
              functionName: "swapExactTokensForETHSupportingFeeOnTransferTokens",
              args: [
                parseUnits(sellAmount, tokenDecimal),
                minBNB,
                [config.token, WBNB],
                account.address,
                Math.floor(Date.now() / 1000) + 60 * 5
              ]
            });

            const sellHash = await walletClient.sendTransaction({
              account,
              to: config.router,
              gas: 300000,
              data: sellTxData
            });

            rows[i].sellHash = sellHash;
            await publicClient.waitForTransactionReceipt({ hash: sellHash });
            sellCount--;

            await new Promise(resolve => setTimeout(resolve, Number(sellGap) * 1000));
          }

          rows[i].error = "None";
          rows[i].status = "Success";

        } catch (error) {
          console.error(`Error in cycle ${i + 1}:`, error);
          rows[i].error = error?.shortMessage || error?.message || "Unknown error";
          rows[i].status = "Failed";
          break;
        }
      }
    } catch (error) {
      console.error("Fatal Error:", error);
      alert("Error executing trade: " + (error.shortMessage || error.message));
      if (rows?.[i]) {
        rows[i].error = JSON.stringify(error) || "Unknown error";
        rows[i].status = "Failed";
      }
    } finally {
      setIsRunning(false);
    }
  };


  const handleStopBot = () => {
    setIsRunning(false);
  };

  return (
    <Card className="dasborard">
      <CardContent>
        <Typography variant="h5">Trading Bot Dashboard</Typography>
        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          <Button variant="contained" color="success" onClick={handleStartBot} disabled={isRunning}>
            Start Bot
          </Button>
          <Button variant="contained" color="error" onClick={handleStopBot} disabled={!isRunning}>
            Stop Bot
          </Button>
        </Stack>


        <Typography variant="h6" sx={{ mt: 4 }}>{walletBalance}</Typography>
        <Typography variant="h6" sx={{ mt: 4 }}>{tokenBalance}</Typography>
        <Typography variant="h6" sx={{ mt: 4 }}>Transaction Records</Typography>
        <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
          <Table size="medium" aria-label="transaction table">
            <TableHead>
              <TableRow>
                <TableCell align="left" sx={{ width: "80px", minWidth: "80px", maxWidth: "80px", fontSize: "1.5rem", fontWeight: "bold" }}>S.No.</TableCell>
                <TableCell sx={{ fontSize: "1.5rem", fontWeight: "bold" }}>Pre-Transaction BNB Balance</TableCell>
                <TableCell sx={{ fontSize: "1.5rem", fontWeight: "bold" }}>Buy Amount</TableCell>
                <TableCell sx={{ fontSize: "1.5rem", fontWeight: "bold" }}>Buy Gap</TableCell>
                <TableCell sx={{ fontSize: "1.5rem", fontWeight: "bold" }}>Sell Amount</TableCell>
                <TableCell sx={{ fontSize: "1.5rem", fontWeight: "bold" }}>Sell Gap</TableCell>
                <TableCell sx={{ fontSize: "1.5rem", fontWeight: "bold" }}>Buy Hash</TableCell>
                <TableCell sx={{ fontSize: "1.5rem", fontWeight: "bold" }}>Pre-Transaction Token Balance</TableCell>
                <TableCell sx={{ fontSize: "1.5rem", fontWeight: "bold" }}>Approve Hash</TableCell>
                <TableCell sx={{ fontSize: "1.5rem", fontWeight: "bold" }}>Expected BNB</TableCell>
                <TableCell sx={{ fontSize: "1.5rem", fontWeight: "bold" }}>Min BNB</TableCell>
                <TableCell sx={{ fontSize: "1.5rem", fontWeight: "bold" }}>Sell Hash</TableCell>
                <TableCell sx={{ fontSize: "1.5rem", fontWeight: "bold" }}>Status</TableCell>
                <TableCell sx={{ fontSize: "1.5rem", fontWeight: "bold" }}>Error</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, index) => (
                <TableRow key={index}>
                  <TableCell align="left" sx={{ width: "80px", minWidth: "80px", maxWidth: "80px", fontSize: "1.4rem" }}>{row.count}</TableCell>
                  <TableCell sx={{ fontSize: "1.4rem" }}>{row.bnbBalance}</TableCell>
                  <TableCell sx={{ fontSize: "1.4rem" }}>{row.buyAmount}</TableCell>
                  <TableCell sx={{ fontSize: "1.4rem" }}>{row.buyGap}</TableCell>
                  <TableCell sx={{ fontSize: "1.4rem" }}>{row.sellAmount}</TableCell>
                  <TableCell sx={{ fontSize: "1.4rem" }}>{row.sellGap}</TableCell>
                  <TableCell sx={{ fontSize: "1.4rem" }}>
                    <Link
                      href={`${chainDetails.chain.blockExplorers.default.url}/tx/${row.buyHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: "none", color: "#1976d2" }}
                    >
                      {`${row.buyHash.slice(0, 6)}...${row.buyHash.slice(-4)}`}
                    </Link>
                  </TableCell>

                  <TableCell sx={{ fontSize: "1.4rem" }}>{row.tokenBalance}</TableCell>
                  <TableCell sx={{ fontSize: "1.4rem" }}>
                    <Link
                      href={`${chainDetails.chain.blockExplorers.default.url}/tx/${row.buyHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: "none", color: "#1976d2", }}
                    >
                      {`${row?.approveHash?.slice(0, 6)}...${row?.approveHash?.slice(-4)}`}
                    </Link>
                  </TableCell>
                  <TableCell sx={{ fontSize: "1.4rem" }}>{row.expectedBnb}</TableCell>
                  <TableCell sx={{ fontSize: "1.4rem" }}>{row.minBnb}</TableCell>
                  <TableCell sx={{ fontSize: "1.4rem" }}>
                    <Link
                      href={`${chainDetails.chain.blockExplorers.default.url}/tx/${row.sellHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: "none", color: "#1976d2", }}
                    >
                      {`${row.sellHash.slice(0, 6)}...${row.sellHash.slice(-4)}`}
                    </Link>
                  </TableCell>
                  <TableCell sx={{ color: row.status === "Success" ? "success.main" : "error.main", fontSize: "1.4rem" }}>
                    {row.status}
                  </TableCell>
                  <TableCell sx={{ fontSize: "1.4rem" }}>{row.error}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default Dashboard;
