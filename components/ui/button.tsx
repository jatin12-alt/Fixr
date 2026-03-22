import * as React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary'
  size?: 'default' | 'sm' | 'lg'
}

export function Button({
  className = '',
  variant = 'default',
  size = 'default',
  ...props
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-all duration-200 disabled:opacity-50 cursor-pointer'
  
  const variants = {
    default:     'bg-blue-600 text-white hover:bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.4)] hover:shadow-[0_0_25px_rgba(59,130,246,0.6)]',
    destructive: 'bg-red-600 text-white hover:bg-red-500',
    outline:     'border border-white/20 bg-transparent text-white hover:bg-white/10 hover:border-white/40',
    secondary:   'bg-white/10 text-white hover:bg-white/20 border border-white/10',
  }
  
  const sizes = {
    default: 'h-10 px-4 py-2 text-sm',
    sm:      'h-8 px-3 text-xs',
    lg:      'h-12 px-8 text-base',
  }

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  )
}
