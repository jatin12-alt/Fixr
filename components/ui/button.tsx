import * as React from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'pill'
}

export function Button({
  className = '',
  variant = 'default',
  size = 'default',
  ...props
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-150 disabled:opacity-50 cursor-pointer active:scale-[0.98]'

  const variants = {
    default: 'bg-black text-white hover:bg-[#1a1a1a] hover:text-white shadow-subtle',
    destructive: 'bg-black text-white hover:bg-[#1a1a1a] hover:text-white',
    outline: 'border border-[#e5e5e5] bg-transparent text-[#0a0a0a] hover:bg-[#f5f5f5] hover:text-[#0a0a0a]',
    secondary: 'bg-[#f5f5f5] text-[#0a0a0a] hover:bg-[#efefef] hover:text-[#0a0a0a]',
    ghost: 'bg-transparent text-[#0a0a0a] hover:bg-[#f5f5f5] hover:text-[#0a0a0a]',
  }

  const sizes = {
    default: 'h-10 px-4 py-2 text-sm rounded-[6px]',
    sm: 'h-8 px-3 text-xs rounded-[6px]',
    lg: 'h-12 px-8 text-base rounded-[6px]',
    pill: 'h-10 px-6 py-2 text-sm rounded-full',
  }

  return (
    <button
      className={cn(baseClasses, variants[variant], sizes[size as keyof typeof sizes], className)}
      {...props}
    />
  )
}
