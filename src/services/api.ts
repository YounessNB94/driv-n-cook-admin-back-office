import { buildApiUrl } from '../config/api';
import { ApiError, apiRequest, buildJsonBody } from './httpClient';
import {
  Appointment,
  AppointmentPatch,
  AppointmentType,
  CustomerOrder,
  CustomerOrderItem,
  CustomerOrderPatch,
  FranchiseApplication,
  FranchiseApplicationPatch,
  FranchiseApplicationRequest,
  FranchiseTerms,
  Franchisee,
  FranchiseePatch,
  FranchiseeLoginRequest,
  Incident,
  IncidentPatch,
  IncidentCreatePayload,
  InventoryItem,
  LoyaltyCard,
  MaintenanceRecord,
  MaintenanceRecordCreatePayload,
  Menu,
  MenuItem,
  MenuItemCreate,
  MenuItemPatch,
  MenuPatch,
  ReportRequest,
  RevenuePoint,
  Sale,
  SupplyOrder,
  SupplyOrderItem,
  SupplyOrderItemPatch,
  SupplyOrderPatch,
  SupplyOrderStatus,
  Truck,
  TruckCreatePayload,
  TruckPatch,
  Warehouse,
  WarehouseAvailability,
  WarehouseInventoryItemPatch,
  WarehouseInventoryItemCreate,
  AuthTokenResponse,
  FranchiseeRegistration,
  AdminFranchiseeDetail,
  AdminFranchiseApplication,
  AdminFranchiseApplicationDetail,
  FranchiseApplicationStatus,
} from '../types/api';

const downloadReport = async (payload: ReportRequest, path: string) => {
  const response = await fetch(buildApiUrl(path), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: buildJsonBody(payload),
  });
  if (!response.ok) {
    throw new ApiError('Failed to request report', response.status);
  }
  const blob = await response.blob();
  const disposition = response.headers.get('Content-Disposition');
  let fileName: string | undefined;
  if (disposition) {
    const match = disposition.match(/filename="?([^";]+)"?/i);
    if (match?.[1]) {
      fileName = match[1];
    }
  }
  return { blob, fileName };
};

export const authApi = {
  login: (payload: FranchiseeLoginRequest) =>
    apiRequest<AuthTokenResponse>({
      path: '/auth/login',
      method: 'POST',
      body: buildJsonBody(payload),
    }),
  signup: (payload: FranchiseeRegistration) =>
    apiRequest<AuthTokenResponse>({
      path: '/auth/signup',
      method: 'POST',
      body: buildJsonBody(payload),
    }),
};

export const adminFranchiseesApi = {
  list: () => apiRequest<Franchisee[]>({ path: '/franchisees' }),
  getById: (franchiseeId: number) => apiRequest<AdminFranchiseeDetail>({ path: `/franchisees/${franchiseeId}` }),
};

export const adminFranchiseApplicationsApi = {
  list: (status: FranchiseApplicationStatus = 'PENDING') => {
    const params = new URLSearchParams({ status });
    return apiRequest<AdminFranchiseApplication[]>({ path: `/franchise-applications/admin?${params.toString()}` });
  },
  getById: (applicationId: number) =>
    apiRequest<AdminFranchiseApplicationDetail>({ path: `/franchise-applications/${applicationId}` }),
  updateStatus: (applicationId: number, status: FranchiseApplicationStatus) =>
    apiRequest<AdminFranchiseApplicationDetail>({
      path: `/franchise-applications/admin/${applicationId}/status`,
      method: 'PATCH',
      body: buildJsonBody({ status }),
    }),
  updatePayment: (applicationId: number, payload: FranchiseApplicationPatch) =>
    apiRequest<AdminFranchiseApplicationDetail>({
      path: `/franchise-applications/${applicationId}`,
      method: 'PATCH',
      body: buildJsonBody(payload),
    }),
};

export const franchiseeApi = {
  getCurrent: () => apiRequest<Franchisee>({ path: '/franchisees/me' }),
  updateCurrent: (payload: FranchiseePatch) =>
    apiRequest<Franchisee>({
      path: '/franchisees/me',
      method: 'PATCH',
      body: buildJsonBody(payload),
    }),
};

export const franchiseTermsApi = {
  getTerms: () => apiRequest<FranchiseTerms>({ path: '/franchise-terms' }),
};

export const franchiseApplicationsApi = {
  list: () => apiRequest<FranchiseApplication[]>({ path: '/franchise-applications' }),
  create: (payload: FranchiseApplicationRequest) =>
    apiRequest<FranchiseApplication>({
      path: '/franchise-applications',
      method: 'POST',
      body: buildJsonBody(payload),
    }),
  updatePayment: (applicationId: number, payload: FranchiseApplicationPatch) =>
    apiRequest<FranchiseApplication>({
      path: `/franchise-applications/${applicationId}`,
      method: 'PATCH',
      body: buildJsonBody(payload),
    }),
};

export const warehousesApi = {
  list: () => apiRequest<Warehouse[]>({ path: '/warehouses' }),
  inventory: (warehouseId: number) =>
    apiRequest<InventoryItem[]>({ path: `/warehouses/${warehouseId}/inventory-items` }),
  updateInventoryItem: (warehouseId: number, itemId: number, payload: WarehouseInventoryItemPatch) =>
    apiRequest<InventoryItem>({
      path: `/warehouses/${warehouseId}/inventory-items/${itemId}`,
      method: 'PATCH',
      body: buildJsonBody(payload),
    }),
  createInventoryItem: (warehouseId: number, payload: WarehouseInventoryItemCreate) =>
    apiRequest<InventoryItem>({
      path: `/warehouses/${warehouseId}/inventory-items`,
      method: 'POST',
      body: buildJsonBody(payload),
    }),
  availability: (supplyOrderId: number) =>
    apiRequest<WarehouseAvailability[]>({ path: `/warehouses/availability?supplyOrderId=${supplyOrderId}` }),
};

export const supplyOrdersApi = {
  list: (params?: { franchiseeId?: number; paid?: boolean; status?: SupplyOrderStatus; warehouseId?: number }) => {
    const query = new URLSearchParams();
    if (params?.franchiseeId) query.append('franchiseeId', String(params.franchiseeId));
    if (typeof params?.paid === 'boolean') query.append('paid', String(params.paid));
    if (params?.status) query.append('status', params.status);
    if (params?.warehouseId) query.append('warehouseId', String(params.warehouseId));
    const suffix = query.size > 0 ? `?${query.toString()}` : '';
    return apiRequest<SupplyOrder[]>({ path: `/supply-orders${suffix}` });
  },
  create: (payload: unknown) =>
    apiRequest<SupplyOrder>({
      path: '/supply-orders',
      method: 'POST',
      body: buildJsonBody(payload),
    }),
  update: (orderId: number, payload: SupplyOrderPatch) =>
    apiRequest<SupplyOrder>({
      path: `/supply-orders/${orderId}`,
      method: 'PATCH',
      body: buildJsonBody(payload),
    }),
  items: (orderId: number) => apiRequest<SupplyOrderItem[]>({ path: `/supply-orders/${orderId}/items` }),
  addItem: (orderId: number, payload: unknown) =>
    apiRequest<SupplyOrderItem>({
      path: `/supply-orders/${orderId}/items`,
      method: 'POST',
      body: buildJsonBody(payload),
    }),
  updateItem: (orderId: number, itemId: number, payload: SupplyOrderItemPatch) =>
    apiRequest<SupplyOrderItem>({
      path: `/supply-orders/${orderId}/items/${itemId}`,
      method: 'PATCH',
      body: buildJsonBody(payload),
    }),
};

export const appointmentsApi = {
  list: (params?: { from?: string; to?: string; type?: AppointmentType; warehouseId?: number }) => {
    const query = new URLSearchParams();
    if (params?.from) query.append('from', params.from);
    if (params?.to) query.append('to', params.to);
    if (params?.type) query.append('type', params.type);
    if (params?.warehouseId) query.append('warehouseId', String(params.warehouseId));
    const suffix = query.size > 0 ? `?${query.toString()}` : '';
    return apiRequest<Appointment[]>({ path: `/appointments/me${suffix}` });
  },
  create: (payload: unknown) =>
    apiRequest<Appointment>({ path: '/appointments', method: 'POST', body: buildJsonBody(payload) }),
  update: (appointmentId: number, payload: AppointmentPatch) =>
    apiRequest<Appointment>({
      path: `/appointments/${appointmentId}`,
      method: 'PATCH',
      body: buildJsonBody(payload),
    }),
};

export const adminAppointmentsApi = {
  list: (params?: { from?: string; to?: string; type?: AppointmentType; warehouseId?: number }) => {
    const query = new URLSearchParams();
    if (params?.from) query.append('from', params.from);
    if (params?.to) query.append('to', params.to);
    if (params?.type) query.append('type', params.type);
    if (params?.warehouseId) query.append('warehouseId', String(params.warehouseId));
    const suffix = query.size > 0 ? `?${query.toString()}` : '';
    return apiRequest<Appointment[]>({ path: `/appointments${suffix}` });
  },
};

export const menuApi = {
  createMenu: () =>
    apiRequest<Menu>({
      path: '/menus',
      method: 'POST',
    }),
  getMenu: () => apiRequest<Menu>({ path: '/menus/me' }),
  updateMenu: (payload: MenuPatch) =>
    apiRequest<Menu>({ path: '/menus/me', method: 'PATCH', body: buildJsonBody(payload) }),
  listItems: () => apiRequest<MenuItem[]>({ path: '/menus/me/items' }),
  createItem: (payload: MenuItemCreate) =>
    apiRequest<MenuItem>({ path: '/menus/me/items', method: 'POST', body: buildJsonBody(payload) }),
  updateItem: (itemId: number, payload: MenuItemPatch) =>
    apiRequest<MenuItem>({
      path: `/menus/me/items/${itemId}`,
      method: 'PATCH',
      body: buildJsonBody(payload),
    }),
  deleteItem: (itemId: number) =>
    apiRequest<void>({ path: `/menus/me/items/${itemId}`, method: 'DELETE', parseJson: false }),
};

export const loyaltyCardsApi = {
  list: () => apiRequest<LoyaltyCard[]>({ path: '/loyalty-cards' }),
  create: (payload: unknown) =>
    apiRequest<LoyaltyCard>({ path: '/loyalty-cards', method: 'POST', body: buildJsonBody(payload) }),
  searchByCode: (code: string) => apiRequest<LoyaltyCard>({ path: `/loyalty-cards?code=${encodeURIComponent(code)}` }),
  getById: (cardId: number) => apiRequest<LoyaltyCard>({ path: `/loyalty-cards/${cardId}` }),
};

export const customerOrdersApi = {
  list: () => apiRequest<CustomerOrder[]>({ path: '/customer-orders' }),
  get: (orderId: number) => apiRequest<CustomerOrder>({ path: `/customer-orders/${orderId}` }),
  create: (payload: unknown) =>
    apiRequest<CustomerOrder>({ path: '/customer-orders', method: 'POST', body: buildJsonBody(payload) }),
  update: (orderId: number, payload: CustomerOrderPatch) =>
    apiRequest<CustomerOrder>({
      path: `/customer-orders/${orderId}`,
      method: 'PATCH',
      body: buildJsonBody(payload),
    }),
  items: (orderId: number) => apiRequest<CustomerOrderItem[]>({ path: `/customer-orders/${orderId}/items` }),
  addItem: (orderId: number, payload: unknown) =>
    apiRequest<CustomerOrderItem>({
      path: `/customer-orders/${orderId}/items`,
      method: 'POST',
      body: buildJsonBody(payload),
    }),
  removeItem: (orderId: number, itemId: number) =>
    apiRequest<void>({
      path: `/customer-orders/${orderId}/items/${itemId}`,
      method: 'DELETE',
      parseJson: false,
    }),
};

export const salesApi = {
  list: (params: { from?: string; to?: string; menuItemId?: number }) => {
    const query = new URLSearchParams();
    if (params.from) query.append('from', params.from);
    if (params.to) query.append('to', params.to);
    if (params.menuItemId) query.append('menuItemId', String(params.menuItemId));
    const suffix = query.size > 0 ? `?${query.toString()}` : '';
    return apiRequest<Sale[]>({ path: `/sales/me${suffix}` });
  },
};

export const revenuesApi = {
  list: (params: { from?: string; to?: string; granularity?: string }) => {
    const query = new URLSearchParams();
    if (params.from) query.append('from', params.from);
    if (params.to) query.append('to', params.to);
    if (params.granularity) query.append('granularity', params.granularity);
    const suffix = query.size > 0 ? `?${query.toString()}` : '';
    return apiRequest<RevenuePoint[]>({ path: `/revenues/me${suffix}` });
  },
};

export const reportsApi = {
  requestMyReport: (payload: ReportRequest) => downloadReport(payload, '/reports/me'),
};

export const adminReportsApi = {
  requestReport: (payload: ReportRequest) => downloadReport(payload, '/reports'),
};

export const trucksApi = {
  getMine: () => apiRequest<Truck>({ path: '/trucks/me' }),
  listIncidents: (truckId: number) => apiRequest<Incident[]>({ path: `/trucks/${truckId}/incidents` }),
  createIncident: (truckId: number, payload: IncidentCreatePayload) =>
    apiRequest<Incident>({ path: `/trucks/${truckId}/incidents`, method: 'POST', body: buildJsonBody(payload) }),
  updateIncident: (incidentId: number, payload: IncidentPatch) =>
    apiRequest<Incident>({ path: `/incidents/${incidentId}`, method: 'PATCH', body: buildJsonBody(payload) }),
  getIncident: (incidentId: number) => apiRequest<Incident>({ path: `/incidents/${incidentId}` }),
  getMaintenanceRecords: (truckId: number) =>
    apiRequest<MaintenanceRecord[]>({ path: `/trucks/${truckId}/maintenance-records` }),
  getById: (truckId: number) => apiRequest<Truck>({ path: `/trucks/${truckId}` }),
};

export const adminTrucksApi = {
  list: () => apiRequest<Truck[]>({ path: '/trucks' }),
  create: (payload: TruckCreatePayload) =>
    apiRequest<Truck>({ path: '/trucks', method: 'POST', body: buildJsonBody(payload) }),
  update: (truckId: number, payload: TruckPatch) =>
    apiRequest<Truck>({ path: `/trucks/${truckId}`, method: 'PATCH', body: buildJsonBody(payload) }),
};

export const adminSupplyOrdersApi = {
  listConfirmed: () =>
    apiRequest<SupplyOrder[]>({ path: '/supply-orders?status=CONFIRMED' }),
  update: (orderId: number, payload: SupplyOrderPatch) =>
    apiRequest<SupplyOrder>({ path: `/supply-orders/${orderId}`, method: 'PATCH', body: buildJsonBody(payload) }),
};

export const adminIncidentsApi = {
  list: () => apiRequest<Incident[]>({ path: '/incidents' }),
  resolve: (incidentId: number, payload: IncidentPatch) =>
    apiRequest<Incident>({ path: `/incidents/${incidentId}`, method: 'PATCH', body: buildJsonBody(payload) }),
};

export const adminMaintenanceApi = {
  create: (truckId: number, payload: MaintenanceRecordCreatePayload) =>
    apiRequest<MaintenanceRecord>({ path: `/trucks/${truckId}/maintenance-records`, method: 'POST', body: buildJsonBody(payload) }),
};
