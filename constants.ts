
import { Influencer, InfluencerStatus, ZendeskMacro, Project, User, Brand, CreatorCategory } from './types';

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Alice Johnson', email: 'alice.j@agency.com', role: 'Manager', status: 'Approved', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice' },
  { id: 'u2', name: 'David Kim', email: 'david.k@agency.com', role: 'Manager', status: 'Approved', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David' },
  { id: 'u3', name: 'Sarah Lee', email: 'sarah.l@agency.com', role: 'Admin', status: 'Approved', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
  { id: 'u4', name: 'Mike Ross', email: 'mike.r@agency.com', role: 'Viewer', status: 'Pending', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike' },
];

export const MOCK_BRANDS: Brand[] = [
  { id: 'b1', name: 'Glow Cosmetics' },
  { id: 'b2', name: 'NexTech' },
  { id: 'b3', name: 'PureLife Organics' },
  { id: 'b4', name: 'UrbanFit' },
];

export const MOCK_CATEGORIES: CreatorCategory[] = [
  { id: 'c1', name: 'Beauty & Skin' },
  { id: 'c2', name: 'Hair Care' },
  { id: 'c3', name: 'Tech & Gaming' },
  { id: 'c4', name: 'Fashion' },
  { id: 'c5', name: 'Lifestyle' },
  { id: 'c6', name: 'Fitness' },
];

export const ZENDESK_MACROS: ZendeskMacro[] = [
  {
    id: 'm1',
    title: 'Initial Outreach',
    subject: 'Collaboration Opportunity with [Brand Name]',
    body: "Hi [Name],\n\nWe love your content on TikTok! We'd like to send you some of our products to try out. Let us know if you're interested.\n\nBest,\n[Brand Team]"
  },
  {
    id: 'm2',
    title: 'Rate Negotiation',
    subject: 'Re: Collaboration Rates',
    body: "Hi [Name],\n\nThanks for getting back to us. Our budget for this campaign is typically around $[Amount]. Does that work for you?\n\nBest,"
  },
  {
    id: 'm3',
    title: 'Shipping Confirmation',
    subject: 'Your package is on the way!',
    body: "Hi [Name],\n\nGreat news! We've shipped your package. Tracking number: [Tracking].\n\nCan't wait to see what you create!"
  },
  {
    id: 'm4',
    title: 'Payment Details Request',
    subject: 'Invoice & Payment Details',
    body: "Hi [Name],\n\nPlease send over your invoice and PayPal details so we can process your payment.\n\nThanks!"
  }
];

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'p1',
    title: 'Summer Glow Campaign',
    brand: 'Glow Cosmetics',
    status: 'Active',
    budget: 15000,
    spent: 3500,
    description: 'Launch campaign for the new Summer Glow serum focusing on lifestyle content.',
    startDate: '2023-10-01',
    managers: ['alice.j@agency.com', 'david.k@agency.com']
  },
  {
    id: 'p2',
    title: '10k Video Challenge',
    brand: 'NexTech',
    status: 'Active',
    budget: 100000,
    spent: 25000,
    description: 'High volume seeding campaign. 100 videos target per creator.',
    startDate: '2023-11-15',
    managers: ['david.k@agency.com']
  },
  {
    id: 'p3',
    title: 'Holiday Special',
    brand: 'Glow Cosmetics',
    status: 'Active',
    budget: 25000,
    spent: 12000,
    description: 'Q4 holiday gift sets push.',
    startDate: '2023-12-01',
    managers: ['alice.j@agency.com']
  }
];

const BASE_INFLUENCERS: Influencer[] = [
  {
    id: '1',
    projectId: 'p1',
    handle: '@dancer_sarah',
    name: 'Sarah Jenkins',
    followerCount: 450000,
    status: InfluencerStatus.ContentLive,
    email: 'sarah.j@gmail.com',
    country: 'US',
    category: 'Lifestyle',
    videoId: '728394857283',
    videoLink: 'https://tiktok.com/@dancer_sarah/video/1',
    postedDate: '2023-10-15',
    agreedAmount: 500,
    currency: 'USD',
    paymentStatus: 'Processing',
    metrics: {
      views: 125000,
      likes: 12000,
      comments: 450,
      shares: 120,
      engagementRate: 10.05,
      avgViewsPerVideo: 45000
    },
    contract: {
      totalAmount: 500,
      currency: 'USD',
      videoCount: 1,
      paymentMethod: 'PayPal',
      paypalEmail: 'sarah.jenkins.pay@gmail.com',
      paymentSchedule: 'Upon Completion',
      milestones: [],
      status: 'Signed',
      signedDate: '2023-10-04',
      platform: 'TikTok',
      tiktokShopFee: 0,
      startDate: '2023-10-01',
      endDate: '2023-10-31'
    },
    logistics: {
      status: 'Delivered',
      carrier: 'FedEx',
      trackingNumber: '782361239123',
      shippedDate: '2023-10-06'
    },
    content: {
      status: 'Live',
      isApproved: true,
      postedVideos: [
          { id: 'v1', link: 'https://tiktok.com/@dancer_sarah/video/1', date: '2023-10-15' }
      ], 
      lastDetectedAt: '2023-10-15T14:30:00'
    },
    history: [
      { id: 'c1', sender: 'operator.team', content: 'Sent initial outreach macro.', timestamp: '2023-10-01T10:00:00', isInternal: false, type: 'macro' },
      { id: 'c2', sender: 'Sarah Jenkins', content: 'Yes! I would love to. My rate is $800.', timestamp: '2023-10-02T09:30:00', isInternal: false },
      { id: 'c3', sender: 'alice.j@agency.com', content: 'Her engagement is good (10%+), but $800 is over budget. Counter with $500 + bonus product.', timestamp: '2023-10-02T10:15:00', isInternal: true },
      { id: 'c4', sender: 'operator.team', content: 'Negotiated down to $500. She accepted.', timestamp: '2023-10-03T14:20:00', isInternal: false },
    ],
    notes: 'Very responsive. High quality content. Finance team needs to approve invoice #INV-2023-001.'
  },
  {
    id: '2',
    projectId: 'p2',
    handle: '@tech_guru_mike',
    name: 'Mike Chen',
    followerCount: 1200000,
    status: InfluencerStatus.ContentLive,
    email: 'mike.c@techmail.com',
    country: 'US',
    category: 'Tech & Gaming',
    agreedAmount: 10000,
    currency: 'USD',
    paymentStatus: 'Unpaid',
    metrics: { views: 500000, likes: 45000, comments: 2000, shares: 500, engagementRate: 8.5, avgViewsPerVideo: 150000 },
    contract: {
      totalAmount: 10000,
      currency: 'USD',
      videoCount: 50, // 50 videos target
      paymentMethod: 'Wise',
      paypalEmail: 'mike.chen@wise.com',
      paymentSchedule: 'Performance Batches',
      pacingConfig: { videosPerBatch: 12, amountPerBatch: 4000 },
      milestones: [
        { id: 'ms1', label: 'Batch 1 (12 Videos)', amount: 4000, status: 'Paid', videoRequirement: 12 },
        { id: 'ms2', label: 'Batch 2 (24 Videos)', amount: 4000, status: 'Pending', videoRequirement: 24 },
        { id: 'ms3', label: 'Batch 3 (36 Videos)', amount: 4000, status: 'Pending', videoRequirement: 36 }
      ],
      status: 'Signed',
      platform: 'YouTube',
      startDate: '2023-11-01',
      endDate: '2024-02-01'
    },
    logistics: {
      status: 'Delivered'
    },
    content: {
      status: 'Live',
      isApproved: true,
      postedVideos: Array.from({length: 22}).map((_, i) => ({
          id: `vid-${i}`,
          link: `https://youtube.com/video/${i}`,
          date: '2023-11-10'
      })),
      lastDetectedAt: '2023-11-18T10:00:00'
    },
    history: [
      { id: 'c1', sender: 'operator.team', content: 'Sent 10k Challenge outreach.', timestamp: '2023-10-05T10:00:00', isInternal: false },
    ],
    notes: 'High volume partner. Needs weekly check-ins.'
  },
  {
    id: '3',
    projectId: 'p1',
    handle: '@beauty_lisa',
    name: 'Lisa Ray',
    followerCount: 850000,
    status: InfluencerStatus.Discovery,
    email: 'lisa.ray@agency.com',
    country: 'UK',
    category: 'Beauty & Skin',
    agreedAmount: 0,
    currency: 'GBP',
    paymentStatus: 'Unpaid',
    metrics: { views: 1200, likes: 100, comments: 10, shares: 5, engagementRate: 1.2, avgViewsPerVideo: 5000 },
    contract: {
      totalAmount: 0,
      currency: 'GBP',
      videoCount: 1,
      paymentMethod: 'Unselected',
      paymentSchedule: 'Upon Completion',
      milestones: [],
      status: 'Draft',
      platform: 'Instagram'
    },
    logistics: { status: 'Pending' },
    content: { status: 'Waiting for Draft', isApproved: false, postedVideos: [] },
    history: [],
    notes: 'Potential for next campaign.'
  }
];

// Generate 50+ mock influencers for pagination demo
const GENERATED_INFLUENCERS: Influencer[] = Array.from({ length: 97 }).map((_, i) => ({
  id: `gen-${i}`,
  projectId: undefined,
  handle: `@creator_gen_${i}`,
  name: `Creator ${i + 1}`,
  followerCount: Math.floor(Math.random() * 5000000) + 10000,
  status: Math.random() > 0.5 ? InfluencerStatus.Discovery : InfluencerStatus.Contacted,
  email: `creator${i}@example.com`,
  country: ['US', 'UK', 'CA', 'DE', 'FR', 'KR', 'JP'][Math.floor(Math.random() * 7)],
  category: MOCK_CATEGORIES[Math.floor(Math.random() * MOCK_CATEGORIES.length)].name,
  agreedAmount: 0,
  currency: 'USD',
  paymentStatus: 'Unpaid',
  metrics: { 
    views: Math.floor(Math.random() * 100000), 
    likes: Math.floor(Math.random() * 50000), 
    comments: Math.floor(Math.random() * 1000), 
    shares: Math.floor(Math.random() * 500), 
    engagementRate: Number((Math.random() * 15).toFixed(2)), 
    avgViewsPerVideo: Math.floor(Math.random() * 200000) 
  },
  contract: {
    totalAmount: 0,
    currency: 'USD',
    videoCount: 1, // Contracted Video Count
    paymentMethod: 'Unselected',
    paymentSchedule: 'Upon Completion',
    milestones: [],
    status: 'Draft',
    platform: 'TikTok'
  },
  logistics: { status: 'Pending' },
  content: { status: 'Waiting for Draft', isApproved: false, postedVideos: [] },
  history: [],
  notes: 'Generated entry'
}));

export const MOCK_INFLUENCERS = [...BASE_INFLUENCERS, ...GENERATED_INFLUENCERS];
