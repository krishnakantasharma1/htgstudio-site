// app/page.tsx
import { redirect } from "next/navigation";

export const metadata = {
  title: "HTG Studio – Boost Your Phone Performance Fast",
  description:
    "100% working phone optimization tricks, speed boosters, gaming tweaks, and performance guides—all in one place at HTG Studio.",
  // add keywords, openGraph etc if you want
};

export default function Page() {
  // server-side redirect to your course (no client code here)
  redirect("/courses/phone-boost");
}
