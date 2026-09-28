import {
  LayoutDashboard, Calculator, HeartPulse, Dumbbell,
  Apple, TrendingUp, Settings, type LucideIcon,
} from "lucide-react";

export type NavItem = { label: string; href: string; icon: LucideIcon };

export const navItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "BMI Calculator", href: "/bmi", icon: Calculator },
  { label: "Health Report", href: "/health-report", icon: HeartPulse },
  { label: "Workouts", href: "/workouts", icon: Dumbbell },
  { label: "Nutrition", href: "/nutrition", icon: Apple },
  { label: "Progress", href: "/progress", icon: TrendingUp },
  { label: "Settings", href: "/settings", icon: Settings },
];