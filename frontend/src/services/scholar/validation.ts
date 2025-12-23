import { Scholar, ScholarSchema, LiteraryWork, LiteraryWorkSchema } from './types';

/**
 * Validation result interface
 */
export interface ValidationResult {
  valid: boolean;
  errors?: string[];
}

/**
 * Validates a Scholar object ensuring all required fields are present and valid.
 * Required fields: id, name, dynasty
 * 
 * @param data - The data to validate as a Scholar
 * @returns ValidationResult indicating if the data is valid
 */
export function validateScholar(data: unknown): ValidationResult {
  const result = ScholarSchema.safeParse(data);
  
  if (result.success) {
    return { valid: true };
  }
  
  const errors = result.error.issues.map((err: any) => {
    const path = err.path.join('.');
    return `${path}: ${err.message}`;
  });
  
  return { valid: false, errors };
}

/**
 * Validates a LiteraryWork object ensuring all required fields are present and valid.
 * 
 * @param data - The data to validate as a LiteraryWork
 * @returns ValidationResult indicating if the data is valid
 */
export function validateLiteraryWork(data: unknown): ValidationResult {
  const result = LiteraryWorkSchema.safeParse(data);
  
  if (result.success) {
    return { valid: true };
  }
  
  const errors = result.error.issues.map((err: any) => {
    const path = err.path.join('.');
    return `${path}: ${err.message}`;
  });
  
  return { valid: false, errors };
}

/**
 * Type guard to check if data is a valid Scholar
 * 
 * @param data - The data to check
 * @returns True if data is a valid Scholar
 */
export function isValidScholar(data: unknown): data is Scholar {
  return validateScholar(data).valid;
}

/**
 * Type guard to check if data is a valid LiteraryWork
 * 
 * @param data - The data to check
 * @returns True if data is a valid LiteraryWork
 */
export function isValidLiteraryWork(data: unknown): data is LiteraryWork {
  return validateLiteraryWork(data).valid;
}
