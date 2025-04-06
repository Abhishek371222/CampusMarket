import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number as INR currency
 * @param amount The amount to format
 * @param options Intl.NumberFormat options
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number | string, 
  options: Intl.NumberFormatOptions = {}
): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
    ...options
  }).format(numAmount);
}

/**
 * Get animated transition properties for framer-motion
 */
export const smoothTransition = {
  type: "spring",
  stiffness: 260,
  damping: 20
};

/**
 * Get staggered delay for animations
 * @param index The index of the element in the list
 * @param baseDelay Base delay in seconds
 * @returns Delay value in seconds
 */
export function getStaggeredDelay(index: number, baseDelay: number = 0.1): number {
  return baseDelay + (index * 0.05);
}
