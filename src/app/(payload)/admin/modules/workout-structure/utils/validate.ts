import type { TextFieldValidation } from 'payload'

type SiblingData = Record<string, unknown>

export const validateRounds: TextFieldValidation = (value) => {
  if (value && !/^[\d\-–]+$/.test(String(value))) return 'Format: number or range (e.g. 4, 3–4)'
  return true
}

export const validateRepsOrKg: TextFieldValidation = (value, { siblingData }) => {
  if (!value && !(siblingData as SiblingData)?.kg) return 'Enter reps or load'
  return true
}

export const validateKgOrReps: TextFieldValidation = (value, { siblingData }) => {
  if (!value && !(siblingData as SiblingData)?.reps) return 'Enter reps or load'
  return true
}

export const validateDurationMinutes: TextFieldValidation = (value, { siblingData }) => {
  if ((siblingData as SiblingData)?.protocol === 'amrap' && (!value || isNaN(Number(value))))
    return 'Enter duration (minutes)'
  return true
}

export const validateIntervalSeconds: TextFieldValidation = (value, { siblingData }) => {
  if ((siblingData as SiblingData)?.protocol === 'emom' && (!value || isNaN(Number(value))))
    return 'Enter interval (seconds)'
  return true
}

export const validateWorkSeconds: TextFieldValidation = (value, { siblingData }) => {
  if ((siblingData as SiblingData)?.protocol === 'tabata' && (!value || isNaN(Number(value))))
    return 'Enter work duration'
  return true
}

export const validateRestSeconds: TextFieldValidation = (value, { siblingData }) => {
  if ((siblingData as SiblingData)?.protocol === 'tabata' && (!value || isNaN(Number(value))))
    return 'Enter rest duration'
  return true
}
