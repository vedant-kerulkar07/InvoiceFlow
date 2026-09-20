import Invoice from "../models/Invoice.model.js";

export const updateOverdueInvoices = async (userId) => {
  const now = new Date();

  await Invoice.updateMany(
    {
      user: userId,
      status: "Unpaid",
      dueDate: { $lt: now },
    },
    {
      $set: {
        status: "Overdue",
      },
    }
  );
};