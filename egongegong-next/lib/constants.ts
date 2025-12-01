import { ZendeskMacro, Brand, User } from '../types';

// Fallback brands for testing (used when Firestore is empty)
export const MOCK_BRANDS: Brand[] = [
  { id: 'b1', name: 'BeautyGlow' },
  { id: 'b2', name: 'TechVibe' },
  { id: 'b3', name: 'FitLife' },
  { id: 'b4', name: 'StyleCo' },
];

// Fallback users for testing (used when Firestore is empty)
export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Alice Kim', email: 'alice@company.com', role: 'Admin', status: 'Approved' },
  { id: 'u2', name: 'Bob Park', email: 'bob@company.com', role: 'Manager', status: 'Approved' },
  { id: 'u3', name: 'Charlie Lee', email: 'charlie@company.com', role: 'Manager', status: 'Approved' },
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

// Empty arrays for backward compatibility
export const MOCK_PROJECTS: never[] = [];
export const MOCK_INFLUENCERS: never[] = [];
