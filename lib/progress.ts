export const METRICS = [
  "weightKg", "bodyFatPct", "waistCm", "chestCm", "hipsCm", "armCm", "thighCm",
] as const;
export type Metric = (typeof METRICS)[number];

export type MetricInfo = { label: string; unit: string; min: number; max: number };

export const METRIC_INFO: Record<Metric, MetricInfo> = {
  weightKg:   { label: "Weight",    unit: "kg", min: 25, max: 400 },
  bodyFatPct: { label: "Body fat",  unit: "%",  min: 3,  max: 60 },
  waistCm:    { label: "Waist",     unit: "cm", min: 30, max: 250 },
  chestCm:    { label: "Chest",     unit: "cm", min: 40, max: 250 },
  hipsCm:     { label: "Hips",      unit: "cm", min: 40, max: 250 },
  armCm:      { label: "Arm",       unit: "cm", min: 10, max: 100 },
  thighCm:    { label: "Thigh",     unit: "cm", min: 20, max: 150 },
};

export type SeriesPoint = { date: string; value: number };

export type MeasurementRow = {
  id: string;
  measuredAt: string;
  notes: string | null;
} & Record<Metric, number | null>;

export type GoalProgress = {
  id: string;
  startKg: number;
  targetKg: number;
  currentKg: number;
  progressPct: number;
  direction: "lose" | "gain";
  deadline: string | null;
};