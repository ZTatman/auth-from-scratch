import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { JsonBlock } from "../JsonBlock/JsonBlock";

interface JWTDecoderProps {
  token: string;
}

interface DecodedJWT {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
}

/**
 * Decodes and displays JWT token structure for educational purposes.
 */
export function JWTDecoder({ token }: JWTDecoderProps) {
  const [copied, setCopied] = useState(false);

  const decoded = useMemo(() => decodeJWT(token), [token]);
  const parts = token.split(".");

  const handleCopy = async () => {
    await navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!decoded) {
    return (
      <div className="text-sm text-destructive">
        Invalid JWT token format
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Raw Token */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">
            Raw Token:
          </span>
          <Button variant="ghost" size="sm" onClick={handleCopy}>
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>
        <div className="overflow-x-auto rounded-md bg-muted p-2">
          <code className="break-all text-xs">
            <span className="text-red-500">{parts[0]}</span>
            <span className="text-muted-foreground">.</span>
            <span className="text-purple-500">{parts[1]}</span>
            <span className="text-muted-foreground">.</span>
            <span className="text-blue-500">{parts[2]}</span>
          </code>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          <span className="text-red-500">Header</span>
          {" · "}
          <span className="text-purple-500">Payload</span>
          {" · "}
          <span className="text-blue-500">Signature</span>
        </p>
      </div>

      {/* Decoded Sections */}
      <Accordion type="multiple" defaultValue={["header", "payload"]}>
        {/* Header */}
        <AccordionItem value="header">
          <AccordionTrigger className="text-sm">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-red-500/10 text-red-500">
                Header
              </Badge>
              <span className="text-muted-foreground">Algorithm & Type</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <JsonBlock data={decoded.header} />
            <p className="mt-2 text-xs text-muted-foreground">
              The header specifies the algorithm used to sign the token (e.g.,
              HS256) and the token type (JWT).
            </p>
          </AccordionContent>
        </AccordionItem>

        {/* Payload */}
        <AccordionItem value="payload">
          <AccordionTrigger className="text-sm">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="bg-purple-500/10 text-purple-500"
              >
                Payload
              </Badge>
              <span className="text-muted-foreground">User Data & Claims</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <JsonBlock data={decoded.payload} />
            <div className="mt-2 space-y-1">
              {typeof decoded.payload.exp === "number" && (
                <p className="text-xs text-muted-foreground">
                  <strong>exp:</strong> Token expires at{" "}
                  {new Date(decoded.payload.exp * 1000).toLocaleString()}
                </p>
              )}
              {typeof decoded.payload.iat === "number" && (
                <p className="text-xs text-muted-foreground">
                  <strong>iat:</strong> Token issued at{" "}
                  {new Date(decoded.payload.iat * 1000).toLocaleString()}
                </p>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Signature */}
        <AccordionItem value="signature">
          <AccordionTrigger className="text-sm">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-500/10 text-blue-500">
                Signature
              </Badge>
              <span className="text-muted-foreground">Verification</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <pre className="overflow-x-auto rounded-md bg-muted p-2 text-xs">
              {decoded.signature}
            </pre>
            <p className="mt-2 text-xs text-muted-foreground">
              The signature is created by signing the encoded header and payload
              with a secret key. The server uses this to verify the token hasn't
              been tampered with.
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Educational Note */}
      <div className="rounded-md border border-dashed p-3">
        <p className="text-xs text-muted-foreground">
          <strong>Security Note:</strong> JWTs are not encrypted - anyone can
          decode the header and payload. Never store sensitive data in a JWT.
          The signature only ensures the token hasn't been modified.
        </p>
      </div>
    </div>
  );
}

/**
 * Decode a JWT token into its parts.
 */
function decodeJWT(token: string): DecodedJWT | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const header = JSON.parse(atob(parts[0]));
    const payload = JSON.parse(atob(parts[1]));
    const signature = parts[2];

    return { header, payload, signature };
  } catch {
    return null;
  }
}
