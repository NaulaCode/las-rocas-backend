export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface CreateContactMessageData {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  turnstileToken?: string;
}
