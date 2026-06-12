import { invoke as tauriInvoke } from '@tauri-apps/api/core';

// Detect if we are running inside the Tauri Webview
// tauri uses window.__TAURI_INTERNALS__ in v2, or just fallback if invoke throws an error
export const isWebMode = !window.hasOwnProperty('__TAURI_INTERNALS__');

const WEB_API_URL = typeof window !== 'undefined' && isWebMode 
  ? `${window.location.protocol}//${window.location.host}/api`
  : 'http://127.0.0.1:8000/api';

export async function invoke<T>(cmd: string, args: Record<string, any> = {}): Promise<T> {
  if (!isWebMode) {
    try {
      return await tauriInvoke<T>(cmd, args);
    } catch (e: any) {
      // In some environments __TAURI_INTERNALS__ exists but IPC is blocked
      if (e && e.message && e.message.includes('window.__TAURI_IPC__ is not a function')) {
        console.warn('Tauri IPC not found, falling back to Web API');
      } else {
        throw e;
      }
    }
  }

  // Web Mode Fallback: send to Python FastAPI Server
  try {
    const response = await fetch(`${WEB_API_URL}/invoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        cmd,
        args
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Web API Error (${response.status}): ${errorText}`);
    }

    return await response.json() as T;
  } catch (error) {
    console.error(`Failed to execute Web API command '${cmd}':`, error);
    throw error;
  }
}
