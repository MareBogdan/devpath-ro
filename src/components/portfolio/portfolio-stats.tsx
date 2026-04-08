import { Trophy, BookOpen, Award, FolderOpen } from "lucide-react";

interface PortfolioStatsProps {
  completedCourses: number;
  completedLessons: number;
  badgeCount: number;
  projectCount: number;
}

export function PortfolioStats({
  completedCourses,
  completedLessons,
  badgeCount,
  projectCount,
}: PortfolioStatsProps) {
  const items = [
    {
      label: "Cursuri terminate",
      value: completedCourses,
      icon: Trophy,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-100 dark:bg-green-950",
    },
    {
      label: "Lecții completate",
      value: completedLessons,
      icon: BookOpen,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-100 dark:bg-blue-950",
    },
    {
      label: "Badge-uri",
      value: badgeCount,
      icon: Award,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-100 dark:bg-purple-950",
    },
    {
      label: "Proiecte",
      value: projectCount,
      icon: FolderOpen,
      color: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-100 dark:bg-orange-950",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-xl bg-card border border-border p-5"
        >
          <div className={`p-2 rounded-lg ${item.bg} ${item.color} w-fit mb-3`}>
            <item.icon className="h-4 w-4" />
          </div>
          <p className="text-2xl font-bold text-foreground">{item.value}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{item.label}</p>
        </div>
      ))}
    </div>
  );
}
