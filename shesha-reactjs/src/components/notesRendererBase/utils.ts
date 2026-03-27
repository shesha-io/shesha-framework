import { isNullOrWhiteSpace } from "@/utils/nullables";

export const getNoteValidationError = (value: string, minLength?: number, maxLength?: number): string => {
  if (isNullOrWhiteSpace(value))
    return `Please enter some text before saving`;

  if (minLength && value.length < minLength) {
    return `Minimum ${minLength} characters required`;
  }
  if (maxLength && value.length > maxLength) {
    return `Maximum ${maxLength} characters allowed`;
  }
  return '';
};
