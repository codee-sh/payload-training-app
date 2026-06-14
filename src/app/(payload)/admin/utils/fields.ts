import type { TextFieldClient } from 'payload'

export const textField = (name: string, label: string, placeholder?: string): TextFieldClient =>
  ({ name, label, type: 'text', admin: { placeholder } }) as TextFieldClient
