// src/utils/cn.ts

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Função utilitária para combinar classes CSS com Tailwind CSS
 * Combina clsx e tailwind-merge para resolver conflitos
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}