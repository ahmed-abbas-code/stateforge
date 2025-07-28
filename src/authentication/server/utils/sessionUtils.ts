// src/authentication/server/utils/sessionUtils.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthProviderInstances } from './authRegistry';
import { getSessionCookieName } from '../../shared/utils/getSessionCookieName';
import type {
  Session,
  SessionMap,
  AuthProviderType,
  AuthContext,
} from '@authentication/shared';

let latestSessions: SessionMap = {};

/**
 * Load all valid sessions by verifying tokens from registered provider instances.
 */
export async function getAllSessions(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<SessionMap> {
  const sessions: SessionMap = {};
  const providers = getAuthProviderInstances();

  console.log('[getAllSessions] Raw req.cookies:', req.cookies);

  for (const [instanceId, provider] of Object.entries(providers)) {
    const cookieName = getSessionCookieName(provider.type, provider.id);
    const token = req.cookies?.[cookieName];

    if (!token) {
      console.warn(`[getAllSessions] No token found for provider '${provider.type}' (cookie: '${cookieName}')`);
      continue;
    }

    console.log(`[getAllSessions] Found token for '${provider.type}' [${provider.id}]`);

    try {
      let session = await provider.verifyToken(req, res);

      if (session) {
        session.provider = provider.type;
        session.providerId = provider.id;

        if (provider.onVerifySuccess) {
          const context: AuthContext = { req, res, existingSessions: { ...sessions } };
          session = await provider.onVerifySuccess(session, context);
        }
      }

      if (session) {
        sessions[provider.id] = session;
        console.log(`[getAllSessions] Session verified for '${provider.id}':`, session);
      } else {
        console.warn(`[getAllSessions] Session verification returned null for '${provider.id}'`);
      }
    } catch (err) {
      console.warn(`[getAllSessions] Token verification failed for '${provider.id}':`, err);
    }
  }

  latestSessions = sessions;
  return sessions;
}

/**
 * Refresh all sessions using optional provider-level refreshToken hooks.
 */
export async function refreshSessions(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<SessionMap> {
  const sessions: SessionMap = {};
  const providers = getAuthProviderInstances();

  for (const [_instanceId, provider] of Object.entries(providers)) {
    if (!provider.refreshToken) continue;

    try {
      const context: AuthContext = { req, res, existingSessions: { ...sessions } };
      let session = await provider.refreshToken(context);

      if (session) {
        session.provider = provider.type;
        session.providerId = provider.id;

        // Ensure expiresAt is set (fallback to JWT decode if needed)
        if (!session.expiresAt && session.token) {
          try {
            const payload = JSON.parse(
              Buffer.from(session.token.split('.')[1], 'base64').toString('utf8')
            );
            if (payload.exp) {
              session.expiresAt = payload.exp * 1000; // seconds → ms
            }
          } catch (err) {
            console.warn(`[refreshSessions] Failed to decode token expiry for ${provider.id}:`, err);
          }
        }

        if (provider.onVerifySuccess) {
          session = await provider.onVerifySuccess(session, context);
        }

        sessions[provider.id] = session;
      }
    } catch (err) {
      console.warn(`[refreshSessions] Refresh failed for '${provider.id}':`, err);
    }
  }

  latestSessions = sessions;
  return sessions;
}

/**
 * Backward compatibility alias.
 */
export const getSession = getAllSessions;

/**
 * Get the "primary" session (by provider priority or first available).
 */
export async function getPrimarySession(
  req: NextApiRequest,
  res: NextApiResponse,
  preferredOrder: string[] = ['firebase', 'auth0', 'jwt']
): Promise<Session | null> {
  const sessions = Object.keys(latestSessions).length
    ? latestSessions
    : await getAllSessions(req, res);

  for (const id of preferredOrder) {
    if (sessions[id]) return sessions[id];
  }

  return Object.values(sessions)[0] ?? null;
}

/**
 * Get a specific session by provider instance ID.
 */
export function getSessionById(
  sessions: SessionMap,
  id: string
): Session | undefined {
  return sessions[id];
}

/**
 * Check if a specific provider instance has an active session.
 */
export function hasSessionById(
  sessions: SessionMap,
  id: string
): boolean {
  return !!sessions[id];
}

/**
 * Get all sessions for a specific provider type (e.g. 'jwt').
 */
export function getSessionsByType(
  sessions: SessionMap,
  type: AuthProviderType
): Partial<SessionMap> {
  const providers = getAuthProviderInstances();
  return Object.fromEntries(
    Object.entries(sessions).filter(([id]) => providers[id]?.type === type)
  );
}

/**
 * Check if any session is active.
 */
export function hasAnySession(sessions: SessionMap): boolean {
  return Object.keys(sessions).length > 0;
}
