import type { Detector } from "../types";
import { detectLinkRisk } from "./link";
import { detectIdentityRisk } from "./identity";
import { detectPressureRisk } from "./pressure";
import { detectDataRequestRisk } from "./dataRequest";
import { detectPaymentRisk } from "./payment";
import { detectLanguageRisk } from "./language";
import { detectContextRisk } from "./context";

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
