// User Types
export interface User {
  _id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  profileImage?: string;
  role: 'patient' | 'doctor' | 'admin';
  age?: number;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  specialization?: string;
  qualifications?: string[];
  experience?: number;
  consultationFee?: number;
  availability?: Array<{
    day: string;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
  }>;
  rating?: number;
  totalReviews?: number;
  isActive: boolean;
  isVerified: boolean;
  isOnline?: boolean;
  lastSeen?: string;
  createdAt: string;
  updatedAt: string;
}

// Booking Types
export interface Booking {
  _id: string;
  patient: User | string;
  doctor?: User | string;
  patientInfo: {
    fullName: string;
    age: number;
    weight?: number;
    gender?: string;
    phoneNumber: string;
    location: string;
    allergies?: string;
    medicalHistory?: string;
    currentMedications?: string;
  };
  medicalProblem: string;
  symptoms?: string[];
  appointmentType: 'in-person' | 'video-consultation' | 'phone-consultation';
  preferredTime: string;
  additionalNotes?: string;
  assignedDate?: string;
  assignedTime?: string;
  meetingLink?: string;
  meetingId?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled' | 'no-show';
  adminNotes?: string;
  rejectionReason?: string;
  requestedAt: string;
  respondedAt?: string;
  completedAt?: string;
  paymentStatus?: string;
  paymentProofUrl?: string;
  paymentProofUploadedAt?: string;
  amount?: number;
  scheduledAt?: string;
  videoCallStatus?: 'none' | 'requested' | 'accepted' | 'active' | 'ended';
  videoCallRequestedAt?: string;
  videoCallAcceptedAt?: string;
  prescription?: {
    diagnosis: string;
    medications: Array<{
      name: string;
      dosage: string;
      frequency: string;
      duration: string;
      instructions: string;
    }>;
    advice?: string;
    followUpDate?: string;
    issuedAt?: string;
  };
  rating?: number;
  review?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Message Types
export interface Message {
  _id: string;
  sender: User | string;
  receiver: User | string;
  chatRoom?: string;
  messageType: 'text' | 'image' | 'file' | 'audio' | 'video';
  content: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  isRead: boolean;
  readAt?: string;
  replyTo?: Message | string;
  isEdited: boolean;
  editedAt?: string;
  isDeleted: boolean;
  deletedAt?: string;
  reactions?: Array<{
    user: string;
    emoji: string;
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

// Notification Types
export interface Notification {
  _id: string;
  recipient: User | string;
  sender?: User | string;
  type: 'booking_created' | 'booking_accepted' | 'booking_rejected' | 'booking_reminder' | 'booking_completed' | 'appointment_upcoming' | 'message_received' | 'video_call_invite' | 'video_call_ended' | 'prescription_added' | 'system_notification' | 'welcome';
  title: string;
  message: string;
  relatedBooking?: Booking | string;
  relatedMessage?: Message | string;
  meetingLink?: string;
  isRead: boolean;
  readAt?: string;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high';
  sentPush?: boolean;
  sentEmail?: boolean;
  createdAt: string;
  updatedAt: string;
}

// Meeting Types
export interface Meeting {
  _id: string;
  meetingId: string;
  booking: Booking | string;
  host: User | string;
  participants: Array<{
    user: User | string;
    joinedAt?: string;
    leftAt?: string;
    isHost: boolean;
  }>;
  status: 'scheduled' | 'ongoing' | 'ended' | 'cancelled';
  scheduledAt: string;
  startedAt?: string;
  endedAt?: string;
  duration?: number;
  settings: {
    enableVideo: boolean;
    enableAudio: boolean;
    enableScreenShare: boolean;
    enableChat: boolean;
    waitingRoom: boolean;
    recordMeeting: boolean;
  };
  recording?: {
    url: string;
    startedAt: string;
    endedAt: string;
    duration: number;
  };
  chatMessages?: Array<{
    sender: User | string;
    message: string;
    sentAt: string;
  }>;
  feedback?: Array<{
    user: User | string;
    rating: number;
    comment?: string;
    submittedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

// Conversation Types
export interface Conversation {
  partner: User;
  lastMessage: Message;
  unreadCount: number;
}

// Dashboard Stats
export interface DashboardStats {
  totalUsers: number;
  totalDoctors: number;
  totalBookings: number;
  pendingBookings: number;
  todayBookings: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: any[];
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  fullName: string;
  email: string;
  password: string;
  phoneNumber?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Theme Types
export type Theme = 'light' | 'dark' | 'system';
