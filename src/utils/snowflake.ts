import * as crypto from "crypto"

/**
 * Constructs a new token via the current timestamp, the username, and the hashed password.
 */
export function createToken(username: string): string {
    const payload = {
        stamp: Date.now().toString(),
        name: username,
        inject: crypto.randomBytes(32).toString("base64")
    }
    return Buffer.from(JSON.stringify(payload)).toString("base64")
}