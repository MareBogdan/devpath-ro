import { redirect } from "next/navigation";
import { ComponentShowcase } from "./_showcase";

export const metadata = { title: "Component Showcase" };

export default function ComponentShowcasePage() {
  if (process.env.NODE_ENV !== "development") {
    redirect("/dashboard");
  }
  return <ComponentShowcase />;
}
