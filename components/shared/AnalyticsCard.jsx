import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AnalyticsCard({ title, children, extra }) {
  return (
    <Card className="bg-brand-bg border border-brand-border rounded-lg shadow-sm overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow">
      <CardHeader className="p-5 border-b border-brand-border flex flex-row items-center justify-between flex-wrap gap-2 space-y-0">
        <CardTitle className="font-heading text-sm font-bold text-brand-navy tracking-tight uppercase">
          {title}
        </CardTitle>
        {extra && <div className="text-xs">{extra}</div>}
      </CardHeader>
      <CardContent className="p-5 flex-1 flex flex-col justify-center min-h-[260px]">
        {children}
      </CardContent>
    </Card>
  );
}
