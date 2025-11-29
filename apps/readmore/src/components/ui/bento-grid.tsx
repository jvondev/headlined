import { ComponentPropsWithoutRef, ReactNode } from "react"
import { ArrowRightIcon } from "@radix-ui/react-icons"

import { cn } from "@/lib/utils"
import { Button } from "@repo/ui/components/ui/button"

interface BentoGridProps extends ComponentPropsWithoutRef<"div"> {
  children: ReactNode
  className?: string
}

interface BentoCardProps extends ComponentPropsWithoutRef<"div"> {
  name: string
  className: string
  background: ReactNode
  Icon: React.ElementType
  description: string
  href: string
}

const BentoGrid = ({ children, className, ...props }: BentoGridProps) => {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 snap-y snap-mandatory lg:grid-cols-3 lg:auto-rows-[22rem]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

const BentoCard = ({
  name,
  className,
  background,
  Icon,
  description,
  href,
  ...props
}: BentoCardProps) => (
  <div
    key={name}
    className={cn(
      "group relative flex flex-col justify-between overflow-hidden rounded-lg",
      "bg-card border snap-center lg:col-span-3",
      className
    )}
    {...props}
  >
    <div className="hidden lg:block h-[80px] lg:h-auto mb-2">{background}</div>
    <div className="p-4">
      <div className="pointer-events-none z-10 flex transform-gpu flex-col gap-1 transition-all duration-300 lg:group-hover:-translate-y-5 pl-4">
        <Icon className="h-8 w-8 origin-left transform-gpu text-muted-foreground transition-all duration-300 ease-in-out group-hover:scale-75" />
        <h3 className="text-xl font-semibold text-foreground">
          {name}
        </h3>
        <p className="max-w-lg text-muted-foreground">{description}</p>
      </div>

      <div
        className={cn(
          "pointer-events-none flex w-full translate-y-0 transform-gpu flex-row items-center transition-all duration-300 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 lg:hidden"
        )}
      >
        <Button
          variant="link"
          asChild
          size="sm"
          className="pointer-events-auto p-0"
        >
          <a href={href}>
          </a>
        </Button>
      </div>
    </div>

    <div
      className={cn(
        "pointer-events-none absolute bottom-0 hidden w-full translate-y-10 transform-gpu flex-row items-center p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 lg:flex"
      )}
    >
      <Button
        variant="link"
        asChild
        size="sm"
        className="pointer-events-auto p-0"
      >
        <a href={href}>
        </a>
      </Button>
    </div>
  </div>
)

export { BentoCard, BentoGrid }
