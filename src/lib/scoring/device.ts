import { clampScore } from "@/lib/utils/helpers";

interface NavigatorUserAgentBrand {
  brand: string;
  version: string;
}

interface NavigatorWithUserAgentData extends Navigator {
  userAgentData?: {
    brands?: NavigatorUserAgentBrand[];
    platform?: string;
  };
}

export interface DeviceFingerprint {
  fingerprintHash: string;
  browser: string;
  os: string;
  screenResolution: string;
  timezone: string;
  language: string;
  webglHash: string;
  canvasHash: string;
  userAgent: string;
  isBot: boolean;
  metadata: Record<string, unknown>;
}

async function hashValue(value: string) {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((item) => item.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 32);
}

export async function collectDeviceFingerprint(): Promise<DeviceFingerprint> {
  const navigatorWithUserAgentData = navigator as NavigatorWithUserAgentData;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  context?.fillText(navigator.userAgent, 10, 20);
  const canvasHash = await hashValue(canvas.toDataURL());

  const webglCanvas = document.createElement("canvas");
  const gl = webglCanvas.getContext("webgl");
  const webglRaw =
    gl?.getParameter(gl.VENDOR) +
      ":" +
      gl?.getParameter(gl.RENDERER) +
      ":" +
      gl?.getSupportedExtensions()?.join(",") || "unknown";
  const webglHash = await hashValue(webglRaw);

  const metadata = {
    colorDepth: window.screen.colorDepth,
    deviceMemory: (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? null,
    hardwareConcurrency: navigator.hardwareConcurrency,
    touchSupport: navigator.maxTouchPoints > 0,
    plugins: Array.from(navigator.plugins).map((plugin) => plugin.name).slice(0, 8),
  };

  const fingerprintSource = [
    navigator.userAgent,
    window.screen.width,
    window.screen.height,
    timezone,
    navigator.language,
    canvasHash,
    webglHash,
    metadata.deviceMemory,
    metadata.hardwareConcurrency,
    metadata.touchSupport,
  ].join("|");

  return {
    fingerprintHash: await hashValue(fingerprintSource),
    browser: navigatorWithUserAgentData.userAgentData?.brands?.map((item) => item.brand).join(", ") || "Unknown",
    os: navigatorWithUserAgentData.userAgentData?.platform || "Unknown",
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    timezone,
    language: navigator.language,
    webglHash,
    canvasHash,
    userAgent: navigator.userAgent,
    isBot: /Headless|PhantomJS|puppeteer/i.test(navigator.userAgent),
    metadata,
  };
}

export function scoreDeviceRisk(input: {
  isBot: boolean;
  isBlacklisted?: boolean;
  deviceAgeHours?: number;
  accountsSeen?: number;
}) {
  let score = 0;
  const reasons: string[] = [];

  if (input.isBlacklisted) {
    score += 70;
    reasons.push("Device fingerprint is blacklisted.");
  }

  if (input.isBot) {
    score += 45;
    reasons.push("Bot or automation signals detected.");
  }

  if ((input.deviceAgeHours ?? 999) < 24) {
    score += 20;
    reasons.push("Device first seen within the last 24 hours.");
  }

  if ((input.accountsSeen ?? 0) > 3) {
    score += 18;
    reasons.push("Multiple accounts observed on the same device.");
  }

  return {
    score: clampScore(score),
    reasons,
  };
}
