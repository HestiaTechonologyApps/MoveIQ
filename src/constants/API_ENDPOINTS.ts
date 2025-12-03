//API_ENDPOINTS.ts
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'https://tripapi.hestiatechnology.com/api';

export const API_ENDPOINTS = {
  CUSTOMER: {
    GET_ALL: `${API_BASE_URL}/Customer`,
    GET_BY_ID: (id: number) => `${API_BASE_URL}/Customer/${id}`,
    CREATE: `${API_BASE_URL}/Customer`,
    UPDATE: (id: number) => `${API_BASE_URL}/Customer/${id}`,
    DELETE: (id: number) => `${API_BASE_URL}/Customer/${id}`,
  },
  CUSTOMERDEPARTMENT :{
    GET_ALL:`${API_BASE_URL}/CustomerDepartment`
  },

  DRIVER: {
    GET_ALL: `${API_BASE_URL}/Driver/GetAll`,
    GET_BY_ID: (id: number) => `${API_BASE_URL}/Driver/GetById/${id}`, // ✅ Fixed double slash
    CREATE: `${API_BASE_URL}/Driver/Create`,
    UPDATE: (id: number) => `${API_BASE_URL}/Driver/Update/${id}`,
    DELETE: (id: number) => `${API_BASE_URL}/Driver/Delete/${id}`,
    UPLOAD_PROFILE_PIC: `${API_BASE_URL}/Driver/UploadProfilePic/upload-profile-pic`,
  },

  TRIP: {
    GET_ALL: `${API_BASE_URL}/TripOrder/GetAll`,
    GET_ALL_TRIPLIST: `${API_BASE_URL}/TripOrder/GetAllTripList`,
    GET_BY_ID: (id: number) => `${API_BASE_URL}/TripOrder/${id}`,
    CREATE: `${API_BASE_URL}/TripOrder`,
    UPDATE: (id: number) => `${API_BASE_URL}/TripOrder/${id}`,
    UPDATESTATUS: `${API_BASE_URL}/TripOrder/UpdateTripStatus`,
    DELETE: (id: number) => `${API_BASE_URL}/TripOrder/${id}`,
    GET_ALL_BY_STATUS: (status: string) =>
      `${API_BASE_URL}/TripOrder/GetAllTripListbyStatus?status=${encodeURIComponent(status)}`,
    GET_ALL_BY_YEAR: (year: number) =>
      `${API_BASE_URL}/TripOrder/GetAllTripLists?year=${year}`,
    GET_CANCELLED_TRIPS: `${API_BASE_URL}/TripOrder/CancelTrip`,
    GET_SCHEDULED_TRIPS: `${API_BASE_URL}/TripOrder/GetAllTripListbyStatus?status=Scheduled`,
    GET_COMPLETED_TRIPS: `${API_BASE_URL}/TripOrder/GetAllTripListbyStatus?status=Completed`,
    GET_BookingMode_TRIPS: `${API_BASE_URL}/TripBookingMode`,
  },

  TRIP_DASHBOARD: {
    GET_DASHBOARD: (year: number) => `${API_BASE_URL}/TripDashboard/GetTripDashboard?year=${year}`,
    GET_TODAYS_TRIP: `${API_BASE_URL}/TripDashboard/today`,
    GET_MONTHLY_SUMMARY: (year: number) => `${API_BASE_URL}/TripDashboard/monthly-summary?year=${year}`
  },

  AUDIT_LOG: {
    GET_BY_TABLE_AND_ID: (tableName: string, recordId: number) =>
      `${API_BASE_URL}/AuditLog/${tableName}/${recordId}`,
    GET_BY_ID: (logID: string) => `${API_BASE_URL}/AuditLog/GetById/${logID}`,
  },

  DASHBOARD: {
    GET_MONTHLY_FINANCIAL: (year: number) => `${API_BASE_URL}/TripDashboard/monthly-financial/${year}`,
    GET_MONTHLY_TRIP_COUNT: (year: number) => `${API_BASE_URL}/TripDashboard/monthly-trip-count/${year}`,
    GET_VEHICLE_STATUS: () => `${API_BASE_URL}/TripDashboard/vehicle-status`,
    GET_EXPENSE_CATEGORIES: (year?: number) => year ? `${API_BASE_URL}/TripDashboard/expense-categories/${year}` : `${API_BASE_URL}/TripDashboard/expense-categories`,
    GET_DASHBOARD_SUMMARY: (year: number) => `${API_BASE_URL}/TripDashboard/summary/${year}`,
  },

  ATTACHMENT: {
    GET_BY_TABLE_AND_ID: (tableName: string, recordId: number) =>
      `${API_BASE_URL}/Attachment/${tableName}/${recordId}`,
    GET_BY_ID: (attachmentId: number) => `${API_BASE_URL}/Attachment/${attachmentId}`,
    UPLOAD: `${API_BASE_URL}/Attachment/upload`,
    DELETE: (attachmentId: number) => `${API_BASE_URL}/Attachment/${attachmentId}`,
    GET: `${API_BASE_URL}/Attachment`,
    DOWNLOAD: (attachmentId: number) => `${API_BASE_URL}/Attachment/download/${attachmentId}`,
  },

  USER: {
    GET_ALL: `${API_BASE_URL}/User`,
    GET_BY_ID: (id: number) => `${API_BASE_URL}/User/${id}`,
    CREATE: `${API_BASE_URL}/User`,
    UPDATE: (id: number) => `${API_BASE_URL}/User/${id}`,
    DELETE: (id: number) => `${API_BASE_URL}/User/${id}`,
    CHANGE_PASSWORD: `${API_BASE_URL}/User/ChangePassWord`
  },

  COMPANY: {
    GET_ALL: `${API_BASE_URL}/Company/GetAll/admin-getall-company`,
    GET_BY_ID: (id: number) => `${API_BASE_URL}/Company/GetById/${id}`,
    CREATE: `${API_BASE_URL}/Company/Create`,
    UPDATE: (id: number) => `${API_BASE_URL}/Company/Update/${id}`,
    DELETE: (id: number) => `${API_BASE_URL}/Company/Delete/${id}`,
  },

  TRIP_NOTES: {
    GET_ALL: `${API_BASE_URL}/TripOrder/GetTripNotes`,
    GET_BY_ID: (id: number) => `${API_BASE_URL}/TripOrder/GetTripNotespfTrip/${id}`,
    CREATE: `${API_BASE_URL}/TripOrder/CreateTripNotes`,
  },

  TRIP_KILOMETER: {
    GET_ALL: `${API_BASE_URL}/TripkiloMeter`,
    GET_BY_ID: (id: number) => `${API_BASE_URL}/TripkiloMeter/${id}`,
    GET_BY_TRIP_ID: `${API_BASE_URL}/TripkiloMeter/GetTripKilometerOfTrip`,
    CREATE: `${API_BASE_URL}/TripkiloMeter`,
    UPDATE: (id: number) => `${API_BASE_URL}/TripkiloMeter/${id}`,
    DELETE: (id: number) => `${API_BASE_URL}/TripkiloMeter/${id}`,
  },

  AUTH: {
    LOGIN: `${API_BASE_URL}/Auth/login`,
    LOGOUT: `${API_BASE_URL}/Auth/logout`,
    CHANGE_PASSWORD: `${API_BASE_URL}/Auth/change-password`,
    FORGOT_PASSWORD: `${API_BASE_URL}/Auth/forgot-password`,
  },

  INVOICE_MASTER: {
    GET_ALL: `${API_BASE_URL}/InvoiceMaster`,
    GET_BY_ID: (id: number) => `${API_BASE_URL}/InvoiceMaster/${id}`,
    CREATE: `${API_BASE_URL}/InvoiceMaster`,
    UPDATE: (id: number) => `${API_BASE_URL}/InvoiceMaster/${id}`,
    DELETE: (id: number) => `${API_BASE_URL}/InvoiceMaster/${id}`,
  },

  INVOICE_DASHBOARD : {
     GET_ALL: (year: number) => `${API_BASE_URL}/InvoiceDashboard/GetInvoiceDashboard?year=${year}`,
  },

  EXPENSE_TYPE: {
    GET_ALL: `${API_BASE_URL}/ExpenseType`,
    GET_BY_ID: (id: number) => `${API_BASE_URL}/ExpenseType/${id}`,
    CREATE: `${API_BASE_URL}/ExpenseType`,
    UPDATE: (id: number) => `${API_BASE_URL}/ExpenseType/${id}`,
    DELETE: (id: number) => `${API_BASE_URL}/ExpenseType/${id}`,
  },

  EXPENSE_MASTER: {
    GET_ALL: `${API_BASE_URL}/ExpenseMaster`,
    GET_BY_ID: (id: number) => `${API_BASE_URL}/ExpenseMaster/${id}`,
    CREATE: `${API_BASE_URL}/ExpenseMaster`,
    UPDATE: (id: number) => `${API_BASE_URL}/ExpenseMaster/${id}`,
    DELETE: (id: number) => `${API_BASE_URL}/ExpenseMaster/${id}`,
    GET_BY_TABLE_AND_RECORD: (tableName: string, recordId: number) =>
      `${API_BASE_URL}/ExpenseMaster/${tableName}/${recordId}`,
  },

  VEHICLE: {
    GET_ALL: `${API_BASE_URL}/Vehicle`,
    GET_BY_ID: (id: number) => `${API_BASE_URL}/Vehicle/${id}`,
    CREATE: `${API_BASE_URL}/Vehicle`,
    UPDATE: (id: number) => `${API_BASE_URL}/Vehicle/${id}`,
    DELETE: (id: number) => `${API_BASE_URL}/Vehicle/${id}`,
  },

  VEHICLE_MAINTENANCE: {
    GET_ALL: `${API_BASE_URL}/VehicleMaintenanceRecord`,
    GET_BY_ID: (id: number) => `${API_BASE_URL}/VehicleMaintenanceRecord/${id}`,
    CREATE: `${API_BASE_URL}/VehicleMaintenanceRecord`,
    UPDATE: (id: number) => `${API_BASE_URL}/VehicleMaintenanceRecord/${id}`,
    DELETE: (id: number) => `${API_BASE_URL}/VehicleMaintenanceRecord/${id}`,
  },

  SERVER_SIDE_TRIP: {
    GET_PAGINATED: `${API_BASE_URL}/Api_PaginatedListData/trips-paginated`
  },
  SERVER_SIDE_INVOICE: {
    GET_PAGINATED_INVOICE: `${API_BASE_URL}/Api_PaginatedListData/invoice-paginated`
  },

  COMMENT: {
    GET_BY_TABLE_AND_ID: (tableName: string, recordId: number) =>
      `${API_BASE_URL}/Comment/${tableName}/${recordId}`,
    CREATE: `${API_BASE_URL}/Comment/AddComment`,
    DELETE: (CommentId: number, deletedBy: string) =>
      `${API_BASE_URL}/Comment/${CommentId}?deletedBy=${deletedBy}`,
  },
};

// ✅ Helper function to get full image URL
export const getFullImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) return '';

  // If already a complete URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // Otherwise, prepend API base URL
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://tripapi.hestiatechnology.com/api';

  // Remove '/api' from base URL if present since image paths start with /
  const cleanBaseUrl = baseUrl.replace('/api', '');

  // Ensure proper path construction
  return `${cleanBaseUrl}${imagePath}`;
};