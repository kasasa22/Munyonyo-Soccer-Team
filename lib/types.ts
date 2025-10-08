// Database types based on the backend schema

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  TREASURER = 'treasurer',
  VIEWER = 'viewer',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  passwordHash?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Player {
  id: string;
  name: string;
  phone: string;
  annual: number;
  monthly: number;
  pitch: number;
  matchDay?: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export enum PaymentType {
  ANNUAL = 'annual',
  MONTHLY = 'monthly',
  PITCH = 'pitch',
  MATCHDAY = 'matchday',
}

export interface Payment {
  id: string;
  playerId: string;
  playerName: string;
  paymentType: PaymentType;
  amount: number;
  date: Date | string;
  createdBy?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export enum MatchType {
  FRIENDLY = 'friendly',
  LEAGUE = 'league',
  CUP = 'cup',
  TOURNAMENT = 'tournament',
  TRAINING = 'training',
  EXPENSE = 'expense',
}

export interface MatchDay {
  id: string;
  matchDate: Date | string;
  opponent?: string;
  venue?: string;
  matchType: MatchType;
  createdAt: Date | string;
}

export enum ExpenseCategory {
  FACILITIES = 'Facilities',
  EQUIPMENT = 'Equipment',
  FOOD_DRINKS = 'Food & Drinks',
  TRANSPORT = 'Transport',
  MEDICAL = 'Medical',
  OFFICIALS = 'Officials',
}

export interface Expense {
  id: string;
  description: string;
  category: ExpenseCategory;
  amount: number;
  expenseDate: Date | string;
  matchDayId?: string;
  createdBy?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// Request/Response types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  user: User;
  token: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  role: UserRole;
  password: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: UserRole;
  status?: UserStatus;
}

export interface CreatePlayerRequest {
  name: string;
  phone: string;
  annual?: number;
  monthly?: number;
  pitch?: number;
  matchDay?: number;
}

export interface UpdatePlayerRequest {
  name?: string;
  phone?: string;
  annual?: number;
  monthly?: number;
  pitch?: number;
  matchDay?: number;
}

export interface CreatePaymentRequest {
  playerId: string;
  playerName: string;
  paymentType: PaymentType;
  amount: number;
  date?: Date | string;
}

export interface UpdatePaymentRequest {
  playerId?: string;
  playerName?: string;
  paymentType?: PaymentType;
  amount?: number;
  date?: Date | string;
}

export interface CreateMatchDayRequest {
  matchDate: Date | string;
  opponent?: string;
  venue?: string;
  matchType: MatchType;
}

export interface UpdateMatchDayRequest {
  matchDate?: Date | string;
  opponent?: string;
  venue?: string;
  matchType?: MatchType;
}

export interface CreateExpenseRequest {
  description: string;
  category: ExpenseCategory;
  amount: number;
  expenseDate?: Date | string;
  matchDayId?: string;
}

export interface UpdateExpenseRequest {
  description?: string;
  category?: ExpenseCategory;
  amount?: number;
  expenseDate?: Date | string;
  matchDayId?: string;
}
