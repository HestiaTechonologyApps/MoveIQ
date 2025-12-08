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
  tripOrderId: number;
  categoryId: number;
  ammount: number;
  totalTax: number;
  discount: number;
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
