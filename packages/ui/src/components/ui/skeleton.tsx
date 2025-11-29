import { cn } from "@repo/lib/utils/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-md", className)}
      {...props}
    />
  )
}

export { Skeleton }

    
