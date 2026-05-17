import { Document, Types } from "mongoose";

// ───────── Blood Groups ─────────
export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"] as const;
export type BloodGroup = (typeof BLOOD_GROUPS)[number];

export interface IBloodGroups {
  "A+": number;
  "A-": number;
  "B+": number;
  "B-": number;
  "O+": number;
  "O-": number;
  "AB+": number;
  "AB-": number;
}

// ───────── User ─────────
export type UserRole = "admin" | "user" | "organisation" | "hospital";

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  phone?: string;
  location?: string;
  bloodGroup?: BloodGroup;
  role: UserRole;
  uniqueId?: string;
  isVerified: boolean;
  profilePicture: {
    url: string;
    publicId: string;
  };
  createdAt: Date;
}

// ───────── Inventory ─────────
export interface IInventory extends Document {
  _id: Types.ObjectId;
  orgId: Types.ObjectId | null;
  bloodBankName: string;
  groups: IBloodGroups | Map<string, number>;
  lastUpdated: Date;
}

// ───────── Request ─────────
export type RequestType = "DONATE" | "RECEIVE" | "ADMIN_SUPPLY";
export type RequestStatus = "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED";
export type RequestPriority = "normal" | "emergency";

export interface IRequest extends Document {
  _id: Types.ObjectId;
  requester: Types.ObjectId;
  requestToOrg: Types.ObjectId | null;
  requestType: RequestType;
  bloodGroup: BloodGroup;
  units: number;
  status: RequestStatus;
  notes?: string;
  priority: RequestPriority;
  createdAt: Date;
  processedBy?: Types.ObjectId;
}

// ───────── Transaction ─────────
export type TransactionType = "IN" | "OUT";

export interface ITransaction extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  orgId: Types.ObjectId | null;
  type: TransactionType;
  bloodGroup: BloodGroup;
  units: number;
  relatedRequest?: Types.ObjectId;
  timestamp: Date;
}

// ───────── Default Groups Helper ─────────
export const DEFAULT_GROUPS: IBloodGroups = {
  "A+": 0,
  "A-": 0,
  "B+": 0,
  "B-": 0,
  "O+": 0,
  "O-": 0,
  "AB+": 0,
  "AB-": 0,
};
