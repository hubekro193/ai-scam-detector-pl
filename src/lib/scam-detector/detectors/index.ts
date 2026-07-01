import type { Detector } from "../types.js";
import { detectLinkRisk } from "./link.js";
import { detectIdentityRisk } from "./identity.js";
import { detectPressureRisk } from "./pressure.js";
import { detectDataRequestRisk } from "./dataRequest.js";
import { detectPaymentRisk } from "./payment.js";
import { detectLanguageRisk } from "./language.js";
import { detectContextRisk } from "./context.js";

/** All seven category detectors, run independently against the same message. */
export const ALL_DETECTORS: Detector[] = [
  detectLinkRisk,
  detectIdentityRisk,
  detectPressureRisk,
  detectDataRequestRisk,
  detectPaymentRisk,
  detectLanguageRisk,
  detectContextRisk,
];

export {
  detectLinkRisk,
  detectIdentityRisk,
  detectPressureRisk,
  detectDataRequestRisk,
  detectPaymentRisk,
  detectLanguageRisk,
  detectContextRisk,
};
