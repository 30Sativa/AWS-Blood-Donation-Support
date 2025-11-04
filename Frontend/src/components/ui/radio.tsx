import * as React from "react"
import { cn } from "@/lib/utils"

export interface RadioProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        type="radio"
        className={cn(
          "h-4 w-4 border-gray-300 text-red-600 focus:ring-red-500 focus:ring-2",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Radio.displayName = "Radio"

export { Radio }

