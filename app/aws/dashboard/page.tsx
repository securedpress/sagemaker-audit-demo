import type { Metadata } from "next";
import { DashboardShellClient } from "@/components/shared/DashboardShellClient";

export const metadata: Metadata = {
  title: "SageMaker Audit Dashboard | Live Demo | SecuredPress",
  description:
    "Explore a live, interactive demo of the SecuredPress SageMaker cost and security audit dashboard — with synthetic data from a typical production ML deployment.",
};

export default function DashboardPage() {
  return <DashboardShellClient clientId="dashboard" />;
}
