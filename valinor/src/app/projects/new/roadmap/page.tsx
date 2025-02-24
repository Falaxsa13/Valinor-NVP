"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createProject, generateTimeline, TimelineEntry } from "@/api/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Calendar,
  Users,
  FileText,
  Home,
  Sparkles,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ProjectData {
  title: string;
  description?: string;
  templateId: number;
  collaborators: string[];
  startDate: string;
  deadline: string;
  assignments: Record<string, string>;
}

interface StepStatus {
  label: string;
  icon: React.ReactNode;
  done: boolean;
  active: boolean;
  error?: boolean;
}

export default function CreateProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [processCompleted, setProcessCompleted] = useState(false);

  const [steps, setSteps] = useState<StepStatus[]>([
    {
      label: "Processing project data",
      icon: <FileText className="h-5 w-5" />,
      done: false,
      active: true,
    },
    {
      label: "Generating timeline",
      icon: <Calendar className="h-5 w-5" />,
      done: false,
      active: false,
    },
    {
      label: "Setting up collaborators",
      icon: <Users className="h-5 w-5" />,
      done: false,
      active: false,
    },
    {
      label: "Finalizing project",
      icon: <CheckCircle2 className="h-5 w-5" />,
      done: false,
      active: false,
    },
  ]);

  // Create an animated progress effect
  useEffect(() => {
    if (loading && !error) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          // Slow down progress as it gets higher to create anticipation
          const increment = 100 - prev > 60 ? 10 : 100 - prev > 20 ? 3 : 1;
          const newProgress = Math.min(prev + increment, 95);
          return newProgress;
        });
      }, 400);

      return () => clearInterval(interval);
    }

    if (success || processCompleted) {
      setProgress(100);
    }
  }, [loading, success, error, processCompleted]);

  // Handle transition to success screen after loading is complete
  useEffect(() => {
    if (processCompleted && !success && !error) {
      // Set a small delay before showing success state
      const timer = setTimeout(() => {
        setSuccess(true);
        setLoading(false);
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [processCompleted, success, error]);

  // Animate through the steps to create an engaging loading experience
  useEffect(() => {
    if (loading && !error && !processCompleted) {
      const stepInterval = setInterval(() => {
        setCurrentStep((prevStep) => {
          if (processCompleted) return prevStep;

          const nextStep = prevStep < steps.length - 1 ? prevStep + 1 : 0;

          setSteps((prevSteps) =>
            prevSteps.map((step, idx) => ({
              ...step,
              done: idx < nextStep,
              active: idx === nextStep,
              error: false,
            }))
          );

          return nextStep;
        });
      }, 2500);

      return () => clearInterval(stepInterval);
    }
  }, [loading, error, steps.length, processCompleted]);

  // Initialize and process the project
  useEffect(() => {
    let mounted = true;
    const stored = localStorage.getItem("newProjectData");

    if (!stored) {
      router.push("/projects/new");
      return;
    }

    try {
      const parsedData: ProjectData = JSON.parse(stored);
      setProjectData(parsedData);

      const formattedData = {
        title: parsedData.title,
        description: parsedData.description,
        collaborators: parsedData.collaborators,
        start_date: new Date(parsedData.startDate),
        deadline: new Date(parsedData.deadline),
        assignments: parsedData.assignments,
        template_id: parsedData.templateId,
      };

      // Artificial delay to make the experience feel more substantial
      setTimeout(() => {
        if (!mounted) return;

        generateTimeline(parsedData)
          .then((timelineData) => {
            if (!mounted) return timelineData;

            // Update step indicators
            setSteps((prev) =>
              prev.map((step, idx) => ({
                ...step,
                done: idx < 1,
                active: idx === 1,
              }))
            );
            setCurrentStep(1);

            // Artificial delay to show timeline generation
            return new Promise<typeof timelineData>((resolve) =>
              setTimeout(() => resolve(timelineData), 2000)
            );
          })
          .then((timelineData) => {
            if (!mounted) return;

            // Update step indicators
            setSteps((prev) =>
              prev.map((step, idx) => ({
                ...step,
                done: idx < 2,
                active: idx === 2,
              }))
            );
            setCurrentStep(2);

            // Artificial delay to show collaborator setup
            return new Promise((resolve) =>
              setTimeout(() => {
                if (!mounted) return;
                resolve(
                  createProject({
                    ...formattedData,
                    timeline: timelineData as TimelineEntry[],
                  })
                );
              }, 2000)
            );
          })
          .then(() => {
            if (!mounted) return;

            // Update step indicators for final step
            setSteps((prev) =>
              prev.map((step, idx) => ({
                ...step,
                done: idx < 3,
                active: idx === 3,
              }))
            );
            setCurrentStep(3);

            localStorage.removeItem("newProjectData");

            // Add a delay before showing success
            setTimeout(() => {
              if (!mounted) return;

              // Mark process as completed - this will trigger the transition to success screen
              setProcessCompleted(true);

              setSteps((prev) =>
                prev.map((step) => ({
                  ...step,
                  done: true,
                  active: false,
                }))
              );
            }, 1500);
          })
          .catch((err) => {
            if (!mounted) return;

            console.error("Error:", err);
            setError("Failed to create project. Please try again.");

            // Mark the current step as error
            setSteps((prev) =>
              prev.map((step, idx) => ({
                ...step,
                error: idx === currentStep,
                active: idx === currentStep,
              }))
            );

            // Set a timeout before showing the error screen
            setTimeout(() => {
              if (!mounted) return;
              setLoading(false);
            }, 1000);
          });
      }, 1500);
    } catch (err) {
      console.error("Error parsing project data:", err);
      setError("Invalid project data. Please start over.");
      setLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, [router]);

  // Loading state with progress indicator and steps
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="overflow-hidden border-none shadow-xl bg-white rounded-xl">
            <div className="p-6">
              <div className="flex items-center justify-center mb-6">
                <div className="relative w-16 h-16 flex items-center justify-center bg-blue-50 rounded-full">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-blue-600"
                  >
                    {processCompleted ? (
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                    ) : (
                      steps[currentStep].icon
                    )}
                  </motion.div>
                  <svg
                    className="absolute top-0 left-0 w-full h-full"
                    viewBox="0 0 44 44"
                  >
                    <circle
                      className="text-gray-100"
                      strokeWidth="3"
                      stroke="currentColor"
                      fill="transparent"
                      r="20"
                      cx="22"
                      cy="22"
                    />
                    <motion.circle
                      className={`${
                        processCompleted ? "text-green-500" : "text-blue-500"
                      }`}
                      strokeWidth="3"
                      stroke="currentColor"
                      fill="transparent"
                      r="20"
                      cx="22"
                      cy="22"
                      strokeDasharray={`${progress * 1.26} 126`}
                      strokeDashoffset="0"
                      strokeLinecap="round"
                      initial={{ strokeDasharray: "0 126" }}
                      animate={{ strokeDasharray: `${progress * 1.26} 126` }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                    />
                  </svg>
                </div>
              </div>

              <h1 className="text-xl font-semibold text-center text-gray-900 mb-2">
                {processCompleted
                  ? "Project Created!"
                  : "Creating Your Project"}
              </h1>
              <p className="text-sm text-center text-gray-500 mb-6">
                {processCompleted
                  ? "Successfully created your project"
                  : projectData?.title
                  ? `"${projectData.title}"`
                  : "Please wait while we set everything up"}
              </p>

              {/* Progress bar */}
              <div className="relative h-2 w-full bg-gray-100 rounded-full overflow-hidden mb-6">
                <motion.div
                  className={`absolute top-0 left-0 h-full ${
                    processCompleted ? "bg-green-600" : "bg-blue-600"
                  }`}
                  style={{ width: `${progress}%` }}
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                />
              </div>

              {/* Steps display */}
              <div className="space-y-4">
                {steps.map((step, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0.7, x: -10 }}
                    animate={{
                      opacity:
                        step.active || step.done || processCompleted ? 1 : 0.7,
                      x: 0,
                      // Subtle shake animation for error
                      rotate: step.error ? [0, -1, 1, -1, 0] : 0,
                    }}
                    transition={{
                      duration: 0.3,
                      rotate: { duration: 0.1, repeat: 3 },
                    }}
                    className={`flex items-center p-3 rounded-lg transition-colors ${
                      processCompleted
                        ? "bg-green-50"
                        : step.active
                        ? "bg-blue-50 border-l-4 border-blue-600"
                        : step.done
                        ? "bg-green-50"
                        : "bg-gray-50"
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full ${
                        processCompleted || step.done
                          ? "bg-green-100 text-green-600"
                          : step.active
                          ? "bg-blue-100 text-blue-600"
                          : step.error
                          ? "bg-red-100 text-red-600"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {processCompleted || step.done ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : step.error ? (
                        <AlertTriangle className="h-5 w-5" />
                      ) : (
                        step.icon
                      )}
                    </div>
                    <div className="ml-3 flex-grow">
                      <p
                        className={`text-sm font-medium ${
                          processCompleted
                            ? "text-green-800"
                            : step.done
                            ? "text-green-800"
                            : step.active
                            ? "text-blue-800"
                            : step.error
                            ? "text-red-800"
                            : "text-gray-600"
                        }`}
                      >
                        {step.label}
                      </p>
                    </div>
                    {step.active && !step.error && !processCompleted && (
                      <motion.div
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="w-5 h-5 relative flex-shrink-0"
                      >
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <Card className="overflow-hidden border-none shadow-xl bg-white rounded-xl">
            <div className="pt-8 px-6 pb-6">
              <div className="mb-6 flex justify-center">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: [0.8, 1.1, 1] }}
                  transition={{ times: [0, 0.5, 1], duration: 0.5 }}
                  className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center"
                >
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </motion.div>
              </div>

              <h2 className="text-xl font-semibold text-center text-gray-900 mb-2">
                Something Went Wrong
              </h2>

              <p className="text-center text-gray-600 text-sm mb-6">{error}</p>

              <Alert
                variant="destructive"
                className="mb-6 bg-red-50 border-red-100 text-red-800"
              >
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle className="text-red-800">Error Details</AlertTitle>
                <AlertDescription className="text-red-700">
                  The project creation process encountered an issue. Your data
                  has been saved.
                </AlertDescription>
              </Alert>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={() => router.push("/")}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>

                <Button
                  onClick={() => router.push("/projects/new")}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  Try Again
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 px-4">
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20,
            }}
            className="w-full max-w-md"
          >
            <Card className="overflow-hidden border-none shadow-xl bg-white rounded-xl">
              <div className="pt-8 px-6 pb-6 relative">
                {/* Enhanced success animation without confetti */}
                <div className="mb-8 flex justify-center">
                  <div className="relative">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 10,
                      }}
                      className="w-24 h-24 rounded-full flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100"
                    >
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.3 }}
                      >
                        <CheckCircle2 className="h-12 w-12 text-green-600" />
                      </motion.div>
                    </motion.div>

                    {/* Sparkles animation */}
                    <div className="absolute top-0 left-0 w-full h-full">
                      {[...Array(12)].map((_, i) => {
                        const angle = (i / 12) * 2 * Math.PI;
                        const radius = 50;
                        const x = Math.cos(angle) * radius;
                        const y = Math.sin(angle) * radius;

                        return (
                          <motion.div
                            key={i}
                            className="absolute"
                            style={{
                              left: `calc(50% + ${x}px)`,
                              top: `calc(50% + ${y}px)`,
                              transformOrigin: "center",
                            }}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{
                              scale: [0, 1, 0],
                              opacity: [0, 1, 0],
                            }}
                            transition={{
                              duration: 2,
                              delay: 0.1 + i * 0.1,
                              repeat: Infinity,
                              repeatDelay: 3,
                            }}
                          >
                            <Sparkles
                              size={i % 3 === 0 ? 18 : i % 3 === 1 ? 14 : 10}
                              className={
                                i % 4 === 0
                                  ? "text-green-500"
                                  : i % 4 === 1
                                  ? "text-blue-500"
                                  : i % 4 === 2
                                  ? "text-amber-500"
                                  : "text-purple-500"
                              }
                            />
                          </motion.div>
                        );
                      })}
                    </div>

                    {/* Animated rings */}
                    <motion.div
                      className="absolute top-0 left-0 w-full h-full"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      {[1, 2, 3].map((i) => (
                        <motion.div
                          key={i}
                          className="absolute top-0 left-0 right-0 bottom-0 rounded-full border-2 border-green-500"
                          initial={{ opacity: 0.6, scale: 1 }}
                          animate={{ opacity: 0, scale: 1.5 + i * 0.2 }}
                          transition={{
                            repeat: Infinity,
                            delay: i * 0.2,
                            duration: 2,
                            ease: "easeOut",
                          }}
                        />
                      ))}
                    </motion.div>
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <h2 className="text-2xl font-semibold text-center text-gray-900 mb-2">
                    Project Created Successfully!
                  </h2>

                  <p className="text-center text-gray-600 mb-8">
                    {projectData?.title ? (
                      <>
                        Your project{" "}
                        <span className="font-medium">
                          "{projectData.title}"
                        </span>{" "}
                        is ready
                      </>
                    ) : (
                      <>Your project has been set up and is ready to go</>
                    )}
                  </p>

                  <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <Users className="h-5 w-5 text-blue-600 mr-2" />
                        <p className="text-sm font-medium text-blue-800">
                          {projectData?.collaborators.length || 0} Collaborators
                        </p>
                      </div>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 text-purple-600 mr-2" />
                        <p className="text-sm font-medium text-purple-800">
                          {projectData?.deadline
                            ? new Date(
                                projectData.deadline
                              ).toLocaleDateString()
                            : "Deadline set"}
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      variant="outline"
                      onClick={() => router.push("/")}
                      className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      View All Projects
                    </Button>

                    <Button
                      onClick={() =>
                        router.push(
                          `/projects/${Math.floor(Math.random() * 1000) + 1}`
                        )
                      }
                      className="bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Go to Project
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  return null;
}
