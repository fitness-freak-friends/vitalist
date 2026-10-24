export type BmiCategory = "UNDERWEIGHT" | "NORMAL" | "OVERWEIGHT" | "OBESE";

export const round1 = (n: number) => Math.round(n * 10) / 10;

export function calcBmi(weightKg: number, heightCm: number) {
  const m = heightCm / 100;
  return round1(weightKg / (m * m));
}

export function categoryFor(bmi: number): BmiCategory {
  if (bmi < 18.5) return "UNDERWEIGHT";
  if (bmi < 25) return "NORMAL";
  if (bmi < 30) return "OVERWEIGHT";
  return "OBESE";
}

export const CATEGORY_INFO: Record<BmiCategory, { label: string; color: string; note: string }> = {
  UNDERWEIGHT: {
    label: "Underweight",
    color: "#5B9BD5",
    note: "Your BMI is below the typical healthy range. A balanced diet with enough calories and protein can help.",
  },
  NORMAL: {
    label: "Healthy weight",
    color: "#2F9E6E",
    note: "Your BMI is in the typical healthy range. Keep up your current habits.",
  },
  OVERWEIGHT: {
    label: "Overweight",
    color: "#E0A526",
    note: "Your BMI is above the typical healthy range. Regular activity and balanced meals can help.",
  },
  OBESE: {
    label: "Obese",
    color: "#D9534F",
    note: "Your BMI is well above the typical healthy range. Consider talking to a doctor about a plan that suits you.",
  },
};

// Weight range (kg) that gives a BMI of 18.5 to 24.9 at this height
export function healthyRangeKg(heightCm: number): [number, number] {
  const m2 = (heightCm / 100) ** 2;
  return [round1(18.5 * m2), round1(24.9 * m2)];
}