// src/types/InvoiceMaster.types.ts

export interface InvoiceDashboardCard {
  title?: string;
  value?: number;
  change?: number;
  color?: string;
  route?: string;
  date?: string | null;
}

// src/types/Invoice.types.ts

export interface InvoiceDetailDto {
  invoiceDetailId: number;
  invoicemasterId: number;
   invoiceMasterId?: number;
  tripOrderId: number;
  categoryId: number;
  ammount: number;
  totalTax: number;
  discount: number;
}

// ===================== DETAIL (USED FOR UPDATE REQUEST) =====================
export interface InvoiceDetailUpdate {
  invoiceDetailId?: number;
  invoiceMasterId?: number;
  tripOrderId?: number;
  categoryId?: number;
  ammount?: number;
  totalTax?: number;
  discount?: number;

  // Update API requires these:
  totalDiscount?: number;
  invoiceMaster?: [];
  invoiceDetailTaxes?: {
    invoiceDetailTaxId?: number;
    invoiceDetailId?: number;
    categoryTaxId?: number;
    categoryTaxPercentage?: number;
    taxAmount?: number;
  }[];
}


export interface InvoiceMaster {
  invoicemasterId: number;
   invoiceMasterId?:number;
  invoiceNum: string;
  invoiceDate: string;
  financialYearId: number;
  companyId: number;
  customerId: number;
  companyName: string;
  customerName: string;
  totalAmount: number;
  isCompleted: boolean;
  createdOn: string;
  createdOnString?:string;
  createdBy: string;
  isDeleted: boolean;
  invoiceDetailDtos: InvoiceDetailDto[];
}

export interface GenerateInvoiceRequest {
  tripOrderIds: number[];
  customerId: number;
}


export interface CreateInvoiceRequest {
  invoicemasterId: number;
  invoiceMasterId?:number
  invoiceNum: string;
  invoiceDate: string;
  financialYearId: number;
  companyId: number;
  customerId: number;
  companyName: string;
  customerName: string;
  totalAmount: number;
  isCompleted: boolean;
  createdOn: string;
  createdOnString?:string;
  createdBy: string;
  isDeleted: boolean;
  invoiceDetailDtos: InvoiceDetailDto[];
}

// ===================== UPDATE INVOICE REQUEST =====================
export interface UpdateInvoiceRequest {
  invoiceMasterId?: number;
  invoiceNum?: string;

  financialYearId?: number;
  companyId?: number;
  customerId?: number;
  totalAmount?: number;

  invoiceDate?: string;
  createdOn?: string;

  isDeleted?: boolean;
  isCompleted?: boolean;

  // UPDATE uses extended details array
  invoiceDetails?: InvoiceDetailUpdate[];
}