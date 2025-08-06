"use client";
import { useMemo, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle, PartyPopper, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTeamContext } from "@/context/TeamProvider";
import { useLeads } from "@/context/LeadsProvider";
import { useCoreContext } from "@/context/CoreProvider";


export default function UserOnboardingOverlay() {
  const { orgCampaigns, teamLeads } = useTeamContext();
  const { organization } = useCoreContext();
  const { totalLeads } = useLeads();

  const hasCampaign  = orgCampaigns.length > 0;
  const hasLeads     = totalLeads.length > 0;
  const hasTeamLeads = teamLeads.length > 0;

  // derive visibility once from DB flag
  const [visible, setVisible] = useState(
    organization ? !organization.onboardingCompleted : false
  );

  const steps = useMemo(
    () => [
      { label: "Create first campaign", href: "/campaigns", done: hasCampaign },
      { label: "Import leads",          href: "/leads",    done: hasLeads },
      { label: "Assign leads to team",  href: "/leads",    done: hasTeamLeads },
    ],
    [hasCampaign, hasLeads, hasTeamLeads]
  );

  const nextStep = useMemo(() => steps.find((s) => !s.done), [steps]);
  const allDone  = !nextStep;



// inside close()
const close = async () => {
  setVisible(false);
  if (organization?.id && !organization.onboardingCompleted) {
    await fetch("/api/public/onboarding", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orgId: organization.id }),
    });
  }
};

  // auto-close after 5 s
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(close, 5000);
    return () => clearTimeout(t);
  }, [visible]);

  if (!visible) return null;

  if(organization.onboardingCompleted) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-fade-out">
      <div className="bg-card border border-primary rounded-lg shadow-xl p-4 w-[280px] space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-muted-foreground">
            {allDone ? "All done!" : "Next step"}
          </h4>
          <button
            onClick={close}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {allDone ? (
          <div className="flex items-center gap-2">
            <PartyPopper className="w-5 h-5 text-green-500" />
            <p className="text-xs text-muted-foreground">
              You’re all set—happy selling!
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-blue-500" />
                <span className="text-sm">{nextStep.label}</span>
              </div>
              <Button asChild size="sm" className="text-xs">
                <Link href={nextStep.href} onClick={close}>
                  Go
                </Link>
              </Button>
            </div>

            {/* Mini checklist */}
            <div className="flex gap-1 flex-wrap text-[11px] text-muted-foreground">
              {steps
                .filter((s) => s.done)
                .map((s) => (
                  <span key={s.label} className="flex items-center gap-0.5">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    {s.label}
                  </span>
                ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}