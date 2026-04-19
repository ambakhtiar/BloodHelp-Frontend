export interface INotification {
  id: string;
  title: string;
  message: string;
  type: string;          // e.g. 'DONATION_CONSENT_REQUEST' | 'DONATION_RECORD_REQUEST' | etc.
  isRead: boolean;
  userId: string;
  postId?: string | null; // linked post for consent notifications
  createdAt: string;
  updatedAt: string;
}
