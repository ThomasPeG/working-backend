export enum NotificationType {
  // GENERAL - Notificaciones del sistema y generales
  SYSTEM = 'system',
  WELCOME = 'welcome',
  ACCOUNT_UPDATE = 'account_update',
  SECURITY_ALERT = 'security_alert',
  MAINTENANCE = 'maintenance',
  
  // CONVERSATIONS - Mensajes y comunicación
  NEW_MESSAGE = 'new_message',
  MESSAGE_REPLY = 'message_reply',
  GROUP_MESSAGE = 'group_message',
  CONVERSATION_STARTED = 'conversation_started',
  
  // JOB_OFFERS - Ofertas de trabajo y oportunidades
  JOB_POSTED = 'job_posted',
  JOB_MATCH = 'job_match',
  JOB_RECOMMENDED = 'job_recommended',
  JOB_DEADLINE_REMINDER = 'job_deadline_reminder',
  JOB_STATUS_UPDATE = 'job_status_update',
  
  // FRIEND_REQUESTS - Solicitudes de amistad y conexiones
  FRIEND_REQUEST_RECEIVED = 'friend_request_received',
  FRIEND_REQUEST_ACCEPTED = 'friend_request_accepted',
  FRIEND_REQUEST_DECLINED = 'friend_request_declined',
  CONNECTION_SUGGESTION = 'connection_suggestion',
  
  // JOB_INVITATIONS - Invitaciones laborales y aplicaciones
  JOB_INVITATION_RECEIVED = 'job_invitation_received',
  JOB_APPLICATION_RECEIVED = 'job_application_received',
  JOB_APPLICATION_ACCEPTED = 'job_application_accepted',
  JOB_APPLICATION_REJECTED = 'job_application_rejected',
  INTERVIEW_SCHEDULED = 'interview_scheduled',
  INTERVIEW_REMINDER = 'interview_reminder'
}

// Mapeo de tipos a categorías para facilitar el filtrado
export const NotificationCategoryMap = {
  general: [
    NotificationType.SYSTEM,
    NotificationType.WELCOME,
    NotificationType.ACCOUNT_UPDATE,
    NotificationType.SECURITY_ALERT,
    NotificationType.MAINTENANCE
  ],
  conversations: [
    NotificationType.NEW_MESSAGE,
    NotificationType.MESSAGE_REPLY,
    NotificationType.GROUP_MESSAGE,
    NotificationType.CONVERSATION_STARTED
  ],
  jobOffers: [
    NotificationType.JOB_POSTED,
    NotificationType.JOB_MATCH,
    NotificationType.JOB_RECOMMENDED,
    NotificationType.JOB_DEADLINE_REMINDER,
    NotificationType.JOB_STATUS_UPDATE
  ],
  friendRequests: [
    NotificationType.FRIEND_REQUEST_RECEIVED,
    NotificationType.FRIEND_REQUEST_ACCEPTED,
    NotificationType.FRIEND_REQUEST_DECLINED,
    NotificationType.CONNECTION_SUGGESTION
  ],
  jobInvitations: [
    NotificationType.JOB_INVITATION_RECEIVED,
    NotificationType.JOB_APPLICATION_RECEIVED,
    NotificationType.JOB_APPLICATION_ACCEPTED,
    NotificationType.JOB_APPLICATION_REJECTED,
    NotificationType.INTERVIEW_SCHEDULED,
    NotificationType.INTERVIEW_REMINDER
  ]
};

// Interfaz para respuestas de API relacionadas con notificaciones
export interface NotificationResponse {
  access_token?: string | null;
  message: string;
  data?: {
    notifications?: Notification[];
    notification?: Notification;
    unreadCount?: number;
    unreadCountByCategory?: {
      general: number;
      conversations: number;
      jobOffers: number;
      friendRequests: number;
      jobInvitations: number;
    };
  };
}