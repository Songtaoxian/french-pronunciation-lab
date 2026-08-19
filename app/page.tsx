import type { Metadata } from "next";
import FrenchLab from "./FrenchLab";

export const metadata: Metadata = {
  title: "法语拼读训练台",
  description: "面向中文学习者的法语拼写、读音与词族记忆 MVP。",
};

export default function Home() {
  return <FrenchLab />;
}
