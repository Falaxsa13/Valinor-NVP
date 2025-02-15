import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Calendar, Users, ChevronRight, Circle, Check } from "lucide-react";

interface TimelineEntry {
  section: string;
  subtitle?: string;
  responsible?: string;
  start: string;
  end: string;
  status?: "completed" | "in-progress" | "upcoming";
}

interface RoadmapProps {
  timeline: TimelineEntry[];
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateStr));
}

function calculateProgress(start: string, end: string): number {
  const today = new Date();
  const startDate = new Date(start);
  const endDate = new Date(end);

  if (today < startDate) return 0;
  if (today > endDate) return 100;

  const total = endDate.getTime() - startDate.getTime();
  const current = today.getTime() - startDate.getTime();
  return Math.round((current / total) * 100);
}

const TimelineItem = ({
  entry,
  index,
  isLast,
}: {
  entry: TimelineEntry;
  index: number;
  isLast: boolean;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const progress = calculateProgress(entry.start, entry.end);
  const status =
    progress === 100 ? "completed" : progress > 0 ? "in-progress" : "upcoming";

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "in-progress":
        return "bg-blue-500";
      default:
        return "bg-gray-300";
    }
  };

  return (
    <div
      className="relative mb-8"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Timeline connector */}
      {!isLast && (
        <div className="absolute left-4 top-8 w-0.5 h-full -ml-px bg-gray-200" />
      )}

      {/* Timeline node */}
      <div
        className={`
        absolute left-4 -ml-3 w-6 h-6 rounded-full border-4 border-white
        ${getStatusColor(status)}
        transition-all duration-200
        ${isHovered ? "scale-125" : "scale-100"}
      `}
      >
        {status === "completed" && (
          <Check className="w-3 h-3 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        )}
      </div>

      {/* Content card */}
      <Card
        className={`
        ml-12 transition-all duration-200
        ${isHovered ? "transform -translate-y-1 shadow-lg" : "shadow"}
      `}
      >
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {entry.section}
              </h3>
              {entry.subtitle && (
                <p className="text-sm text-gray-600 mt-1">{entry.subtitle}</p>
              )}
            </div>
            <span className="px-2 py-1 text-sm rounded-full bg-gray-100 text-gray-600">
              Phase {index + 1}
            </span>
          </div>

          <div className="mt-4">
            <Progress value={progress} className="h-2 w-full bg-gray-100" />
            <div className="flex justify-between items-center mt-2 text-sm text-gray-600">
              <span>{formatDate(entry.start)}</span>
              <span>{progress}% Complete</span>
              <span>{formatDate(entry.end)}</span>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            <span>{entry.responsible || "Unassigned"}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const RoadmapComponent: React.FC<RoadmapProps> = ({ timeline }) => {
  return (
    <div className="py-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">
          Project Roadmap
        </h2>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span>In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-300" />
            <span>Upcoming</span>
          </div>
        </div>
      </div>

      <div className="relative">
        {timeline.map((entry, index) => (
          <TimelineItem
            key={index}
            entry={entry}
            index={index}
            isLast={index === timeline.length - 1}
          />
        ))}
      </div>
    </div>
  );
};

export default RoadmapComponent;
