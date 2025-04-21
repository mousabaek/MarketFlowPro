import { cn } from "@/lib/utils";

interface BackgroundPatternProps {
  className?: string;
  variant?: "dots" | "grid" | "wave";
}

export function BackgroundPattern({ 
  className,
  variant = "dots" 
}: BackgroundPatternProps) {
  const patternStyles = {
    dots: {
      backgroundImage: `radial-gradient(var(--foreground-rgb) 1px, transparent 0)`,
      backgroundSize: "40px 40px",
      backgroundPosition: "-19px -19px",
      opacity: 0.03
    },
    grid: {
      backgroundImage: 
        `linear-gradient(var(--foreground-rgb) 1px, transparent 0),
        linear-gradient(90deg, var(--foreground-rgb) 1px, transparent 0)`,
      backgroundSize: "40px 40px",
      opacity: 0.03
    },
    wave: {
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='20' viewBox='0 0 100 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M21.184 20c.357-.13.72-.264.888-.14 1.652-1.1 2.862-2.3 3.652-3.5-.5 1-1.8 2.5-3.436 3.5.365.014 1.13.03 1.96.03 2.64 0 8.073-.566 15.063-1.7.414-.056.828-.113 1.242-.17.452 0 .905-.056 1.358-.113h.028c.725-.113 1.45-.226 2.176-.338a14 14 0 0 0-.55-4.082c-.816-2.53-2.393-4.42-4.543-5.563-1.935-1.02-4.246-1.53-6.557-1.53-2.31 0-4.62.452-6.558 1.415-1.935.904-3.653 2.26-5.13 4.014-1.478 1.753-2.667 3.842-3.512 6.257-.847 2.39-1.27 4.95-1.27 7.67v.113l.027.142c.056.565.556 1.078 1.1 1.192.516.113 1.118.17 1.803.17.683 0 1.385-.057 2.068-.17zm60.943-2.09l1.385-.113h.057c.263-.056.525-.113.788-.113 1.61-.17 3.22-.283 4.768-.283.726 0 1.385 0 2.068.113h.057c.413 0 .79.113 1.203.113.452.056.903.113 1.356.113.077 0 .127-.3.18-.8.07-.046.117-.093.133-.15.18-.076.28-.195.28-.32.054-.282.026-.684-.08-1.204a5.62 5.62 0 0 0-.386-1.033 7.642 7.642 0 0 0-1.25-2.147c-.847-1.02-1.894-1.753-3.107-2.147-1.214-.396-2.478-.51-3.692-.51-1.213 0-2.477.17-3.652.452-1.213.282-2.312.734-3.342 1.302a10.204 10.204 0 0 0-2.675 2.32c-.806.904-1.385 1.98-1.864 3.22-.48 1.22-.76 2.6-.847 4.07v.056c0 .226.027.396.08.51s.152.17.277.17h.08c.344.056.69.056 1.077.113.173 0 .346.028.513.056h.254c2.35.056 4.684.113 7.047.113 1.237 0 2.445 0 3.72-.113 1.268-.056 2.5-.17 3.7-.34.8-.056 1.6-.17 2.4-.282.234-.028.468-.065.702-.103z' fill='%23000000' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E")`,
      opacity: 0.06
    }
  };

  return (
    <div 
      className={cn(
        "absolute inset-0 -z-10 pointer-events-none",
        className
      )}
      style={patternStyles[variant]}
    />
  );
}