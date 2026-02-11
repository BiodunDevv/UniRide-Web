import { getDeviceFingerprint } from "@/lib/deviceDetection";

/**
 * Generate or retrieve a unique device ID for this browser/device
 * Now uses FingerprintJS for more reliable device identification
 */
export async function getDeviceId(): Promise<string> {
  const DEVICE_ID_KEY = "uniride_device_id";

  // Check if device ID already exists in localStorage
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);

  if (!deviceId) {
    // Generate a new device ID using fingerprint
    deviceId = await generateDeviceId();
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }

  return deviceId;
}

/**
 * Generate a unique device ID using FingerprintJS
 */
async function generateDeviceId(): Promise<string> {
  try {
    // Use FingerprintJS for reliable fingerprinting
    const fingerprint = await getDeviceFingerprint();
    return fingerprint;
  } catch (error) {
    console.error("Failed to generate fingerprint, using fallback:", error);
    // Fallback to old method if fingerprinting fails
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 15);
    const browserInfo = navigator.userAgent
      .replace(/\s+/g, "")
      .substring(0, 20);
    return `${timestamp}-${randomStr}-${btoa(browserInfo).substring(0, 10)}`;
  }
}

/**
 * Clear device ID (useful for logout)
 */
export function clearDeviceId(): void {
  const DEVICE_ID_KEY = "uniride_device_id";
  localStorage.removeItem(DEVICE_ID_KEY);
}
