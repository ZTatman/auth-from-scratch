import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const AUTH_TOKEN_KEY = "auth_token";

/**
 * Displays information about where the auth token is stored
 * and provides educational context about storage options.
 */
export function StorageInspector() {
  const [storedToken, setStoredToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Read token from localStorage
  useEffect(() => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    setStoredToken(token);

    // Listen for storage changes
    const handleStorageChange = () => {
      setStoredToken(localStorage.getItem(AUTH_TOKEN_KEY));
    };

    window.addEventListener("storage", handleStorageChange);

    // Also poll periodically since storage events don't fire in the same tab
    const interval = setInterval(() => {
      setStoredToken(localStorage.getItem(AUTH_TOKEN_KEY));
    }, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const handleCopy = async () => {
    if (storedToken) {
      await navigator.clipboard.writeText(storedToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const truncatedToken = storedToken
    ? storedToken.length > 50
      ? storedToken.substring(0, 50) + "..."
      : storedToken
    : null;

  return (
    <div className="space-y-4">
      {/* Current Storage Status */}
      <div className="rounded-md border p-3">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline">localStorage</Badge>
            <code className="text-xs text-muted-foreground">
              {AUTH_TOKEN_KEY}
            </code>
          </div>
          <Badge variant={storedToken ? "default" : "secondary"}>
            {storedToken ? "Token Present" : "Empty"}
          </Badge>
        </div>

        {storedToken ? (
          <div className="mt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Current value:
              </span>
              <Button variant="ghost" size="sm" onClick={handleCopy}>
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
            <pre className="mt-1 overflow-x-auto rounded-md bg-muted p-2 text-xs">
              {truncatedToken}
            </pre>
          </div>
        ) : (
          <p className="mt-2 text-xs text-muted-foreground">
            No token stored. Login to see the token here.
          </p>
        )}
      </div>

      {/* Educational Content */}
      <Accordion type="single" collapsible>
        <AccordionItem value="why-localstorage">
          <AccordionTrigger className="text-sm">
            Why localStorage?
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 text-xs text-muted-foreground">
              <p>
                <strong>localStorage</strong> is a simple key-value storage in
                the browser that persists across sessions. For this educational
                demo, we use it because:
              </p>
              <ul className="list-inside list-disc space-y-1 pl-2">
                <li>Simple to implement and understand</li>
                <li>Token persists after browser refresh</li>
                <li>Easy to inspect in browser DevTools</li>
              </ul>
              <div className="rounded-md border border-amber-500/50 bg-amber-500/10 p-2">
                <p className="font-medium text-amber-700 dark:text-amber-400">
                  Security Note:
                </p>
                <p className="mt-1">
                  localStorage is vulnerable to XSS attacks. In production apps,
                  consider using httpOnly cookies for token storage.
                </p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="alternatives">
          <AccordionTrigger className="text-sm">
            Storage Alternatives
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 text-xs">
              <StorageOption
                name="httpOnly Cookies"
                pros={[
                  "Not accessible via JavaScript (XSS protection)",
                  "Automatically sent with requests",
                  "Can be secured with SameSite flag",
                ]}
                cons={[
                  "Requires server-side setup",
                  "CSRF protection needed",
                  "Slightly more complex",
                ]}
              />
              <StorageOption
                name="sessionStorage"
                pros={[
                  "Same API as localStorage",
                  "Cleared when tab closes",
                  "Tab-isolated",
                ]}
                cons={[
                  "Still vulnerable to XSS",
                  "Token lost on tab close",
                  "No cross-tab sharing",
                ]}
              />
              <StorageOption
                name="In-Memory (React State)"
                pros={[
                  "Most secure from XSS",
                  "No persistence on disk",
                  "Simple implementation",
                ]}
                cons={[
                  "Lost on page refresh",
                  "No persistence",
                  "Poor UX for long sessions",
                ]}
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="devtools">
          <AccordionTrigger className="text-sm">
            View in DevTools
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 text-xs text-muted-foreground">
              <p>To view the stored token in your browser:</p>
              <ol className="list-inside list-decimal space-y-1 pl-2">
                <li>Open DevTools (F12 or Cmd+Option+I)</li>
                <li>Go to Application tab (Chrome) or Storage tab (Firefox)</li>
                <li>Expand "Local Storage" in the sidebar</li>
                <li>
                  Click on your site's origin (e.g., localhost:3000)
                </li>
                <li>
                  Find the <code className="rounded bg-muted px-1">auth_token</code>{" "}
                  key
                </li>
              </ol>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

interface StorageOptionProps {
  name: string;
  pros: string[];
  cons: string[];
}

function StorageOption({ name, pros, cons }: StorageOptionProps) {
  return (
    <div className="rounded-md border p-2">
      <p className="font-medium text-foreground">{name}</p>
      <div className="mt-1 grid grid-cols-2 gap-2">
        <div>
          <p className="text-green-600 dark:text-green-400">Pros:</p>
          <ul className="list-inside list-disc text-muted-foreground">
            {pros.map((pro, i) => (
              <li key={i}>{pro}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-destructive">Cons:</p>
          <ul className="list-inside list-disc text-muted-foreground">
            {cons.map((con, i) => (
              <li key={i}>{con}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
