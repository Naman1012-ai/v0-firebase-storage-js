export interface Donor {
  id: string
  name: string
  bloodGroup: string
  age: number
  weight: number
  phone: string
  email: string
  password: string
  location: { lat: number; lng: number }
  medical: string[]
  lifestyle: { smoke: string; alcohol: string; tattoo: string }
  lastDonation: string | null
  status: string
  registeredAt: string
  donationCount: number
  lastDonationApproved?: string
  dateOfBirth?: string
}

export interface Hospital {
  id: string
  name: string
  license: string
  establishment: string | null
  email: string
  contact: string
  emergencyHotline: string | null
  location: { lat: number; lng: number }
  password: string
  status: string
  registeredAt: string
}

export interface BloodRequest {
  id: string
  hospitalId: string
  hospitalName: string
  hospitalLocation: { lat: number; lng: number }
  bloodGroup: string
  units: number
  urgency: string
  status: string
  createdAt: string
  acceptedBy?: string
  donorId?: string
  donationApproved?: boolean
  donationNumber?: string
  approvedAt?: string
  acceptedAt?: string
}

export interface DonationRecord {
  id: string
  donorId?: string
  donationNumber: string
  hospitalName: string
  hospitalId: string
  bloodGroup: string
  units: number
  donatedAt: string
  approvedAt: string
}

export interface NotificationRecord {
  id: string
  type: string
  donorId?: string
  hospitalId?: string
  donorName?: string
  hospitalName?: string
  bloodGroup?: string
  requestId?: string
  donationNumber?: string
  message: string
  createdAt: string
  read: boolean
}

export interface RejectionRecord {
  requestId: string
  donorId: string
}

export interface ApiResponse<T> {
  success: boolean
  data: T | null
  error: string | null
}
