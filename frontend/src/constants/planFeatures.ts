import type { PlanFeature } from "../types/subscription.types";
export const PLAN_FEATURES: PlanFeature[] = [{
  name: "Workspaces",
  free: "5",
  plus: "15",
  pro: "Unlimited"
}, {
  name: "Task Boards",
  free: "5",
  plus: "15",
  pro: "Unlimited"
}, {
  name: "Team Members",
  free: "Unlimited",
  plus: "Unlimited",
  pro: "Unlimited"
}, {
  name: "Channels & DMs",
  free: true,
  plus: true,
  pro: true
}, {
  name: "File Sharing",
  free: true,
  plus: true,
  pro: true
}, {
  name: "Message History",
  free: "30 days",
  plus: "Forever",
  pro: "Forever"
}, {
  name: "Video Calls",
  free: true,
  plus: true,
  pro: true
}, {
  name: "Priority Support",
  free: false,
  plus: false,
  pro: true
}, {
  name: "Advanced Analytics",
  free: false,
  plus: false,
  pro: true
}, {
  name: "Custom Integrations",
  free: false,
  plus: false,
  pro: true
}];