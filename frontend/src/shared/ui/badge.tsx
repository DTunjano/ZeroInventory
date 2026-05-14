import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/shared/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0',
  {
    variants: {
      variant: {
        default: 'bg-blue-600 text-white border-blue-700 dark:bg-blue-500 dark:border-blue-600',
        secondary: 'bg-slate-200 text-slate-800 border-slate-300 dark:bg-gray-700 dark:text-white dark:border-gray-600',
        outline: 'border-slate-300 text-slate-700 dark:border-white/30 dark:text-white',
        destructive: 'bg-red-600 text-white border-red-700 dark:bg-red-600 dark:text-white dark:border-red-700',
        success: 'bg-green-500/20 text-green-200 border-green-500/30 dark:bg-green-600/20 dark:text-green-200',
        reduction: 'bg-red-500/20 text-red-200 border-red-500/30 dark:bg-red-600/20 dark:text-red-200',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}
