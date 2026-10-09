import { Info } from "lucide-react";

export function DemoBanner({ text = "Showing sample data so you can preview the interface. It disappears as soon as you have real records." }: { text?: string }) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <span><span className="font-semibold text-foreground">Demo preview — </span>{text}</span>
    </div>
  );
}
