import * as crypto from "crypto"
import * as util from "./util"

import { randomBytes } from "crypto"

export type EncodingSchema = {encode: {[key: string]: string}, decode: {[key: string]: string}}

export function generateHash(pass: string, salt: string) {
    const password = Buffer.from(pass).toString("utf8")
    const hash = crypto.createHmac("sha512", salt.toString()).update(password)
    return hash.digest("hex")
}

// Taken from instantnoodles answer on stack overflow,
// https://stackoverflow.com/questions/23305747/javascript-permutation-generator-with-permutation-length-parameter
export function getPermutations(list, maxLen): string[][] {
    var perm = list.map(function(val) {
        return [val];
    });
    var generate = function(perm, maxLen, currLen) {
        if (currLen === maxLen) {
            return perm;
        }
        for (var i = 0, len = perm.length; i < len; i++) {
            var currPerm = perm.shift();
            for (var k = 0; k < list.length; k++) {
                perm.push(currPerm.concat(list[k]));
            }
        }
        return generate(perm, maxLen, currLen + 1);
    };
    return generate(perm, maxLen, 1);
};

export function* ticker(): Generator<string> {
    let current = 0
    while (true) {
        if (current < 10) yield "0000" + current++
        else if (current < 100) yield "000" + current++
        else if (current < 1000) yield "00" + current++
        else if (current < 10000) yield "0" + current++
        else if (current < 100000) yield "" + current++
    }
}

export function genshort(): EncodingSchema {
    let perms = getPermutations("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".split(""), 3)
    perms = perms.slice(0, 100000)
    const iter = ticker()
    const encode = {}
    const decode = {}
    for (const perm of perms) {
        const val = iter.next().value
        const permstr = perm.join("")
        encode[val] = permstr
    }
    return {
        encode: encode,
        decode: util.flipObj(encode)
    }
}

export class aes {
    static method = "aes-256-cbc"

    /**
     * Encrypts content based on a given key.
     * @param content The data to encrypt
     * @param key The encryption key
     * @param iv The IV for the encryption
     */
    static encrypt(data: Buffer | string, key: Buffer | string, iv: Buffer | string) {
        iv = iv.toString("hex").slice(0, 16)
        const cipher = crypto.createCipheriv("aes-256-cbc", key, iv)
        return Buffer.concat([
            cipher.update(data),
            cipher.final()
        ])
    }

    /**
     * Decrypts content based on a given key
     * @param content The data to decrypt
     * @param key The encryption key
     * @param iv The IV for the decryption
     */
    static decrypt(data: Buffer, key: Buffer | string, iv: Buffer | string) {
        iv = iv.toString("hex").slice(0, 16)
        const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv)
        return Buffer.concat([
            decipher.update(data),
            decipher.final()
        ])
    }

    static createKey(password: string) {
        return crypto.createHash("sha256").update(password).digest("base64").substr(0, 32)
    }
}

export { randomBytes }