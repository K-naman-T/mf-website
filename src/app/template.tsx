"use client";

import { PageMorph } from "@/components/motion/transitions/PageMorph";

export default function Template({ children }: { children: React.ReactNode }) {
  return <PageMorph>{children}</PageMorph>;
}