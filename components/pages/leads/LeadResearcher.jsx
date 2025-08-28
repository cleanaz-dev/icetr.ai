"use client";
import { useTeamContext } from "@/context/TeamProvider";
import { useState } from "react";
import ResearchDisplay from "./researcher/ResearchDisplay";
import { Button } from "@/components/ui/button";
import { SearchIcon, Save } from "lucide-react";
import { toast } from "sonner";
import { XIcon } from "lucide-react";
import { Loader2 } from "lucide-react";
import { Microscope } from "lucide-react";
import useSWR, { mutate } from "swr"; // Import mutate

export default function LeadResearcher({
  lead,
  showResearcher,
  setShowResearcher,
}) {
  const { orgId } = useTeamContext();

  // create fetcher function for SWR
  const fetcher = async (url) => fetch(url).then((res) => res.json());

  const cacheKey =
    orgId && lead?.id ? `/api/org/${orgId}/leads/${lead.id}/research` : null;

  const {
    data: research,
    error: fetchError,
    isLoading,
  } = useSWR(cacheKey, fetcher);

  console.log(" research: ", research);
  const [isResearching, setIsResearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleResearch = async () => {
    setIsResearching(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/org/${orgId}/leads/${lead.id}/research`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            company: lead.company,
            website: lead.website,
            services: lead.campaign?.researchConfig?.services || [],
            techStackFocus: lead.campaign?.researchConfig?.techStackFocus || [],
          }),
        }
      );

      const data = await response.json();

      // Update the SWR cache with the new research data
      mutate(cacheKey, data, false); // false means don't revalidate

      toast.success("Research completed successfully!");
    } catch (error) {
      setError("Research failed: " + error.message);
      toast.error("Research failed: " + error.message);
    } finally {
      setIsResearching(false);
    }
  };
  const handleSaveResearch = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/org/${orgId}/leads/${lead.id}/research/save`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(research),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save research");
      }

      toast.success("Research saved successfully");
    } catch (error) {
      setError("Save failed: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };
  console.log("lead: ", lead);

  return (
    <div
      className={`
        bg-card border-t transition-all duration-300 ease-in-out z-80
        ${showResearcher ? "h-[70vh] overflow-y-auto " : "h-14"}
      `}
    >
      {/* Header bar */}
      <div className="flex justify-between items-center px-4 h-14">
        <div className="flex items-center gap-2 not-odd:not-only:not-last:font-medium">
          <span className="font-medium tracking-widest">
            AI-Assisted Research
          </span>{" "}
          {showResearcher && (
            <Button
              onClick={handleResearch}
              disabled={isResearching || isSaving}
              variant="outline"
            >
              <SearchIcon />
              {isResearching ? "Researching..." : "Research Lead"}
            </Button>
          )}
        </div>

        {showResearcher && (
          <div className="flex gap-2 mt-4">
            <Button
              onClick={handleSaveResearch}
              disabled={isResearching || isSaving || !research}
              variant="outline"
            >
              {isSaving ? (
                <Loader2 className="animate-spin w-5 h-5" />
              ) : (
                <Save className="w-5 h-5" />
              )}
            </Button>

            <Button
              variant="outline"
              onClick={() => setShowResearcher(!showResearcher)}
            >
              <XIcon />
            </Button>
          </div>
        )}
      </div>

      {/* Expanded content */}
      {/* Expanded content */}
      {showResearcher && (
        <div className="px-4 pb-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700">
              {error}
            </div>
          )}

          <h3 className="text-lg font-semibold">{lead?.company}</h3>
          <p className="text-sm text-muted-foreground">
            Lead Name: {lead?.name || "N/A"}
          </p>

          {/* Priority: isLoading (initial fetch) */}
          {isLoading ? (
            <div className="flex items-center justify-center h-full mt-20">
              <Loader2 className="animate-spin w-10 h-10" />
            </div>
          ) : isResearching ? (
            /* New State: Actively researching */
            <div className="flex flex-col items-center justify-center mt-20 text-muted-foreground">
              <Loader2 className="animate-spin w-10 h-10 mb-2" />
              <p className="italic text-sm text-center max-w-xs">
                Research in progress... please wait.
              </p>
            </div>
          ) : research ? (
            /* State: Research available */
            <ResearchDisplay research={research} isLoading={false} />
          ) : (
            /* State: No research yet */
            <div className="flex flex-col items-center justify-center mt-20 text-muted-foreground">
              <Microscope className="w-10 h-10 mb-2 opacity-50" />
              <p className="italic text-sm text-center max-w-xs">
                No research results yet. Click <strong>Research Lead</strong> to
                get started.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
