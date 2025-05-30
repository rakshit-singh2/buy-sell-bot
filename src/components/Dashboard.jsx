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

const createBuyData = (count, bnbBalance, expectedRequirement, amount, gap, buyHash, status, error) => {
  return { count, bnbBalance, expectedRequirement, amount, gap, buyHash, status, error };
};

const createSellData = (count, tokenBalance, bnbBalance, amount, gap, approveHash, sellHash, expectedBnb, minBnb, status, error) => {
  return { count, tokenBalance, bnbBalance, approveHash, amount, gap, sellHash, expectedBnb, minBnb, status, error };
};


const Dashboard = ({ config, setConfig, buy }) => {
  const chainDetails = useAppSelector((state) => state.chain);
  const [isRunning, setIsRunning] = useState(false);
  const [walletBalance, setWalletBalance] = useState('');
  const [tokenBalance, setTokenBalance] = useState('');
  const [allowance, setaAllowance] = useState('');

  useEffect(() => {
    setConfig((prev) => ({
      ...prev,
      isRunning
    }));
  }, [isRunning]);

  const [rows, setRows] = useState([]);

  useEffect(() => {
    setRows(
      buy
        ? Array.from({ length: config.transactions ?? 0 }, (_, i) => createBuyData(i + 1, "", "", "", "", ""))
        : Array.from({ length: config.transactions ?? 0 }, (_, i) => createSellData(i + 1, "", "", "", "", "", "", "", ""))
    );
  }, [buy, config.transactions]);

  const handleStartBot = async () => {
    setIsRunning(true);

    if (typeof config.privateKey !== "string") {
      console.error("Invalid private key format:", config.privateKey);
      return;
    }

    const account = privateKeyToAccount("0x" + config.privateKey.trim());

    const walletClient = createWalletClient({
      chain: chainDetails.chain,
      transport: http(chainDetails.chainDetails.rpcUrl),
    });

    const publicClient = createPublicClient({
      chain: chainDetails.chain,
      transport: http(chainDetails.chainDetails.rpcUrl),
    });

    const router = getContract({
      address: config.router,
      abi: routerAbi,
      client: publicClient,
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


    if (buy) {
      for (let i = 0; i < config.transactions; i++) {
        try {
          const amountForStep = (
            Math.random() * (parseFloat(config.maxAmount) - parseFloat(config.minAmount)) +
            parseFloat(config.minAmount)
          ).toFixed(6);

          const gapForStep = Math.floor(
            Math.random() * (parseInt(config.maxGap) - parseInt(config.minGap)) +
            parseInt(config.minGap)
          );

          rows[i].amount = amountForStep;
          rows[i].gap = gapForStep;

          if (i !== 0) {
            await new Promise((resolve) => setTimeout(resolve, gapForStep * 1000));
          }

          const currentBalance = await publicClient.getBalance({ address: account.address });
          rows[i].bnbBalance = `${formatEther(currentBalance)} BNB`;
          setWalletBalance(`Balance: ${formatEther(currentBalance)} BNB`);

          const amountsIn = await router.read.getAmountsIn([
            parseUnits(amountForStep.toString(), tokenDecimal),
            [WBNB, config.token],
          ]);
          const requiredBNB = amountsIn[0];
          rows[i].expectedRequirement = `${formatEther(requiredBNB)} BNB`;

          if (currentBalance < requiredBNB) {
            alert("Insufficient balance, stopping purchases.");
            rows[i].error = "Insufficient balance, stopping purchases.";
            break;
          }

          const txData = encodeFunctionData({
            abi: routerAbi,
            functionName: "swapExactETHForTokensSupportingFeeOnTransferTokens",
            args: [
              parseUnits(amountForStep.toString(), tokenDecimal),
              [WBNB, config.token],
              account.address,
              Math.floor(Date.now() / 1000) + 60 * 5,
            ],
          });

          const txHash = await walletClient.sendTransaction({
            account,
            to: config.router,
            value: requiredBNB,
            gas: 300000,
            data: txData,
          });

          rows[i].buyHash = txHash;
          await publicClient.waitForTransactionReceipt({ hash: txHash });
          rows[i].error = "None";
          rows[i].status = "Success";
        } catch (error) {
          console.error({ error });
          alert("Error executing trade: " + (error?.shortMessage || error.message));
          rows[i].error = error?.shortMessage || error.message;
          rows[i].status = "Failed";
          setIsRunning(false);
          break;
        }
      }
    }

    else {
      try {
        const sellAmounts = Array.from({ length: config.transactions }).map(() =>
          parseFloat(
            (
              Math.random() * (parseFloat(config.maxAmount) - parseFloat(config.minAmount)) +
              parseFloat(config.minAmount)
            ).toFixed(6)
          )
        );

        const totalSellAmount = sellAmounts.reduce((sum, val) => sum + val, 0);

        const tokenBalance = await publicClient.readContract({
          address: config.token,
          abi: tokenAbi,
          functionName: "balanceOf",
          args: [account.address],
        });

        if (parseFloat(formatEther(tokenBalance)) < totalSellAmount) {
          setaAllowance("Insufficient token balance for the required number of sells, stopping sale.");
          return;
        }

        const approveTxHash = await walletClient.writeContract({
          account,
          address: config.token,
          abi: tokenAbi,
          functionName: "approve",
          args: [
            config.router,
            parseUnits(totalSellAmount.toString(), tokenDecimal),
          ],
        });

        await publicClient.waitForTransactionReceipt({ hash: approveTxHash });

        const allowance = await publicClient.readContract({
          address: config.token,
          abi: tokenAbi,
          functionName: "allowance",
          args: [account.address, config.router],
        });

        if (parseFloat(formatEther(allowance)) < totalSellAmount) {
          alert("Allowance is insufficient, stopping sale.");
          return;
        }

        for (let i = 0; i < config.transactions; i++) {
          try {
            const amountForStep = sellAmounts[i];
            const gapForStep = Math.floor(
              Math.random() * (parseInt(config.maxGap) - parseInt(config.minGap)) +
              parseInt(config.minGap)
            );
            rows[i].amount = sellAmounts[i];
            rows[i].gap = gapForStep;
            if (i !== 0) {
              await new Promise((resolve) => setTimeout(resolve, gapForStep * 1000));
            }

            const currentBalance = await publicClient.getBalance({ address: account.address });
            rows[i].bnbBalance = `${formatEther(currentBalance)} BNB`;
            setWalletBalance(`Balance: ${formatEther(currentBalance)} BNB`);

            const tokenBal = await publicClient.readContract({
              address: config.token,
              abi: tokenAbi,
              functionName: "balanceOf",
              args: [account.address],
            });

            rows[i].tokenBalance = `${formatEther(tokenBal)} ${tokenSymbol}`;
            setTokenBalance(`Token Balance: ${formatEther(tokenBal)} ${tokenSymbol}`);

            rows[i].approveHash = approveTxHash;

            const amountsOut = await router.read.getAmountsOut([
              parseUnits(amountForStep.toString(), tokenDecimal),
              [config.token, WBNB],
            ]);

            const expectedBNB = amountsOut[1];
            const minBNBOut =
              expectedBNB -
              (expectedBNB * BigInt(Math.floor(config.slippage * 100))) / BigInt(100);

            rows[i].expectedBnb = `${formatEther(expectedBNB)} BNB`;
            rows[i].minBnb = `${formatEther(minBNBOut)} BNB`;

            const txData = encodeFunctionData({
              abi: routerAbi,
              functionName: "swapExactTokensForETHSupportingFeeOnTransferTokens",
              args: [
                parseUnits(amountForStep.toString(), tokenDecimal),
                minBNBOut,
                [config.token, WBNB],
                account.address,
                Math.floor(Date.now() / 1000) + 60 * 5,
              ],
            });

            const txHash = await walletClient.sendTransaction({
              account,
              to: config.router,
              data: txData,
              gas: 300000,
            });

            rows[i].sellHash = txHash;
            await publicClient.waitForTransactionReceipt({ hash: txHash });
            rows[i].error = "None";
            rows[i].status = "Success";
          } catch (error) {
            console.error({ error });
            alert("Error executing trade: " + (error?.shortMessage || error.message));
            rows[i].error = error?.shortMessage || error.message;
            rows[i].status = "Failed";
            setIsRunning(false);
            break;
          }
        }
      } catch (error) {
        console.error({ error });
        alert("Setup error: " + (error?.shortMessage || error.message));
        setIsRunning(false);
      }
      setIsRunning(false);
    }

    setIsRunning(false);
  };


  const handleStopBot = () => {
    setIsRunning(false);
  };

  return (
    <Card className="dasborard">
      <CardContent>
        <Typography variant="h5">Trading Bot Dashboard</Typography>
        <Typography>Total Transactions: {config.transactions}</Typography>
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
              <TableRow >
                <TableCell align="left" sx={{ width: "80px", minWidth: "80px", maxWidth: "80px", fontSize: "1.5rem", fontWeight: "bold" }}>S.No.</TableCell>
                <TableCell sx={{ fontSize: "1.5rem", fontWeight: "bold" }} >Pre-Transaction BNB Balance</TableCell>
                <TableCell sx={{ fontSize: "1.5rem", fontWeight: "bold" }} >Amount</TableCell>
                <TableCell sx={{ fontSize: "1.5rem", fontWeight: "bold" }} >Gap</TableCell>
                {buy ? (
                  <>
                    <TableCell sx={{ fontSize: "1.5rem", fontWeight: "bold" }}>Buy Hash</TableCell>
                    <TableCell sx={{ fontSize: "1.5rem", fontWeight: "bold" }}>Status</TableCell>
                    <TableCell sx={{ fontSize: "1.5rem", fontWeight: "bold" }}>Error</TableCell>
                  </>
                ) : (
                  <>
                    <TableCell sx={{ fontSize: "1.5rem", fontWeight: "bold" }}>Pre-Transaction Token Balance</TableCell>
                    <TableCell sx={{ fontSize: "1.5rem", fontWeight: "bold" }}>Approve Hash</TableCell>
                    <TableCell sx={{ fontSize: "1.5rem", fontWeight: "bold" }}>Sell Hash</TableCell>
                    <TableCell sx={{ fontSize: "1.5rem", fontWeight: "bold" }}>Expected BNB</TableCell>
                    <TableCell sx={{ fontSize: "1.5rem", fontWeight: "bold" }}>Min BNB</TableCell>
                    <TableCell sx={{ fontSize: "1.5rem", fontWeight: "bold" }}>Status</TableCell>
                    <TableCell sx={{ fontSize: "1.5rem", fontWeight: "bold" }}>Error</TableCell>
                  </>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, index) => (
                <TableRow key={index}>
                  <TableCell align="left" sx={{ width: "80px", minWidth: "80px", maxWidth: "80px", fontSize: "1.4rem" }}>{row.count}</TableCell>
                  <TableCell sx={{ fontSize: "1.4rem" }}>{row.bnbBalance}</TableCell>
                  <TableCell sx={{ fontSize: "1.4rem" }}>{row.amount}</TableCell>
                  <TableCell sx={{ fontSize: "1.4rem" }}>{row.gap}</TableCell>
                  {buy ? (
                    <>
                      <TableCell sx={{ fontSize: "1.4rem" }}>
                        <Link
                          href={`${chainDetails.chainDetails.chain.blockExplorers.default.url}/tx/${row?.buyHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ textDecoration: "none", color: "#1976d2" }}
                        >
                          {`${row.buyHash?.slice(0, 6)}...${row.buyHash?.slice(-4)}`}
                        </Link>
                      </TableCell>
                      <TableCell sx={{ color: row.status === "Success" ? "success.main" : "error.main", fontSize: "1.4rem" }}>
                        {row.status}
                      </TableCell>
                      <TableCell sx={{ fontSize: "1.4rem" }}>{row.error}</TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell sx={{ fontSize: "1.4rem" }}>{row.tokenBalance}</TableCell>
                      <TableCell sx={{ fontSize: "1.4rem" }}>
                        <Link
                          href={`${chainDetails.chainDetails.chain.blockExplorers.default.url}/tx/${row?.approveHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ textDecoration: "none", color: "#1976d2" }}
                        >
                          {`${row?.approveHash?.slice(0, 6)}...${row?.approveHash?.slice(-4)}`}
                        </Link>
                      </TableCell>
                      <TableCell sx={{ fontSize: "1.4rem" }}>
                        <Link
                          href={`${chainDetails.chainDetails.chain.blockExplorers.default.url}/tx/${row?.sellHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ textDecoration: "none", color: "#1976d2", fontWeight: "bold" }}
                        >
                          {`${row?.sellHash?.slice(0, 6)}...${row?.sellHash?.slice(-4)}`}
                        </Link>
                      </TableCell>
                      <TableCell sx={{ fontSize: "1.4rem" }}>{row?.expectedBnb}</TableCell>
                      <TableCell sx={{ fontSize: "1.4rem" }}>{row?.minBnb}</TableCell>
                      <TableCell sx={{ color: row.status === "Success" ? "success.main" : "error.main", fontSize: "1.4rem" }}>
                        {row.status}
                      </TableCell>
                      <TableCell sx={{ fontSize: "1.4rem" }}>{row.error}</TableCell>
                    </>
                  )}
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
