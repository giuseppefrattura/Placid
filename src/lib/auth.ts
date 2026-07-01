import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'placid-contacts-manager-default-secret-key';
export const COOKIE_NAME = 'placid_auth_token';

// Convert string to Uint8Array buffer
function stringToBuffer(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

// Base64URL encode helper - accepts any array-like buffer
function base64urlEncode(buffer: any): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

// Base64URL decode helper
function base64urlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return atob(base64);
}

// Get standard Web Crypto HMAC key
async function getCryptoKey(): Promise<CryptoKey> {
  const keyData = stringToBuffer(JWT_SECRET);
  return crypto.subtle.importKey(
    'raw',
    keyData as any,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

// Generate JWT token
export async function signJWT(payload: Record<string, any>): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = base64urlEncode(stringToBuffer(JSON.stringify(header)));
  const encodedPayload = base64urlEncode(stringToBuffer(JSON.stringify(payload)));
  
  const tokenInput = `${encodedHeader}.${encodedPayload}`;
  const key = await getCryptoKey();
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    stringToBuffer(tokenInput) as any
  );
  
  const encodedSignature = base64urlEncode(signature);
  return `${tokenInput}.${encodedSignature}`;
}

// Verify JWT token and return payload or null
export async function verifyJWT(token: string): Promise<Record<string, any> | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const [header, payload, signature] = parts;
    const tokenInput = `${header}.${payload}`;
    const key = await getCryptoKey();
    
    // Decode base64url signature back to bytes
    const signatureStr = base64urlDecode(signature);
    const signatureBytes = new Uint8Array(signatureStr.length);
    for (let i = 0; i < signatureStr.length; i++) {
      signatureBytes[i] = signatureStr.charCodeAt(i);
    }
    
    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes as any,
      stringToBuffer(tokenInput) as any
    );
    
    if (!isValid) return null;
    
    const decodedPayload = JSON.parse(base64urlDecode(payload));
    
    // Check if expired
    if (decodedPayload.exp && decodedPayload.exp < Date.now() / 1000) {
      return null;
    }
    
    return decodedPayload;
  } catch (error) {
    return null;
  }
}

// Server Side cookies helper
export async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyJWT(token);
}
