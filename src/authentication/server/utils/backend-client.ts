// src/authentication/server/utils/backend-client.ts

/* eslint-env browser */
// @sf/backend-client.ts


import { getAuthHeaders } from "@authentication/server/middleware";
import { getServerFrameworkConfig } from "@shared/utils/server";

// Retrieve runtime framework config
const { BACKEND_APP_API_BASE_URL } = getServerFrameworkConfig();

/**
 * Downloads a file from the API, using auth headers, and triggers a browser download.
 * @param endpointPath The API path (e.g. `/reports/{id}/download`).
 * @param suggestedFilename Optional local filename for the download.
 */
export async function downloadFile(
  endpointPath: string,
  suggestedFilename?: string
): Promise<void> {
  const url = `${BACKEND_APP_API_BASE_URL}${endpointPath}`;
  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Download failed: ${response.status} ${errorText}`);
  }

  const blob = await response.blob();
  const contentDisposition = response.headers.get("Content-Disposition");
  let filename = suggestedFilename;

  if (!filename && contentDisposition) {
    const match = /filename="?([^";]+)"?/.exec(contentDisposition);
    if (match) filename = match[1];
  }
  if (!filename) filename = "download";

  // Use window.URL to satisfy ESLint/browser globals
  const objectUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(objectUrl);
}