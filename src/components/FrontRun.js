import React, { useState, useEffect } from "react";
import { Button, FormControl } from "react-bootstrap";
import "./Display.css";
import { MDBDataTable } from "mdbreact";
import { w3cwebsocket as W3CWebSocket } from "websocket";
import { startFront, stopFront, getFrontStatus, listFront } from "./api";
import CONFIG from "./constant/config";

const FrontRun = () => {
  const client = new W3CWebSocket("ws://localhost:8080/connect");

  var transactionItems = [];

  const [isRunning, setIsRunning] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [nodeUrl, setNodeUrl] = useState("");
  const [inAmount, setInAmount] = useState("");
  const [inAmountPercent, setInAmountPercent] = useState("");
  const [minBNB, setMinBNB] = useState("");
  const [maxBNB, setMaxBNB] = useState("");
  const [transactions, setTransactions] = useState([]);

  var rows = transactions.map((item) => {
    item.transaction = (
      <a href={CONFIG.EXPLORER + item.transaction} target="_blank">
        {item.transaction}
      </a>
    );

    return item;
  });

  const data = {
    columns: [
      {
        label: "TimeStamp",
        field: "timestamp",
      },

      {
        label: "Token",
        field: "token",
      },
      {
        label: "Buy/Sell",
        field: "action",
      },
      // {
      //   label: "Price",
      //   field: "price",
      // },

      {
        label: "Transaction",
        field: "transaction",
      },
    ],
    rows: rows,
  };

  const start = () => {
    if (
      nodeUrl == "" ||
      walletAddress == "" ||
      privateKey == "" ||
      inAmount == "" ||
      inAmountPercent == "" ||
      minBNB == "" ||
      maxBNB == ""
    ) {
      alert("please input all information to start wallet tracking !");
    } else {
      setIsRunning(true);
      startFront(
        nodeUrl,
        walletAddress,
        privateKey,
        inAmount,
        inAmountPercent,
        minBNB,
        maxBNB
      );
    }
  };

  const stop = () => {
    setIsRunning(false);
    stopFront();
  };

  const loadSetting = (status) => {
    setWalletAddress(status.wallet);
    setPrivateKey(status.key);
    setNodeUrl(status.node);
    setInAmount(status.amount);
    setInAmountPercent(status.percent);
    setMinBNB(status.minbnb);
    setMaxBNB(status.maxbnb);
  };

  const setStatus = async () => {
    var curStatus = await getFrontStatus();
    loadSetting(curStatus);
    if (curStatus.status === "1") setIsRunning(true);
    else setIsRunning(false);
  };

  const listTransactions = async () => {
    transactionItems = await listFront();
    setTransactions(transactionItems);
  };

  useEffect(() => {
    setStatus();
    listTransactions();
    client.onopen = () => {
      console.log("WebSocket Client Connected");
    };
    client.onmessage = (message) => {
      if (message.data.includes("front")) listTransactions();
      if (message.data.includes("setting")) {
        setStatus();
        listTransactions();
      }
    };
  }, []);

  return (
    <div>
      <div className="row">
        <div className="col-sm-12 col-md-6 col-lg-6">
          <div className="form-group">
            <label htmlFor="usr">Wallet Address:</label>
            <FormControl
              type="text"
              id="walletAddr"
              value={walletAddress}
              onChange={(e) => {
                setWalletAddress(e.target.value);
              }}
              className="form-control form-control-md"
            />
          </div>

          <div className="form-group">
            <label htmlFor="wssURL">Quick Node WSS URL:</label>
            <FormControl
              type="text"
              id="nodeUrl"
              value={nodeUrl}
              onChange={(e) => {
                setNodeUrl(e.target.value);
              }}
              className="form-control form-control-md"
            />
          </div>
        </div>
        <div className="col-sm-12 col-md-6 col-lg-6">
          <div className="form-group">
            <label htmlFor="pwd">Private Key:</label>
            <FormControl
              type="password"
              id="privateKey"
              value={privateKey}
              onChange={(e) => {
                setPrivateKey(e.target.value);
              }}
              className="form-control form-control-md"
            />
          </div>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="pwd">*Percent Amount:</label>
        <input
          type="number"
          id="inAmountPercent"
          className="short-input"
          value={inAmountPercent}
          onChange={(e) => {
            setInAmountPercent(e.target.value);
          }}
        />

        <label htmlFor="pwd">Fixed Amount:</label>
        <input
          type="number"
          id="inAmount"
          className="short-input"
          value={inAmount}
          onChange={(e) => {
            setInAmount(e.target.value);
          }}
        />

        <label htmlFor="pwd">Min Eth to follow:</label>
        <input
          type="number"
          id="minBNB"
          className="short-input"
          value={minBNB}
          onChange={(e) => {
            setMinBNB(e.target.value);
          }}
        />

        <label htmlFor="pwd">Max Eth to follow:</label>
        <input
          type="number"
          id="maxBNB"
          className="short-input"
          value={maxBNB}
          onChange={(e) => {
            setMaxBNB(e.target.value);
          }}
        />

        <Button
          variant={isRunning ? "danger" : "primary"}
          id="button-addon2"
          onClick={isRunning ? () => stop() : () => start()}
        >
          {isRunning ? "Stop Bot" : "Start Bot"}
        </Button>
      </div>

      <MDBDataTable hover cursor data={data} />
    </div>
  );
};

export default FrontRun;
