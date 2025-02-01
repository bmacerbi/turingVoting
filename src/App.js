import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './App.css';
import { Button, TextField, Typography, Container, Box, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import TuringVotingABI from "./TuringVoting.json";

const contractAddress = "0xd72FBb85Cc0c36aC0E476B27f6FBd252bae8624A"; // Replace with your contract address
const abi = TuringVotingABI.abi;

function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [voterName, setVoterName] = useState(''); 
  const [amount, setAmount] = useState('');
  const [votingEnabled, setVotingEnabled] = useState(false);

  const voterNames = [
    "nome1", "nome2", "nome3", "nome4", "nome5",
    "nome6", "nome7", "nome8", "nome9", "nome10",
    "nome11", "nome12", "nome13", "nome14", "nome15",
    "nome16", "nome17", "nome18", "nome19", "nome20"
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

  const handleVote = async () => {
    if (!contract || !voterName || !amount) return;
    try {
      const tx = await contract.vote(voterName, ethers.parseEther(amount)); // Pass voterName instead of codinome
      await tx.wait();
      alert('Vote successful!');
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

        <Box my={2}>
          <Button variant="contained" color="secondary" onClick={() => toggleVoting(!votingEnabled)}>
            {votingEnabled ? 'Disable Voting' : 'Enable Voting'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

export default App;