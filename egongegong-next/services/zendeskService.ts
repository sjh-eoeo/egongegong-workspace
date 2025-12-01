/**
 * Zendesk API Service
 * Handles all Zendesk API interactions for multi-brand support
 */

import { getZendeskAccountById } from '@/lib/firebase/firestore';

interface ZendeskTicket {
  id: number;
  subject: string;
  description: string;
  status: 'new' | 'open' | 'pending' | 'hold' | 'solved' | 'closed';
  requester_id: number;
  created_at: string;
  updated_at: string;
}

interface ZendeskUser {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

interface ZendeskMacro {
  id: number;
  title: string;
  actions: Array<{
    field: string;
    value: string | string[];
  }>;
  active: boolean;
}

// Base64 encode credentials for Basic Auth
function encodeCredentials(email: string, apiToken: string): string {
  return Buffer.from(`${email}/token:${apiToken}`).toString('base64');
}

// Create headers for Zendesk API requests
function createHeaders(email: string, apiToken: string): HeadersInit {
  return {
    'Authorization': `Basic ${encodeCredentials(email, apiToken)}`,
    'Content-Type': 'application/json',
  };
}

/**
 * Get Zendesk account credentials by ID
 */
async function getAccountCredentials(accountId: string) {
  const account = await getZendeskAccountById(accountId);
  if (!account) {
    throw new Error(`Zendesk account not found: ${accountId}`);
  }
  return account;
}

/**
 * Create a new ticket in Zendesk
 */
export async function createTicket(
  accountId: string,
  data: {
    subject: string;
    body: string;
    requesterEmail: string;
    requesterName?: string;
    tags?: string[];
  }
): Promise<ZendeskTicket> {
  const account = await getAccountCredentials(accountId);
  const url = `https://${account.subdomain}.zendesk.com/api/v2/tickets.json`;

  const response = await fetch(url, {
    method: 'POST',
    headers: createHeaders(account.email, account.apiToken),
    body: JSON.stringify({
      ticket: {
        subject: data.subject,
        comment: { body: data.body },
        requester: {
          email: data.requesterEmail,
          name: data.requesterName || data.requesterEmail.split('@')[0],
        },
        tags: data.tags || [],
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create ticket: ${error}`);
  }

  const result = await response.json();
  return result.ticket;
}

/**
 * Get all tickets for a requester email
 */
export async function getTicketsByRequester(
  accountId: string,
  requesterEmail: string
): Promise<ZendeskTicket[]> {
  const account = await getAccountCredentials(accountId);
  const url = `https://${account.subdomain}.zendesk.com/api/v2/search.json?query=type:ticket requester:${encodeURIComponent(requesterEmail)}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: createHeaders(account.email, account.apiToken),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch tickets: ${error}`);
  }

  const result = await response.json();
  return result.results;
}

/**
 * Add a comment to an existing ticket
 */
export async function addTicketComment(
  accountId: string,
  ticketId: number,
  comment: string,
  isPublic: boolean = true
): Promise<void> {
  const account = await getAccountCredentials(accountId);
  const url = `https://${account.subdomain}.zendesk.com/api/v2/tickets/${ticketId}.json`;

  const response = await fetch(url, {
    method: 'PUT',
    headers: createHeaders(account.email, account.apiToken),
    body: JSON.stringify({
      ticket: {
        comment: {
          body: comment,
          public: isPublic,
        },
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to add comment: ${error}`);
  }
}

/**
 * Get all macros from Zendesk account
 */
export async function getMacros(accountId: string): Promise<ZendeskMacro[]> {
  const account = await getAccountCredentials(accountId);
  const url = `https://${account.subdomain}.zendesk.com/api/v2/macros/active.json`;

  const response = await fetch(url, {
    method: 'GET',
    headers: createHeaders(account.email, account.apiToken),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch macros: ${error}`);
  }

  const result = await response.json();
  return result.macros;
}

/**
 * Apply a macro to a ticket
 */
export async function applyMacro(
  accountId: string,
  ticketId: number,
  macroId: number
): Promise<void> {
  const account = await getAccountCredentials(accountId);
  const url = `https://${account.subdomain}.zendesk.com/api/v2/tickets/${ticketId}/macros/${macroId}/apply.json`;

  const response = await fetch(url, {
    method: 'GET',
    headers: createHeaders(account.email, account.apiToken),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to apply macro: ${error}`);
  }
}

/**
 * Create or update a user in Zendesk
 */
export async function createOrUpdateUser(
  accountId: string,
  data: {
    email: string;
    name: string;
    phone?: string;
    externalId?: string;
    userFields?: Record<string, string>;
  }
): Promise<ZendeskUser> {
  const account = await getAccountCredentials(accountId);
  const url = `https://${account.subdomain}.zendesk.com/api/v2/users/create_or_update.json`;

  const response = await fetch(url, {
    method: 'POST',
    headers: createHeaders(account.email, account.apiToken),
    body: JSON.stringify({
      user: {
        email: data.email,
        name: data.name,
        phone: data.phone,
        external_id: data.externalId,
        user_fields: data.userFields,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create/update user: ${error}`);
  }

  const result = await response.json();
  return result.user;
}

/**
 * Test Zendesk account connection
 */
export async function testConnection(accountId: string): Promise<boolean> {
  try {
    const account = await getAccountCredentials(accountId);
    const url = `https://${account.subdomain}.zendesk.com/api/v2/users/me.json`;

    const response = await fetch(url, {
      method: 'GET',
      headers: createHeaders(account.email, account.apiToken),
    });

    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Send outreach email via Zendesk ticket
 */
export async function sendOutreachEmail(
  accountId: string,
  data: {
    recipientEmail: string;
    recipientName: string;
    subject: string;
    body: string;
    tags?: string[];
  }
): Promise<{ ticketId: number; success: boolean }> {
  try {
    const ticket = await createTicket(accountId, {
      subject: data.subject,
      body: data.body,
      requesterEmail: data.recipientEmail,
      requesterName: data.recipientName,
      tags: [...(data.tags || []), 'outreach', 'creator-campaign'],
    });

    return { ticketId: ticket.id, success: true };
  } catch (error) {
    console.error('Failed to send outreach email:', error);
    throw error;
  }
}
