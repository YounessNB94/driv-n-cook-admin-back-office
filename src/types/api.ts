export type FranchiseApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type PaymentMethod = 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'POINTS';
export type SupplyOrderStatus = 'DRAFT' | 'CONFIRMED' | 'READY' | 'COLLECTED';
export type AppointmentType = 'SUPPLY_PICKUP' | 'TRUCK_PICKUP';
export type AppointmentStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
export type SaleChannel = 'ON_SITE' | 'RESERVATION';
export type RevenueGranularity = 'day' | 'week' | 'month';
export type ReportType = 'SALES_STATS' | 'TOP_ITEMS' | 'REVENUE';
export type ReportStatus = 'PENDING' | 'READY' | 'FAILED';
export type MenuStatus = 'DRAFT' | 'PUBLISHED';
export type CustomerOrderType = 'ON_SITE' | 'RESERVATION';
export type CustomerOrderStatus = 'CREATED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';
export type TruckStatus = 'ASSIGNED' | 'IN_SERVICE' | 'IN_REPAIR';
export type IncidentStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';

export interface AuthTokenResponse {
  accessToken: string;
  expiresAt?: string;
}

export interface FranchiseeRegistration {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyName: string;
  address: string;
  phone?: string;
}

export interface FranchiseeLoginRequest {
  email: string;
  password: string;
}

export interface Franchisee {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  companyName: string;
  address: string;
  createdAt: string;
}

export interface FranchiseePatch {
  firstName?: string;
  lastName?: string;
  phone?: string;
  companyName?: string;
  address?: string;
}

export interface FranchiseApplication {
  id: number;
  status: FranchiseApplicationStatus;
  paid: boolean;
  paymentMethod?: PaymentMethod;
  paymentRef?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FranchiseApplicationRequest {
  note: string;
}

export interface FranchiseApplicationPatch {
  paid?: boolean;
  paymentMethod?: PaymentMethod;
  paymentRef?: string;
}

export interface AdminFranchiseApplication extends FranchiseApplication {
  note?: string;
  franchisee?: Franchisee;
}

export interface AdminFranchiseApplicationDetail extends AdminFranchiseApplication {}

export interface Warehouse {
  id: number;
  name: string;
  address: string;
  phone?: string;
}

export interface InventoryItem {
  id: number;
  warehouseId: number;
  name: string;
  unit: string;
  availableQuantity: number;
}

export interface WarehouseInventoryItemPatch {
  availableQuantity: number;
}

export interface WarehouseInventoryItemCreate {
  name: string;
  unit: string;
  availableQuantity: number;
}

export interface ItemAvailability {
  inventoryItemId: number;
  name: string;
  requestedQuantity: number;
  availableQuantity: number;
}

export interface WarehouseAvailability {
  warehouseId: number;
  warehouseName: string;
  sufficient: boolean;
  items: ItemAvailability[];
}

export interface SupplyOrder {
  id: number;
  code?: string;
  status: SupplyOrderStatus;
  pickupWarehouseId?: number;
  franchiseeId?: number;
  paid: boolean;
  paymentMethod?: PaymentMethod;
  paymentRef?: string;
  totalCash?: number;
  updatedAt: string;
  createdAt?: string;
}

export interface SupplyOrderPatch {
  pickupWarehouseId?: number;
  status?: SupplyOrderStatus;
  paid?: boolean;
  paymentMethod?: PaymentMethod;
  paymentRef?: string;
}

export interface SupplyOrderItem {
  id: number;
  supplyOrderId: number;
  inventoryItemId: number;
  quantity: number;
}

export interface SupplyOrderItemPatch {
  quantity: number;
}

export interface AppointmentPatch {
  datetime?: string;
  status?: AppointmentStatus;
}

export interface Appointment {
  id: number;
  type: AppointmentType;
  warehouseId: number;
  franchiseeId?: number;
  supplyOrderId?: number;
  truckId?: number;
  datetime: string;
  status: AppointmentStatus;
  createdAt: string;
}

export interface Truck {
  id: number;
  name?: string;
  plateNumber: string;
  status?: TruckStatus;
  currentWarehouseId?: number;
  currentWarehouseName?: string;
  assignedFranchiseeId?: number;
}

export interface TruckCreatePayload {
  plateNumber: string;
  currentWarehouseId: number;
  status: TruckStatus;
  name?: string;
}

export interface TruckPatch {
  plateNumber?: string;
  name?: string;
  status?: TruckStatus;
  currentWarehouseId?: number;
  assignedFranchiseeId?: number | null;
}

export interface Incident {
  id: number;
  truckId: number;
  truckPlateNumber?: string;
  franchiseeId?: number;
  franchiseeName?: string;
  description: string;
  status: IncidentStatus;
  createdAt: string;
}

export interface IncidentPatch {
  description?: string;
  status?: IncidentStatus;
}

export interface IncidentCreatePayload {
  description: string;
}

export interface MaintenanceRecord {
  id: number;
  truckId: number;
  date: string;
  description: string;
}

export interface MaintenanceRecordCreatePayload {
  date: string;
  description: string;
}

export interface Sale {
  id: number;
  date: string;
  menuItemId?: number;
  quantity: number;
  totalAmount: number;
  channel: SaleChannel;
}

export interface RevenuePoint {
  periodStart: string;
  periodEnd: string;
  amount: number;
}

export interface ReportRequest {
  type: ReportType;
  from: string;
  to: string;
  franchiseeId?: number;
}

export interface Report {
  id: number;
  type: ReportType;
  from: string;
  to: string;
  status: ReportStatus;
  createdAt: string;
}

export interface Menu {
  id: number;
  status: MenuStatus;
  updatedAt: string;
}

export interface MenuItem {
  id: number;
  menuId: number;
  name: string;
  priceCash: number;
  pointsPrice?: number;
  available: boolean;
}

export interface MenuItemCreate {
  name: string;
  priceCash: number;
  pointsPrice?: number;
  available: boolean;
}

export interface LoyaltyCard {
  id: number;
  customerRef: string;
  code: string;
  pointsBalance: number;
  createdAt: string;
}

export interface CustomerOrder {
  id: number;
  type: CustomerOrderType;
  status: CustomerOrderStatus;
  loyaltyCardId?: number;
  paid: boolean;
  paymentMethod?: PaymentMethod;
  totalCash: number;
  totalPoints: number;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerOrderItem {
  id: number;
  customerOrderId: number;
  menuItemId: number;
  quantity: number;
  lineCashTotal?: number;
  linePointsTotal?: number;
}

export interface SalesSnapshot {
  todayAmount: number;
  trendVsYesterday: number;
}

export interface FranchiseTerms {
  version: string;
  entryFeeText: string;
  royaltyText: string;
  supplyRuleText: string;
  content: string;
}

export interface CustomerOrderPatch {
  status?: CustomerOrderStatus;
  paid?: boolean;
  paymentMethod?: PaymentMethod;
}

export interface MenuPatch {
  status: MenuStatus;
}

export interface MenuItemPatch {
  name?: string;
  priceCash?: number;
  pointsPrice?: number;
  available?: boolean;
}

export interface ProfilePreferences {
  avatarDataUrl?: string;
  accentColor?: string;
}

export interface AdminFranchiseeDetail {
  franchisee: Franchisee;
  preferences?: ProfilePreferences;
}
