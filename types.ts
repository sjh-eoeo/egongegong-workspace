
export enum InfluencerStatus {
  Discovery = 'Discovery',
  Contacted = 'Contacted',
  Negotiating = 'Negotiating',
  Approved = 'Approved',
  Shipped = 'Shipped',
  ContentLive = 'Content Live',
  PaymentPending = 'Payment Pending',
  Paid = 'Paid',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Manager' | 'Viewer';
  status: 'Pending' | 'Approved' | 'Declined';
  avatar?: string; // Google Profile Picture
}

export interface Brand {
  id: string;
  name: string;
  logo?: string;
}

export interface CreatorCategory {
  id: string;
  name: string;
}

export interface Project {
  id: string;
  title: string;
  brand: string;
  status: 'Active' | 'Completed' | 'Draft';
  budget: number;
  spent: number;
  description: string;
  startDate: string;
  managers: string[];
}

export interface TikTokMetrics {
  views: number;
  likes: number;
  comments: number;
  shares: number;
  engagementRate: number;
  avgViewsPerVideo?: number;
}

export interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  isInternal: boolean;
  type?: 'macro' | 'text' | 'approval_request';
}

export interface PaymentMilestone {
  id: string;
  label: string; // e.g., "Batch 1 (Videos 1-12)", "Week 1 Target"
  amount: number;
  dueDate?: string; // Optional, as it might be performance based
  videoRequirement?: number; // CUMULATIVE video count required to unlock this payment
  status: 'Pending' | 'Eligible' | 'Paid'; // Eligible means requirement met, but not paid
}

export interface PaymentRecord {
  amountPaid: number;
  date: string;
  proofFileName?: string; // Name of uploaded transfer slip
  screenshotFileName?: string; // Name of uploaded video screenshot
}

// New interfaces for Seeding Workflow
export interface ContractDetails {
  totalAmount: number;
  currency: string;
  videoCount: number; // Target number of videos (Crucial for 10k seeding)
  paymentMethod: 'Wise' | 'PayPal' | 'Bank Transfer' | 'Unselected';
  paymentSchedule: 'Upon Completion' | 'Weekly' | 'Net30' | 'Custom (Milestones)' | 'Performance Batches';
  
  // Logic for Pacing
  pacingConfig?: {
    videosPerBatch: number; // e.g., 12 videos
    amountPerBatch: number; // e.g., $500 per 12 videos
    frequencyLabel?: string; // e.g. "Weekly"
  };

  milestones: PaymentMilestone[]; // For complex 10k projects
  status: 'Draft' | 'Sent' | 'Signed';
  signedDate?: string;
  contractFileName?: string; // Uploaded contract file
  
  // New Fields
  startDate?: string;
  endDate?: string;
  platform: 'TikTok' | 'Instagram' | 'YouTube' | 'X (Twitter)';
  tiktokShopFee?: number; // Only if platform is TikTok

  // Dynamic Payment Details
  paypalEmail?: string;
  bankName?: string;
  accountNumber?: string; // or IBAN
  swiftCode?: string;
}

export interface Logistics {
  shippingAddress?: string;
  carrier?: string;
  trackingNumber?: string;
  shippedDate?: string;
  status: 'Pending' | 'Shipped' | 'Delivered';
}

export interface PostedVideo {
  id: string; // Unique Video ID (from TikTok/YouTube or generated)
  link: string;
  date: string;
  isManual?: boolean; // To distinguish from TokAPI detected videos
}

export interface ContentStatus {
  draftLink?: string;
  isApproved: boolean;
  postedVideos: PostedVideo[]; // Array of live video objects
  status: 'Waiting for Draft' | 'Draft Review' | 'Approved' | 'Live';
  lastDetectedAt?: string; // Timestamp of latest TokAPI detection
}

export interface Influencer {
  id: string;
  projectId?: string;
  handle: string;
  name: string;
  followerCount: number;
  status: InfluencerStatus;
  email: string;
  country: string;
  category?: string; // New Category Field
  
  // TokAPI Metrics
  metrics?: TikTokMetrics;
  
  // Workflow Objects
  contract: ContractDetails;
  logistics: Logistics;
  content: ContentStatus;

  // Legacy fields (kept for compatibility with other parts, but moved logically to objects above)
  videoId?: string; 
  videoLink?: string;
  postedDate?: string;
  agreedAmount: number; // Sync with contract.amount
  currency: string;
  paymentStatus: 'Unpaid' | 'Processing' | 'Paid';
  paymentRecord?: PaymentRecord; // New field for proof of payment
  
  history: ChatMessage[];
  notes: string;
}

export interface ZendeskMacro {
  id: string;
  title: string;
  subject: string;
  body: string;
}

export type ViewMode = 'Seeding' | 'Performance' | 'Finance';
