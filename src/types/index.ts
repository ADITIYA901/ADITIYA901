export interface Admin {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'admin';
  created_at: string;
}

export interface Voter {
  id: string;
  email: string;
  name: string;
  aadhaar_id: string;
  wallet_address: string | null;
  is_verified: boolean;
  is_approved: boolean;
  is_rejected: boolean;
  created_at: string;
}

export interface Election {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  status: 'upcoming' | 'active' | 'ended';
  created_by: string;
  created_at: string;
}

export interface Candidate {
  id: string;
  election_id: string;
  name: string;
  party: string;
  symbol_url: string;
  photo_url: string;
  description: string;
  created_at: string;
}

export interface Vote {
  id: string;
  election_id: string;
  candidate_id: string;
  voter_id: string;
  tx_hash: string;
  block_number: number;
  timestamp: string;
}

export interface Announcement {
  id: string;
  election_id: string | null;
  title: string;
  message: string;
  created_by: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  user_type: 'admin' | 'voter';
  action: string;
  details: string;
  timestamp: string;
}

export interface VoteReceipt {
  tx_hash: string;
  block_number: number;
  election_id: string;
  candidate_id: string;
  voter_id: string;
  timestamp: string;
  from_address: string;
  to_address: string;
  gas_used: number;
}

export interface DashboardStats {
  totalVoters: number;
  totalCandidates: number;
  votesCast: number;
  activeElections: number;
  upcomingElections: number;
  endedElections: number;
}

export interface ElectionResult {
  candidate_id: string;
  candidate_name: string;
  party: string;
  vote_count: number;
  percentage: number;
}

export type UserRole = 'admin' | 'voter' | null;

export interface AuthState {
  user: Admin | Voter | null;
  role: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface BlockchainState {
  isConnected: boolean;
  account: string | null;
  chainId: number | null;
  isConnecting: boolean;
}
