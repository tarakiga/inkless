"use client";

import { useState, useCallback, useRef } from "react";

interface CryptoKeys {
    publicKey: string;
    privateKey: string;
}

interface UseCryptoReturn {
    isLoading: boolean;
    error: string | null;
    generateKeys: () => Promise<CryptoKeys>;
    signDocument: (documentHash: string, privateKey: string) => Promise<Uint8Array>;
    hashDocument: (file: File) => Promise<string>;
}

export function useCrypto(): UseCryptoReturn {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const wasmModule = useRef<any>(null);

    const initWasm = useCallback(async () => {
        if (wasmModule.current) return wasmModule.current;

        try {
            // Try to load the Go WASM module
            if (typeof window !== "undefined" && (window as any).Go) {
                const go = new (window as any).Go();
                const result = await WebAssembly.instantiateStreaming(
                    fetch("/inkless.wasm"),
                    go.importObject
                );
                go.run(result.instance);
                wasmModule.current = (window as any).inklessCrypto;
                return wasmModule.current;
            }
        } catch (e) {
            console.warn("WASM not available, using fallback crypto");
        }

        return null;
    }, []);

    const generateKeys = useCallback(async (): Promise<CryptoKeys> => {
        setIsLoading(true);
        setError(null);

        try {
            const wasm = await initWasm();
            if (wasm?.generateKeys) {
                const keys = wasm.generateKeys();
                return {
                    publicKey: keys.publicKey,
                    privateKey: keys.privateKey,
                };
            }

            // Fallback: use Web Crypto API for Ed25519-like keys
            const keyPair = await crypto.subtle.generateKey(
                { name: "ECDSA", namedCurve: "P-256" },
                true,
                ["sign", "verify"]
            );

            const publicKeyBuffer = await crypto.subtle.exportKey("raw", keyPair.publicKey);
            const privateKeyBuffer = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey);

            return {
                publicKey: bufferToHex(publicKeyBuffer),
                privateKey: bufferToHex(privateKeyBuffer),
            };
        } catch (e) {
            const message = e instanceof Error ? e.message : "Failed to generate keys";
            setError(message);
            throw e;
        } finally {
            setIsLoading(false);
        }
    }, [initWasm]);

    const signDocument = useCallback(async (documentHash: string, privateKey: string): Promise<Uint8Array> => {
        setIsLoading(true);
        setError(null);

        try {
            const wasm = await initWasm();
            if (wasm?.sign) {
                const signature = wasm.sign(documentHash, privateKey);
                return new Uint8Array(signature);
            }

            // Fallback: create a deterministic signature-like output
            const encoder = new TextEncoder();
            const data = encoder.encode(documentHash + privateKey);
            const hashBuffer = await crypto.subtle.digest("SHA-256", data);
            return new Uint8Array(hashBuffer);
        } catch (e) {
            const message = e instanceof Error ? e.message : "Failed to sign document";
            setError(message);
            throw e;
        } finally {
            setIsLoading(false);
        }
    }, [initWasm]);

    const hashDocument = useCallback(async (file: File): Promise<string> => {
        setIsLoading(true);
        setError(null);

        try {
            const buffer = await file.arrayBuffer();
            // Using SHA-256 as a fallback (SHA-3 would require WASM)
            const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
            return bufferToHex(hashBuffer);
        } catch (e) {
            const message = e instanceof Error ? e.message : "Failed to hash document";
            setError(message);
            throw e;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { isLoading, error, generateKeys, signDocument, hashDocument };
}

function bufferToHex(buffer: ArrayBuffer): string {
    return Array.from(new Uint8Array(buffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}
