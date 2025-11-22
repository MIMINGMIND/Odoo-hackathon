export type InventoryDocumentType =
  | 'RECEIPT'
  | 'DELIVERY'
  | 'INTERNAL_TRANSFER'
  | 'ADJUSTMENT';

export type DocumentStatus =
  | 'DRAFT'
  | 'WAITING'
  | 'READY'
  | 'DONE'
  | 'CANCELED';

export type LocationType = 'BIN' | 'RACK' | 'STAGING' | 'PRODUCTION' | 'OTHER';

export type UOM = 'PCS' | 'KG' | 'LITER' | 'BOX' | 'SET' | 'METER'; // extend as needed
