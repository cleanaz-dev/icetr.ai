import SingleLeadsPage from "@/components/pages/leads/SingleLeadsPage";
import React from "react";

export default async function page({ params }) {
  const { id } = await params;
  return (
    <div>
      <SingleLeadsPage />
    </div>
  );
}
