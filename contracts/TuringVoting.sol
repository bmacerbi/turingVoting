// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TuringVoting is ERC20 {
    address private deployer;
    address private teacherAddress = 0x502542668aF09fa7aea52174b9965A7799343Df7;
    bool public votingEnabled = true;

    // Mapping to store voter names to their addresses
    mapping(string => address) private voterNames;

    // Constant for Turing unit
    uint256 private constant TuringUnit = 10**18;

    // Array of student addresses
    address[20] private studentAddresses;

    // Modifier to restrict access to authorized users (deployer or teacher)
    modifier onlyAuthorized() {
        require(msg.sender == deployer || msg.sender == teacherAddress, "Unauthorized!");
        _;
    }

    // Modifier to ensure voting is enabled
    modifier onlyDuringVoting() {
        require(votingEnabled, "Voting is currently disabled!");
        _;
    }

    // Modifier to ensure only authorized voters can vote
    modifier onlyAuthorizedVoter() {
        bool isAuthorized = false;
        for (uint i = 0; i < studentAddresses.length; i++) {
            if (msg.sender == studentAddresses[i]) {
                isAuthorized = true;
                break;
            }
        }
        require(isAuthorized, "You are not an authorized voter!");
        _;
    }

    // Constructor to initialize the contract
    constructor() ERC20("TuringVoting", "TV") {
        deployer = msg.sender;

        // Initialize student addresses
        studentAddresses = [
            0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266,
            0x70997970C51812dc3A010C7d01b50e0d17dc79C8,
            0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC,
            0x90F79bf6EB2c4f870365E785982E1f101E93b906,
            0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65,
            0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc,
            0x976EA74026E726554dB657fA54763abd0C3a0aa9,
            0x14dC79964da2C08b23698B3D3cc7Ca32193d9955,
            0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f,
            0xa0Ee7A142d267C1f36714E4a8F75612F20a79720,
            0xBcd4042DE499D14e55001CcbB24a551F3b954096,
            0x71bE63f3384f5fb98995898A86B02Fb2426c5788,
            0xFABB0ac9d68B0B445fB7357272Ff202C5651694a,
            0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec,
            0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7097,
            0xcd3B766CCDd6AE721141F452C550Ca635964ce71,
            0x2546BcD3c84621e976D8185a91A922aE77ECEc30,
            0xbDA5747bFD65F08deb54cb465eB87D40e51B197E,
            0xdD2FD4581271e230360230F9337D5c0430Bf44C0,
            0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199
        ];

        // Initialize voter names to addresses
        voterNames["nome0"] = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266;
        voterNames["nome1"] = 0x70997970C51812dc3A010C7d01b50e0d17dc79C8;
        voterNames["nome2"] = 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC;
        voterNames["nome3"] = 0x90F79bf6EB2c4f870365E785982E1f101E93b906;
        voterNames["nome4"] = 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65;
        voterNames["nome5"] = 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc;
        voterNames["nome6"] = 0x976EA74026E726554dB657fA54763abd0C3a0aa9;
        voterNames["nome7"] = 0x14dC79964da2C08b23698B3D3cc7Ca32193d9955;
        voterNames["nome8"] = 0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f;
        voterNames["nome9"] = 0xa0Ee7A142d267C1f36714E4a8F75612F20a79720;
        voterNames["nome10"] = 0xBcd4042DE499D14e55001CcbB24a551F3b954096;
        voterNames["nome11"] = 0x71bE63f3384f5fb98995898A86B02Fb2426c5788;
        voterNames["nome12"] = 0xFABB0ac9d68B0B445fB7357272Ff202C5651694a;
        voterNames["nome13"] = 0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec;
        voterNames["nome14"] = 0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7097;
        voterNames["nome15"] = 0xcd3B766CCDd6AE721141F452C550Ca635964ce71;
        voterNames["nome16"] = 0x2546BcD3c84621e976D8185a91A922aE77ECEc30;
        voterNames["nome17"] = 0xbDA5747bFD65F08deb54cb465eB87D40e51B197E;
        voterNames["nome18"] = 0xdD2FD4581271e230360230F9337D5c0430Bf44C0;
        voterNames["nome19"] = 0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199;
    }

    // Function to issue tokens (only authorized users can call this)
    function issueToken(string memory codinome, uint256 amount) public onlyAuthorized {
        require(voterNames[codinome] != address(0), "Invalid codinome!");
        _mint(voterNames[codinome], amount);
    }

    // Function to vote
    function vote(string memory voterName, uint256 amount) public onlyDuringVoting onlyAuthorizedVoter {
        address voterAddress = voterNames[voterName];
        require(voterAddress != address(0), "Invalid voter name!");
        require(msg.sender != voterAddress, "You cannot vote for yourself!");
        require(amount <= 2 * TuringUnit, "Vote amount exceeds limit!");

        _mint(voterAddress, amount);
        _mint(msg.sender, (2 * TuringUnit) / 10.0); // 0.2 Turing
    }

    // Function to enable voting (only authorized users can call this)
    function votingOn() public onlyAuthorized {
        votingEnabled = true;
    }

    // Function to disable voting (only authorized users can call this)
    function votingOff() public onlyAuthorized {
        votingEnabled = false;
    }
    
    // Function to get the address of a voter by their name
    function getVoterAddress(string memory voterName) public view returns (address) {
        return voterNames[voterName];
    }
}