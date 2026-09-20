import Invoice from "../models/Invoice.model.js";

export const generateInvoiceNumber = async () => {
  const year = new Date().getFullYear();

  const prefix = `INV-${year}-`;

  const lastInvoice = await Invoice.findOne({
    invoiceNumber: {
      $regex: `^${prefix}`,
    },
  }).sort({
    invoiceNumber: -1,
  });

  let nextNumber = 1;

  if (lastInvoice) {
    const lastNumber = parseInt(
      lastInvoice.invoiceNumber.split("-")[2],
      10
    );

    nextNumber = lastNumber + 1;
  }

  return `${prefix}${String(nextNumber).padStart(3, "0")}`;
};