// Centralized pricing constants for the entire application
// All pricing information should be imported from this file

export type PlanType = "weekly" | "monthly" | "yearly";
export type PlanInterval = "week" | "month" | "year";

export interface PlanDetails {
  id: PlanType;
  name: string;
  price: number;
  priceInCents: number;
  interval: string;
  intervalShort: string;
  hasTrial: boolean;
  badge: string | null;
  tagline: string;
  description: string;
  monthlyEquivalent?: string;
}

export const PRICING: Record<PlanType, PlanDetails> = {
  weekly: {
    id: "weekly",
    name: "Hebdomadaire",
    price: 6.99,
    priceInCents: 699,
    interval: "semaine",
    intervalShort: "sem",
    hasTrial: false,
    badge: null,
    tagline: "Flexibilité maximale",
    description: "Pour tester sans s'engager, avancer à ton rythme ou utiliser Pulse sur une période courte.",
  },
  monthly: {
    id: "monthly",
    name: "Mensuel",
    price: 14.99,
    priceInCents: 1499,
    interval: "mois",
    intervalShort: "mois",
    hasTrial: true,
    badge: "Populaire",
    tagline: "Le meilleur équilibre",
    description: "Progressez durablement avec un suivi continu et des ajustements hebdomadaires.",
  },
  yearly: {
    id: "yearly",
    name: "Annuel",
    price: 149.99,
    priceInCents: 14999,
    interval: "an",
    intervalShort: "an",
    hasTrial: true,
    badge: "Meilleur prix",
    tagline: "Économies maximales",
    description: "L'engagement favorise la régularité. 2 mois offerts par rapport au mensuel.",
    monthlyEquivalent: "12,49€/mois",
  },
};

// Maps Stripe price_interval to our PlanType
export const intervalToPlanType = (interval: PlanInterval | null): PlanType => {
  switch (interval) {
    case "week": return "weekly";
    case "month": return "monthly";
    case "year": return "yearly";
    default: return "monthly";
  }
};

// Maps PlanType to Stripe price_interval
export const planTypeToInterval = (planType: PlanType): PlanInterval => {
  switch (planType) {
    case "weekly": return "week";
    case "monthly": return "month";
    case "yearly": return "year";
  }
};

// Format price for display (e.g., 14.99 -> "14,99€")
export const formatPrice = (price: number): string => {
  return price.toFixed(2).replace(".", ",") + "€";
};

// Format price from cents (e.g., 1499 -> "14,99€")
export const formatPriceFromCents = (cents: number): string => {
  return formatPrice(cents / 100);
};

// Get plan label from interval (for subscription display)
export const getPlanLabelFromInterval = (interval: PlanInterval | null): string => {
  const planType = intervalToPlanType(interval);
  return PRICING[planType].name;
};

// Get full price string (e.g., "14,99€/mois")
export const getPlanPriceString = (planType: PlanType): string => {
  const plan = PRICING[planType];
  return `${formatPrice(plan.price)}/${plan.intervalShort}`;
};

// Get price string from interval (for subscription display)
export const getPlanPriceFromInterval = (interval: PlanInterval | null): string => {
  const planType = intervalToPlanType(interval);
  return getPlanPriceString(planType);
};

// Get interval label (e.g., "/mois")
export const getIntervalLabel = (interval: PlanInterval | null): string => {
  switch (interval) {
    case "week": return "/semaine";
    case "month": return "/mois";
    case "year": return "/an";
    default: return "/mois";
  }
};

// Get price value string (e.g., "14,99€")
export const getPlanPriceValue = (interval: PlanInterval | null): string => {
  const planType = intervalToPlanType(interval);
  return formatPrice(PRICING[planType].price);
};

// Get minimum price for display (e.g., "dès 6,99€/sem")
export const getMinimumPriceDisplay = (): string => {
  return `dès ${formatPrice(PRICING.weekly.price)}/${PRICING.weekly.intervalShort}`;
};

// Get pricing summary for FAQ
export const getPricingSummary = (): string => {
  return `Hebdomadaire (${formatPrice(PRICING.weekly.price)}/${PRICING.weekly.intervalShort}), Mensuel (${formatPrice(PRICING.monthly.price)}/${PRICING.monthly.intervalShort} avec 7j d'essai) ou Annuel (${formatPrice(PRICING.yearly.price)}/${PRICING.yearly.intervalShort} avec 7j d'essai)`;
};
