import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [depositAmount, setDepositAmount] = useState(1); // default deposit amount
  const [withdrawAmount, setWithdrawAmount] = useState(1); // default withdraw amount
  const [error, setError] = useState(null);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const accounts = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(accounts);
    }
  };

  const handleAccount = (accounts) => {
    const account = accounts[0];
    if (account) {
      console.log("Account connected: ", account);
      setAccount(account);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts);

    // once wallet is set we can get a reference to our deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      setBalance((await atm.getBalance()).toNumber());
    }
  };

  const deposit = async () => {
    if (atm) {
      try {
        let tx = await atm.deposit(depositAmount);
        await tx.wait();
        getBalance();
        // Clear any previous error if the deposit is successful
        setError(null);
      } catch (error) {
        setError(`Deposit failed: Add more`);
      }
    }
  };

  const withdraw = async () => {
    if (atm) {
      try {
        let tx = await atm.withdraw(withdrawAmount);
        await tx.wait();
        getBalance();
        // Clear any previous error if the withdrawal is successful
        setError(null);
      } catch (error) {
        if (error.reason) {
          setError(`Withdrawal failed: ${error.reason}`);
        } else {
          setError(`Withdrawal failed: ${error.message}`);
        }
      }
    }
  };

  const initUser = () => {
    // Check to see if user has Metamask
    if (!ethWallet) {
      return <p>Please install Metamask to use this ATM.</p>;
    }

    // Check to see if the user is connected. If not, connect to their account
    if (!account) {
      return <button onClick={connectAccount}>Connect your Metamask wallet</button>;
    }

    if (balance === undefined) {
      getBalance();
    }

    return (
      <div>
        <p style={{ fontFamily: "Arial", fontSize: "72px", fontWeight: "bold" }}>Koki's ATM</p>
        <div style={{ backgroundColor: "brown", padding: "10px", borderRadius: "5px", margin: "10px" }}>
          <label style={{ color: "white", marginRight: "10px" }}>
            Deposit Amount:
            <input
              type="number"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
            />
          </label>
          <button onClick={() => setDepositAmount(1)}>1</button>
          <button onClick={() => setDepositAmount(5)}>5</button>
          <button onClick={() => setDepositAmount(10)}>10</button>
          <button onClick={deposit}>Deposit</button>
        </div>
        <div style={{ backgroundColor: "brown", padding: "10px", borderRadius: "5px", margin: "10px" }}>
          <label style={{ color: "white", marginRight: "10px" }}>
            Withdraw Amount:
            <input
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
            />
          </label>
          <button onClick={() => setWithdrawAmount(1)}>1</button>
          <button onClick={() => setWithdrawAmount(5)}>5</button>
          <button onClick={() => setWithdrawAmount(10)}>10</button>
          <button onClick={withdraw}>Withdraw</button>
        </div>
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance}</p>
        {/* Display error message if there is one */}
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container">
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center;
        }
      `}</style>
    </main>
  );
}
