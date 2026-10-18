export const VEHICLE_STATUSES = ["DRAFT", "AVAILABLE", "PENDING", "SOLD"] as const;
export type VehicleStatus = (typeof VEHICLE_STATUSES)[number];
export const PUBLIC_STATUSES: VehicleStatus[] = ["AVAILABLE", "PENDING"];

export const STATUS_LABEL: Record<VehicleStatus, string> = {
  DRAFT: "Draft",
  AVAILABLE: "Available",
  PENDING: "Sale Pending",
  SOLD: "Sold",
};

export const LEAD_TYPES = ["CONTACT", "VEHICLE_INQUIRY", "TRADE_IN", "SERVICE"] as const;
export type LeadType = (typeof LEAD_TYPES)[number];

export const LEAD_TYPE_LABEL: Record<LeadType, string> = {
  CONTACT: "Contact",
  VEHICLE_INQUIRY: "Vehicle inquiry",
  TRADE_IN: "Trade-in",
  SERVICE: "Service",
};

export const LEAD_STATUSES = ["NEW", "CONTACTED", "CLOSED"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_STATUS_LABEL: Record<LeadStatus, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  CLOSED: "Closed",
};

export const BODY_TYPES = ["Sedan", "SUV", "Truck", "Coupe", "Hatchback", "Convertible", "Wagon", "Van", "Minivan"];
export const TRANSMISSIONS = ["Automatic", "Manual", "CVT"];
export const DRIVETRAINS = ["FWD", "RWD", "AWD", "4WD"];
export const FUEL_TYPES = ["Gasoline", "Diesel", "Hybrid", "Plug-in Hybrid", "Electric", "Flex Fuel"];

export const FEATURE_PRESETS = [
  "Backup Camera",
  "Bluetooth",
  "Apple CarPlay",
  "Android Auto",
  "Navigation",
  "Heated Seats",
  "Leather Seats",
  "Sunroof / Moonroof",
  "Remote Start",
  "Keyless Entry",
  "Push Button Start",
  "Blind Spot Monitor",
  "Lane Keep Assist",
  "Adaptive Cruise Control",
  "Third Row Seating",
  "Tow Package",
  "Alloy Wheels",
  "Power Liftgate",
  "Heated Steering Wheel",
  "Premium Audio",
];

export const SERVICE_TYPES = [
  "Oil Change",
  "Brakes",
  "Tires",
  "General Repair",
  "Detailing",
  "Inspection / Other",
];

export const SORTS = {
  newest: "Newest listed",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  "mileage-asc": "Mileage: lowest",
  "year-desc": "Year: newest",
} as const;
export type SortKey = keyof typeof SORTS;
