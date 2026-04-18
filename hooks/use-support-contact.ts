"use client";

import { useEffect, useMemo, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const DEFAULT_SUPPORT_EMAIL = "support@uniride.ng";
const DEFAULT_SUPPORT_PHONE = "+234 (0) 800-UNIRIDE";

function normalizePhoneForTel(phone: string): string {
  const raw = String(phone || "").trim();
  if (!raw) return "";

  const hasPlusPrefix = raw.startsWith("+");
  const digitsOnly = raw.replace(/\D/g, "");
  if (!digitsOnly) return "";

  return `${hasPlusPrefix ? "+" : ""}${digitsOnly}`;
}

export function useSupportContact() {
  const [supportEmail, setSupportEmail] = useState(DEFAULT_SUPPORT_EMAIL);
  const [supportPhone, setSupportPhone] = useState(DEFAULT_SUPPORT_PHONE);

  useEffect(() => {
    if (!API_URL) return;

    const controller = new AbortController();

    fetch(`${API_URL}/api/platform-settings`, {
      signal: controller.signal,
      cache: "no-store",
    })
      .then(async (response) => {
        if (!response.ok) return null;
        return response.json();
      })
      .then((payload) => {
        const settings = payload?.data;
        if (!settings || typeof settings !== "object") return;

        const nextEmail = String(settings.support_email || "").trim();
        const nextPhone = String(settings.support_phone || "").trim();

        if (nextEmail) setSupportEmail(nextEmail);
        if (nextPhone) setSupportPhone(nextPhone);
      })
      .catch(() => {
        // Fall back to defaults if request fails.
      });

    return () => controller.abort();
  }, []);

  const supportMailto = useMemo(() => `mailto:${supportEmail}`, [supportEmail]);
  const supportTel = useMemo(() => {
    const normalized = normalizePhoneForTel(supportPhone);
    return normalized ? `tel:${normalized}` : "";
  }, [supportPhone]);

  return {
    supportEmail,
    supportPhone,
    supportMailto,
    supportTel,
  };
}
