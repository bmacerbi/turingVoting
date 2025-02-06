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

  // List of voter names (replace with your actual names)
  const voterNames = [
    "nome0","nome1", "nome2", "nome3", "nome4", "nome5",
    "nome6", "nome7", "nome8", "nome9", "nome10",
    "nome11", "nome12", "nome13", "nome14", "nome15",
    "nome16", "nome17", "nome18", "nome19"
  ];

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

          // Fetch balances for all voters
          fetchVoterBalances(contract);

          console.log('Initialization successful:', { provider, signer, contract, account });
        } catch (error) {
          console.error('Error initializing contract:', error);
        }
      } else {
        console.error('Ethereum provider not found. Install MetaMask.');
      }
    }
    init();
  }, []);

  const fetchVoterBalances = async (contract) => {
    const balances = [];

    for (const name of voterNames) {
        try {
            // Call the smart contract function to get the voter's address
            const nameAddress = await contract.getVoterAddress(name);

            // Ensure the address is valid before fetching balance
            if (nameAddress === "0x0000000000000000000000000000000000000000") {
                throw new Error("Invalid address for voter name: " + name);
            }

            // Fetch balance
            const balance = await contract.balanceOf(nameAddress);
            balances.push({ name, balance: ethers.formatEther(balance) });
        } catch (error) {
            console.error(`Error fetching balance for ${name}:`, error);
            balances.push({ name, balance: "N/A" });
        }
    }

    setVoterBalances(balances);
  };

  const handleVote = async () => {
    if (!contract || !voterName || !amount) return;
    try {
      const tx = await contract.vote(voterName, ethers.parseEther(amount));
      await tx.wait();
      alert('Vote successful!');

      fetchVoterBalances(contract);
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

      fetchVoterBalances(contract);
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