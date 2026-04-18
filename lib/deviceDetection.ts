import FingerprintJS from "@fingerprintjs/fingerprintjs";

export interface DeviceInfo {
  name: string;
  type: "mobile" | "tablet" | "desktop" | "other";
  browser: string;
  os: string;
}

export function getDeviceInfo(userAgent?: string): DeviceInfo {
  const ua =
    userAgent || (typeof navigator !== "undefined" ? navigator.userAgent : "");

  let os = "Unidentified OS";
  if (/Windows NT 10/i.test(ua)) {
    os = "Windows 10";
  } else if (/Windows NT 11/i.test(ua)) {
    os = "Windows 11";
  } else if (/Windows/i.test(ua)) {
    os = "Windows";
  } else if (/Mac OS X 10[._](\d+)/i.test(ua)) {
    const match = ua.match(/Mac OS X 10[._](\d+)/i);
    os = match ? `macOS 10.${match[1]}` : "macOS";
  } else if (/Mac OS X/i.test(ua)) {
    os = "macOS";
  } else if (/Android (\d+)/i.test(ua)) {
    const match = ua.match(/Android (\d+)/i);
    os = match ? `Android ${match[1]}` : "Android";
  } else if (/iPhone OS (\d+)[._](\d+)/i.test(ua)) {
    const match = ua.match(/iPhone OS (\d+)[._](\d+)/i);
    os = match ? `iOS ${match[1]}.${match[2]}` : "iOS";
  } else if (/iPad.*OS (\d+)[._](\d+)/i.test(ua)) {
    const match = ua.match(/iPad.*OS (\d+)[._](\d+)/i);
    os = match ? `iPadOS ${match[1]}.${match[2]}` : "iPadOS";
  } else if (/Linux/i.test(ua)) {
    os = "Linux";
  } else if (/CrOS/i.test(ua)) {
    os = "Chrome OS";
  }

  let browser = "Unidentified Browser";
  if (/Edg\//i.test(ua)) {
    browser = "Edge";
  } else if (/Chrome/i.test(ua) && !/Edg/i.test(ua)) {
    browser = "Chrome";
  } else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) {
    browser = "Safari";
  } else if (/Firefox/i.test(ua)) {
    browser = "Firefox";
  } else if (/MSIE|Trident/i.test(ua)) {
    browser = "Internet Explorer";
  } else if (/Opera|OPR/i.test(ua)) {
    browser = "Opera";
  }

  let type: "mobile" | "tablet" | "desktop" | "other" = "desktop";
  if (/Mobile|Android|iPhone/i.test(ua) && !/iPad|Tablet/i.test(ua)) {
    type = "mobile";
  } else if (/iPad|Tablet|PlayBook/i.test(ua)) {
    type = "tablet";
  } else if (/Windows|Macintosh|Linux|CrOS/i.test(ua)) {
    type = "desktop";
  } else {
    type = "other";
  }

  let deviceName = "";

  if (type === "mobile") {
    if (/iPhone/i.test(ua)) {
      deviceName = "iPhone";
    } else if (/Android/i.test(ua)) {
      const modelMatch = ua.match(/Android.*;\s*([^;)]+)\s*(Build|[);])/i);
      if (modelMatch && modelMatch[1]) {
        deviceName = modelMatch[1].trim();
      } else {
        deviceName = "Android Device";
      }
    } else {
      deviceName = "Mobile Device";
    }
  } else if (type === "tablet") {
    if (/iPad/i.test(ua)) {
      deviceName = "iPad";
    } else {
      deviceName = "Tablet";
    }
  } else if (type === "desktop") {
    if (/Windows/i.test(ua)) {
      deviceName = "Windows PC";
    } else if (/Mac/i.test(ua)) {
      deviceName = "Mac";
    } else if (/Linux/i.test(ua)) {
      deviceName = "Linux PC";
    } else if (/CrOS/i.test(ua)) {
      deviceName = "Chromebook";
    } else {
      deviceName = "Desktop";
    }
  } else {
    deviceName = "Unidentified Device";
  }

  const name = `${deviceName} • ${browser}`;

  return {
    name,
    type,
    browser,
    os,
  };
}

export async function getDeviceFingerprint(): Promise<string> {
  try {
    const fp = await FingerprintJS.load();
    const result = await fp.get();
    return result.visitorId;
  } catch (error) {
    console.error("Failed to generate fingerprint:", error);
    return `${navigator.userAgent}-${screen.width}x${screen.height}`;
  }
}

export async function getComprehensiveDeviceInfo(): Promise<
  DeviceInfo & { fingerprint: string }
> {
  const deviceInfo = getDeviceInfo();
  const fingerprint = await getDeviceFingerprint();

  return {
    ...deviceInfo,
    fingerprint,
  };
}
