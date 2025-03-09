"use client";

import { useUser } from "@clerk/nextjs";

const DashboardPage = () => {
  const { user } = useUser();
  return <div className="h-full bg-sky-200">{user?.firstName}</div>;
};

export default DashboardPage;
