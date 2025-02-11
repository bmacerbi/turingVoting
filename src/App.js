import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './App.css';
import TuringVotingABI from './TuringVoting.json';
import { Button, TextField, Typography, Container, Box, MenuItem, Select, FormControl, InputLabel, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

const contractAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3";
const abi = TuringVotingABI.abi;

function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [voterName, setVoterName] = useState('');
  const [amount, setAmount] = useState('');
  const [votingEnabled, setVotingEnabled] = useState(false);
  const [voterBalances, setVoterBalances] = useState([]);
  const [voterNames, setVoterNames] = useState([]);

  useEffect(() => {
    async function init() {
      if (window.ethereum) {
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const contract = new ethers.Contract(contractAddress, abi, signer);
          const account = await signer.getAddress();

          setProvider(provider);
          setSigner(signer);
          setContract(contract);
          setAccount(account);

          const isVotingEnabled = await contract.votingEnabled();
          setVotingEnabled(isVotingEnabled);

          const names = await contract.getVoterNames();
          setVoterNames(names);

          fetchVoterBalances(contract, names);

          console.log('Initialization successful:', { provider, signer, contract, account });
        } catch (error) {
          console.error('Error initializing contract:', error);
        }
      } else {
        console.error('Ethereum provider not found. Install MetaMask.');
      }
    }
    init();
  }, [contract]); 

  const fetchVoterBalances = async (contract, names) => {
    const balances = [];

    for (const name of names) {
        try {
            const nameAddress = await contract.getVoterAddress(name);

            if (nameAddress === "0x0000000000000000000000000000000000000000") {
                throw new Error("Invalid address for voter name: " + name);
            }

            const balance = await contract.balanceOf(nameAddress);
            const formattedBalance = ethers.formatEther(balance); 
            balances.push({ name, balance: formattedBalance });
        } catch (error) {
            console.error(`Error fetching balance for ${name}:`, error);
            balances.push({ name, balance: "0" }); // Set "0" to ensure sorting works
        }
    }
    balances.sort((a, b) => parseFloat(b.balance) - parseFloat(a.balance));
    setVoterBalances(balances);
};

  const handleVote = async () => {
    if (!contract || !voterName || !amount) return;
    try {
      const tx = await contract.vote(voterName, ethers.parseEther(amount));
      await tx.wait();
      alert('Vote successful!');

      fetchVoterBalances(contract, voterNames);
    } catch (error) {
      console.error('Error voting:', error);
      alert(`Failed to vote: ${error.message}`);
    }
  };

  const toggleVoting = async (enable) => {
    if (!contract) return;
    try {
      const tx = enable ? await contract.votingOn() : await contract.votingOff();
      await tx.wait();
      setVotingEnabled(enable);
      alert(`Voting ${enable ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Error toggling voting:', error);
      alert('Failed to toggle voting');
    }
  };

  const issueToken = async () => {
    if (!contract || !voterName || !amount) return;
    try {
      const tx = await contract.issueToken(voterName, ethers.parseEther(amount));
      await tx.wait();
      alert('Issue tokens successful!');

      fetchVoterBalances(contract, voterNames);
    } catch (error) {
      console.error('Error voting:', error);
      alert(`Failed to vote: ${error.message}`);
    }
  }

  return (
    <Container>
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Turing Voting DApp
        </Typography>
        <Typography variant="body1">Connected Account: {account}</Typography>
        <Typography variant="body1">Voting Status: {votingEnabled ? 'Enabled' : 'Disabled'}</Typography>

        <Box my={2}>
          <FormControl fullWidth variant="outlined">
            <InputLabel>Voter Name</InputLabel>
            <Select
              value={voterName}
              onChange={(e) => setVoterName(e.target.value)}
              label="Voter Name"
            >
              {voterNames.map((name, index) => (
                <MenuItem key={index} value={name}>
                  {name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Amount (in Turing)"
            variant="outlined"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            fullWidth
            margin="normal"
          />
          <Button variant="contained" color="primary" onClick={handleVote}>
            Vote
          </Button>
        </Box>

        <Button variant="contained" onClick={issueToken} sx={{ backgroundColor: '#4caf50', '&:hover': { backgroundColor: '#45a049' } }}>
          Issue Tokens
        </Button>

        <Box my={2}>
          <Button variant="contained" color="secondary" onClick={() => toggleVoting(!votingEnabled)}>
            {votingEnabled ? 'Disable Voting' : 'Enable Voting'}
          </Button>
        </Box>

        <Typography variant="h5" component="h2" gutterBottom>
          Voter Balances
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Voter Name</TableCell>
                <TableCell align="right">Balance (Turing)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {voterBalances.map((voter, index) => (
                <TableRow key={index}>
                  <TableCell>{voter.name}</TableCell>
                  <TableCell align="right">{voter.balance}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Container>
  );
}

export default App;