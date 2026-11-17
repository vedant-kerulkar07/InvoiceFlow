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


// import Invoice from "../models/Invoice.model.js";
// import Counter from "../models/Counter.model.js";

// export const generateInvoiceNumber = async () => {
//   const year = new Date().getFullYear();
//   const prefix = `INV-${year}-`;
//   const counterId = `invoice-${year}`;

//   // First use only: start the counter from the highest existing invoice,
//   // so it never collides with invoices that already exist.
//   const exists = await Counter.exists({ _id: counterId });
//   if (!exists) {
//     const last = await Invoice.findOne({
//       invoiceNumber: { $regex: `^${prefix}` },
//     }).sort({ invoiceNumber: -1 });

//     const start = last ? parseInt(last.invoiceNumber.split("-")[2], 10) : 0;

//     try {
//       await Counter.create({ _id: counterId, seq: start });
//     } catch (err) {
//       if (err.code !== 11000) throw err; // another request created it first: fine
//     }
//   }

//   // Atomic: each call gets a different number, even under concurrency.
//   const counter = await Counter.findOneAndUpdate(
//     { _id: counterId },
//     { $inc: { seq: 1 } },
//     { new: true }
//   );

//   return `${prefix}${String(counter.seq).padStart(3, "0")}`;
// };