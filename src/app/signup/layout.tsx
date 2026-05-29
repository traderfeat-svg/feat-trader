import type { Metadata } from "next";
import { BRAND } from "@/content/brand";

export const metadata: Metadata = {
  title: BRAND.meta.signup,
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
