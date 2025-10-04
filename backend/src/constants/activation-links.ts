export const ActivationLinks = {
  USER: 'user',
  SESSION: 'session',
} as const;

export type ActivationLink = (typeof ActivationLinks)[keyof typeof ActivationLinks];
