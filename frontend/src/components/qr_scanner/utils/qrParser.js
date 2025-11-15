export const parseQrData = (decodedText) => {
  try {
    const parsedData = JSON.parse(decodedText);

    if (!parsedData.name || !parsedData.location) {
      throw new Error("Invalid QR data: missing name or location");
    }

    // Handle both array [lat, lng] and object {lat, lng} formats
    const locationData = Array.isArray(parsedData.location)
      ? { lat: parsedData.location[0], lng: parsedData.location[1] }
      : parsedData.location;

    return {
      name: parsedData.name,
      location: locationData,
      address: parsedData.address || "Unknown Address",
      mobile_number: parsedData.mobile_number || "N/A",
      available: parsedData.available || "unknown",
      // Note: customerEmail will be added separately via prompt
    };
  } catch (error) {
    throw new Error(`Failed to parse QR code: ${error.message}`);
  }
};
