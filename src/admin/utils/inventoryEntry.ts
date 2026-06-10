import type {
  InventoryBatch,
  InventoryBatchRequest,
} from "../../services/inventoryBatchService";

export interface InventoryEntryFormValues {
  productId: string;
  farmId: string;
  batchCode: string;
  quantity: string;
  importDate: string;
  expiryDate: string;
  costPrice: string;
}

export interface InventoryProductStock {
  productId: number;
  productName: string;
  quantity: number;
  batchCount: number;
  expiredCount: number;
}

export const buildInventoryProductStock = (
  products: Array<{ id: string; name: string }>,
  batches: InventoryBatch[],
): InventoryProductStock[] => {
  const map = new Map<number, InventoryProductStock>();

  products.forEach((product) => {
    const productId = Number(product.id);
    if (!Number.isFinite(productId)) return;
    map.set(productId, {
      productId,
      productName: product.name,
      quantity: 0,
      batchCount: 0,
      expiredCount: 0,
    });
  });

  batches.forEach((batch) => {
    const current = map.get(batch.productId) || {
      productId: batch.productId,
      productName: batch.productName,
      quantity: 0,
      batchCount: 0,
      expiredCount: 0,
    };
    current.quantity += Number(batch.quantityRemaining || 0);
    current.batchCount += 1;
    current.expiredCount += batch.expired ? 1 : 0;
    map.set(batch.productId, current);
  });

  return [...map.values()].sort((a, b) => a.quantity - b.quantity || a.productName.localeCompare(b.productName));
};

export const createInventoryBatchPayload = (
  values: InventoryEntryFormValues,
): InventoryBatchRequest => {
  const quantity = Number(values.quantity);
  const costPrice = values.costPrice.trim() ? Number(values.costPrice) : undefined;

  return {
    productId: Number(values.productId),
    farmId: Number(values.farmId),
    batchCode: values.batchCode.trim(),
    quantityInitial: quantity,
    quantityRemaining: quantity,
    importDate: values.importDate,
    expiryDate: values.expiryDate,
    ...(costPrice === undefined ? {} : { costPrice }),
  };
};
