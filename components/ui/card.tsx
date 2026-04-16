import * as React from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverLift?: boolean
}

export function Card({ className = '', hoverLift = false, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[10px] border border-border bg-card text-card-foreground shadow-subtle transition-all duration-150",
        hoverLift && "hover:translateY-[-1px] hover:shadow-hover cursor-default",
        className
      )}
      {...props}
    />
  )
}

export function CardHeader({ className = '', ...props }: CardProps) {
  return <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
}

export function CardTitle({ className = '', ...props }: CardProps) {
  return (
    <h3 className={cn("text-xl font-bold leading-none tracking-tight text-card-foreground", className)} {...props} />
  )
}

export function CardContent({ className = '', ...props }: CardProps) {
  return <div className={cn("p-6 pt-0", className)} {...props} />
}

export function CardFooter({ className = '', ...props }: CardProps) {
  return <div className={cn("flex items-center p-6 pt-0", className)} {...props} />
}
