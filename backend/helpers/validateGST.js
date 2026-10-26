
export const validateGST = (gstNumber) => {
  // GST number is optional
  if (!gstNumber || !gstNumber.trim()) {
    return { valid: true };
  }

  const gst = gstNumber.trim().toUpperCase();

  // Validate the 15-character GSTIN format
  const gstRegex =
    /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

  if (!gstRegex.test(gst)) {
    return {
      valid: false,
      message:
        "Invalid GST number. Please enter a valid 15-character GSTIN.",
    };
  }

  return {
    valid: true,
    value: gst,
  };
};
