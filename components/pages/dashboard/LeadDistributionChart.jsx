import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export default function LeadDistributionChart({ leadCounts }) {
  const totalLeads =
    leadCounts.totalCount ||
    Object.values(leadCounts).reduce((sum, count) => sum + count, 0);

  const statusData = [
    { key: "newCount", name: "New", color: "bg-blue-500" },
    { key: "contactedCount", name: "Contacted", color: "bg-purple-500" },
    { key: "qualifiedCount", name: "Qualified", color: "bg-green-500" },
    { key: "wonCount", name: "Won", color: "bg-teal-500" },
    { key: "lostCount", name: "Lost", color: "bg-rose-500" },
  ];

  const MAX_BAR_HEIGHT = 120;
  const CONTAINER_HEIGHT = 220;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Lead Distribution
          <span className="text-lg font-bold text-blue-600">
            Total: {totalLeads}
          </span>
        </CardTitle>
        <CardDescription>Status breakdown of all leads</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="py-4">
          <div
            className="flex items-end justify-between gap-4"
            style={{ height: `${CONTAINER_HEIGHT}px` }}
          >
            {statusData.map((status) => {
              const count = leadCounts[status.key] || 0;
              const percentage =
                totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0;
              const barHeight =
                totalLeads > 0
                  ? Math.max(
                      count > 0 ? 8 : 0,
                      (count / totalLeads) * MAX_BAR_HEIGHT
                    )
                  : 0;

              return (
                <div
                  key={status.key}
                  className="flex flex-col items-center flex-1"
                >
                  {/* Chart area */}
                  <div
                    className="flex flex-col justify-end relative"
                    style={{ height: `${MAX_BAR_HEIGHT + 20}px` }}
                  >
                    {count > 0 && (
                      <div
                        className={`w-12 rounded-t-md relative group ${status.color} transition-all duration-300 hover:opacity-80`}
                        style={{
                          height: `${barHeight}px`,
                        }}
                      ></div>
                    )}
                  </div>

                  {/* Labels */}
                  <div className="mt-3 text-center">
                    <div className="text-xs font-medium text-muted-foreground mb-1">
                      {status.name}
                    </div>
                    <div className="text-sm font-bold text-gray-900 mb-2">
                      {count}
                    </div>
                    {/* Color legend */}
                    <div className="flex items-center justify-center">
                      <div
                        className={`w-3 h-3 rounded-sm ${status.color}`}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary stats */}
        <div className="mt-6 pt-4 border-t border-muted">
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>Distribution Summary</span>
            <div className="flex gap-4">
              {statusData.map((status) => {
                const count = leadCounts[status.key] || 0;
                const percentage =
                  totalLeads > 0 ? ((count / totalLeads) * 100).toFixed(1) : 0;

                if (count === 0) return null;

                return (
                  <div key={status.key} className="flex items-center gap-1">
                    <div
                      className={`w-2 h-2 rounded-full ${status.color}`}
                    ></div>
                    <span className="text-xs">
                      {status.name}: {percentage}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
