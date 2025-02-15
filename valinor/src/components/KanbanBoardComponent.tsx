"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  MoreVertical,
  User,
  Calendar,
  Tag,
} from "lucide-react";

interface Task {
  id: number;
  title: string;
  status: "To Do" | "In Progress" | "Done";
  priority?: "High" | "Medium" | "Low";
  assignee?: string;
  dueDate?: string;
  tags?: string[];
}

const sampleKanbanTasks: Task[] = [
  {
    id: 1,
    title: "Design Wireframes",
    status: "To Do",
    priority: "High",
    assignee: "Alice Smith",
    dueDate: "2024-03-01",
    tags: ["Design", "UI/UX"],
  },
  {
    id: 2,
    title: "Set Up Database",
    status: "In Progress",
    priority: "Medium",
    assignee: "Bob Johnson",
    dueDate: "2024-03-05",
    tags: ["Backend", "Database"],
  },
  {
    id: 3,
    title: "Develop API",
    status: "In Progress",
    priority: "High",
    assignee: "Charlie Brown",
    dueDate: "2024-03-10",
    tags: ["Backend", "API"],
  },
  {
    id: 4,
    title: "QA Testing",
    status: "Done",
    priority: "Medium",
    assignee: "Diana Prince",
    dueDate: "2024-02-28",
    tags: ["Testing", "QA"],
  },
];

const KanbanColumn: React.FC<{
  title: string;
  tasks: Task[];
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}> = ({ title, tasks, onDragOver, onDrop }) => {
  const getColumnIcon = () => {
    switch (title) {
      case "To Do":
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
      case "In Progress":
        return <Clock className="w-4 h-4 text-blue-400" />;
      case "Done":
        return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      default:
        return null;
    }
  };

  const getColumnColor = () => {
    switch (title) {
      case "To Do":
        return "bg-gray-50";
      case "In Progress":
        return "bg-blue-50";
      case "Done":
        return "bg-green-50";
      default:
        return "bg-gray-50";
    }
  };

  return (
    <div
      className={`flex-1 rounded-lg ${getColumnColor()} p-4 min-h-[600px]`}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {getColumnIcon()}
          <h3 className="font-medium text-gray-900">{title}</h3>
          <Badge variant="secondary" className="ml-2">
            {tasks.length}
          </Badge>
        </div>
      </div>
      <div className="space-y-3">
        {tasks.map((task) => (
          <KanbanCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
};

const KanbanCard: React.FC<{ task: Task }> = ({ task }) => {
  const [isHovered, setIsHovered] = useState(false);

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-700";
      case "Medium":
        return "bg-yellow-100 text-yellow-700";
      case "Low":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <Card
      draggable
      onDragStart={(e) => e.dataTransfer.setData("taskId", task.id.toString())}
      className={`
        transition-all duration-200 cursor-move
        ${isHovered ? "transform -translate-y-1 shadow-lg" : "shadow"}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-medium text-gray-900">{task.title}</h4>
          <button className="text-gray-400 hover:text-gray-600">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>

        {task.priority && (
          <Badge className={`${getPriorityColor(task.priority)} mb-2`}>
            {task.priority} Priority
          </Badge>
        )}

        <div className="space-y-2 mt-3">
          {task.assignee && (
            <div className="flex items-center text-sm text-gray-600">
              <User className="w-4 h-4 mr-2" />
              {task.assignee}
            </div>
          )}

          {task.dueDate && (
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-2" />
              {new Date(task.dueDate).toLocaleDateString()}
            </div>
          )}
        </div>

        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {task.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600"
              >
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const KanbanBoardComponent: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(sampleKanbanTasks);

  const columns = {
    "To Do": tasks.filter((task) => task.status === "To Do"),
    "In Progress": tasks.filter((task) => task.status === "In Progress"),
    Done: tasks.filter((task) => task.status === "Done"),
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, newStatus: Task["status"]) => {
    e.preventDefault();
    const taskId = parseInt(e.dataTransfer.getData("taskId"));

    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Kanban Board</h2>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <Badge variant="secondary">{tasks.length} Total Tasks</Badge>
        </div>
      </div>

      <div className="flex gap-6">
        {Object.entries(columns).map(([status, columnTasks]) => (
          <KanbanColumn
            key={status}
            title={status}
            tasks={columnTasks}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, status as Task["status"])}
          />
        ))}
      </div>
    </div>
  );
};

export default KanbanBoardComponent;
