import type { Access, FieldAccess } from 'payload'

/** Whether the logged-in user is a staff member/admin (collection `users`). */
export const isAdmin: Access = ({ req: { user } }) => user?.collection === 'users'

/** Field-level access version (returns boolean). */
export const isAdminField: FieldAccess = ({ req: { user } }) => user?.collection === 'users'

/** Any authenticated user (admin or client) can read. */
export const isAuthenticated: Access = ({ req: { user } }) => Boolean(user)

/**
 * Admin sees everything; a client sees only their own record (by the `id` field).
 * Used for the `clients` collection.
 */
export const adminOrSelf: Access = ({ req: { user } }) => {
  if (!user) return false
  if (user.collection === 'users') return true
  return { id: { equals: user.id } }
}

/**
 * Admin sees everything; a client sees only documents where the `client` field
 * points to them. Used for `workout-logs` and `assignments`.
 */
export const adminOrOwnByClient: Access = ({ req: { user } }) => {
  if (!user) return false
  if (user.collection === 'users') return true
  return { client: { equals: user.id } }
}

/** @deprecated alias kept for readability in workout-logs */
export const adminOrOwnLogs = adminOrOwnByClient
