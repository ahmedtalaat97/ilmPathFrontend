export interface InstructorBalance {
  pendingBalance: number;
  lastUpdated: Date;
}

export interface InstructorPayoutSummary {
  id: number;
  grossAmount: number;
  commissionAmount: number;
  netAmount: number;
  status: string;
  paymentMethod?: string;
  requestDate: Date;
  processedDate?: Date;
  enrollmentsCount: number;
  notes?: string;
}

export interface RequestWithdrawalRequest {
  paymentMethod?: string;
  notes?: string;
}

export interface UnpaidEnrollmentSummary {
  enrollmentId: number;
  studentName: string;
  courseName: string;
  amountPaid: number;
  instructorShare: number;
  enrollmentDate: Date;
}

export interface WithdrawalRequestSummary {
  id: number;
  instructorId: string;
  instructorName: string;
  instructorEmail: string;
  grossAmount: number;
  commissionAmount: number;
  netAmount: number;
  status: string;
  paymentMethod?: string;
  requestDate: Date;
  processedDate?: Date;
  enrollmentsCount: number;
  notes?: string;
}

export interface WithdrawalRequestDetails {
  id: number;
  instructorId: string;
  instructorName: string;
  instructorEmail: string;
  grossAmount: number;
  commissionRate: number;
  commissionAmount: number;
  netAmount: number;
  status: string;
  paymentMethod?: string;
  externalTransactionId?: string;
  requestDate: Date;
  processedDate?: Date;
  notes?: string;
  enrollmentsIncluded: EnrollmentInPayout[];
}

export interface EnrollmentInPayout {
  enrollmentId: number;
  studentName: string;
  courseName: string;
  amountPaid: number;
  instructorShare: number;
  enrollmentDate: Date;
}

export interface ApproveWithdrawalRequest {
  adminNotes?: string;
}

export interface RejectWithdrawalRequest {
  reason: string;
}

export interface AdminDashboardStats {
  pendingRequestsCount: number;
  approvedRequestsCount: number;
  rejectedRequestsCount: number;
  completedRequestsCount: number;
  totalPendingAmount: number;
  totalApprovedAmount: number;
  totalCompletedAmount: number;
  lastUpdated: Date;
}

export interface StripeConnectStatusResponse {
  isConnected: boolean;
  canReceivePayouts: boolean;
  accountId?: string;
  status: string;
}

export interface StripeConnectResponse {
  accountId?: string;
  onboardingUrl?: string;
  isSetupComplete: boolean;
  message: string;
} 