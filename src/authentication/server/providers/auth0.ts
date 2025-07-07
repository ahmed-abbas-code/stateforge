// src/authentication/server/providers/auth0.ts

import { AuthUser } from "@authentication/shared";



export async function verifyToken(): Promise<AuthUser> {
  throw new Error('[auth0.verifyToken] Not implemented');
}

export async function signIn(): Promise<void> {
  throw new Error('[auth0.signIn] Not implemented');
}

export async function signOut(): Promise<void> {
  throw new Error('[auth0.signOut] Not implemented');
}
