// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract VotingSystem {
    address public admin;

    struct Voter {
        bool isRegistered;
        bool hasVoted;
        string aadhaar;
    }

    struct Candidate {
        string name;
        string party;
        uint256 voteCount;
    }

    struct Election {
        string title;
        bool isActive;
        uint256 startTime;
        uint256 endTime;
        uint256 candidateCount;
    }

    mapping(address => Voter) public voters;
    mapping(address => mapping(uint256 => bool)) public hasVotedInElection;
    mapping(uint256 => Election) public elections;
    mapping(uint256 => mapping(uint256 => Candidate)) public electionCandidates;

    uint256 public electionCount;

    event VoterRegistered(address indexed voter, string aadhaar);
    event CandidateRegistered(uint256 indexed electionId, uint256 indexed candidateId, string name, string party);
    event ElectionStarted(uint256 indexed electionId, string title, uint256 endTime);
    event ElectionEnded(uint256 indexed electionId);
    event VoteCast(address indexed voter, uint256 indexed electionId, uint256 indexed candidateId);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function registerVoter(string memory _aadhaar) external {
        require(!voters[msg.sender].isRegistered, "Voter already registered");
        voters[msg.sender] = Voter(true, false, _aadhaar);
        emit VoterRegistered(msg.sender, _aadhaar);
    }

    function registerCandidate(
        string memory _name,
        string memory _party,
        uint256 _electionId
    ) external onlyAdmin {
        require(elections[_electionId].isActive, "Election not active");
        uint256 candidateId = elections[_electionId].candidateCount;
        electionCandidates[_electionId][candidateId] = Candidate(_name, _party, 0);
        elections[_electionId].candidateCount++;
        emit CandidateRegistered(_electionId, candidateId, _name, _party);
    }

    function startElection(string memory _title, uint256 _durationDays) external onlyAdmin returns (uint256) {
        electionCount++;
        elections[electionCount] = Election(_title, true, block.timestamp, block.timestamp + (_durationDays * 1 days), 0);
        emit ElectionStarted(electionCount, _title, block.timestamp + (_durationDays * 1 days));
        return electionCount;
    }

    function endElection(uint256 _electionId) external onlyAdmin {
        require(elections[_electionId].isActive, "Election not active");
        elections[_electionId].isActive = false;
        emit ElectionEnded(_electionId);
    }

    function castVote(uint256 _electionId, uint256 _candidateId) external {
        require(voters[msg.sender].isRegistered, "Voter not registered");
        require(!hasVotedInElection[msg.sender][_electionId], "Already voted in this election");
        require(elections[_electionId].isActive, "Election not active");
        require(_candidateId < elections[_electionId].candidateCount, "Invalid candidate");

        hasVotedInElection[msg.sender][_electionId] = true;
        voters[msg.sender].hasVoted = true;
        electionCandidates[_electionId][_candidateId].voteCount++;

        emit VoteCast(msg.sender, _electionId, _candidateId);
    }

    function getVoteCount(uint256 _electionId, uint256 _candidateId) external view returns (uint256) {
        return electionCandidates[_electionId][_candidateId].voteCount;
    }

    function getWinner(uint256 _electionId) external view returns (uint256 candidateId, string memory name, uint256 voteCount) {
        uint256 maxVotes = 0;
        uint256 winnerId = 0;
        for (uint256 i = 0; i < elections[_electionId].candidateCount; i++) {
            if (electionCandidates[_electionId][i].voteCount > maxVotes) {
                maxVotes = electionCandidates[_electionId][i].voteCount;
                winnerId = i;
            }
        }
        return (winnerId, electionCandidates[_electionId][winnerId].name, maxVotes);
    }

    function verifyVoter(string memory _aadhaar) external view returns (bool) {
        return voters[msg.sender].isRegistered && keccak256(bytes(voters[msg.sender].aadhaar)) == keccak256(bytes(_aadhaar));
    }
}
