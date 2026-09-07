/**
 * Client-side AES-GCM encryption for journal entries.
 *
 * Derives a 256-bit key from the user's password (PBKDF2) and encrypts/decrypts
 * entries in the browser. Raw journal text never touches the network or localStorage
 * — entries are stored as base64 ciphertext + the raw salt/iv for that entry.
 */

const encoder = new TextEncoder()
const decoder = new TextDecoder()

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const base = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password).buffer as ArrayBuffer,
    'PBKDF2',
    false,
    ['deriveKey'],
  )
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: salt.buffer as ArrayBuffer, iterations: 150000, hash: 'SHA-256' },
    base,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}

function toBase64(bytes: Uint8Array): string {
  let bin = ''
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode(...bytes.subarray(i, i + chunk))
  }
  return btoa(bin)
}

function fromBase64(b64: string): Uint8Array {
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes
}

export interface CryptoPayload {
  cipher: string
  iv: string
  salt: string
}

export async function encryptText(password: string, text: string): Promise<CryptoPayload> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await deriveKey(password, salt)
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv.buffer as ArrayBuffer },
    key,
    encoder.encode(text).buffer as ArrayBuffer,
  )
  return {
    cipher: toBase64(new Uint8Array(encrypted)),
    iv: toBase64(iv),
    salt: toBase64(salt),
  }
}

export async function decryptText(password: string, payload: CryptoPayload): Promise<string> {
  const key = await deriveKey(password, fromBase64(payload.salt))
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: fromBase64(payload.iv).buffer as ArrayBuffer },
    key,
    fromBase64(payload.cipher).buffer as ArrayBuffer,
  )
  return decoder.decode(decrypted)
}
