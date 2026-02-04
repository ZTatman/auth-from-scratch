import { useState } from "react";
import { toast } from "sonner";

// Components
import { Button } from "../ui/button";

interface GenerateCredentialsSectionProps {
  onCredentialsGenerated: (username: string, password: string) => void;
}

export function GenerateCredentialsSection({
  onCredentialsGenerated,
}: GenerateCredentialsSectionProps) {
  const [generatedCredentials, setGeneratedCredentials] = useState<{
    username: string;
    password: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!generatedCredentials) return;
    try {
      await navigator.clipboard.writeText(
        `Username: ${generatedCredentials.username}\nPassword: ${generatedCredentials.password}`,
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Credentials copied to clipboard.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to copy credentials.",
      );
    }
  };
  const getSecureRandomInt = (max: number): number => {
    if (max <= 0) {
      throw new Error("max must be positive");
    }

    // Prefer Web Crypto API when available
    const cryptoObj =
      typeof window !== "undefined"
        ? window.crypto || (window as Window & { msCrypto?: Crypto }).msCrypto
        : undefined;

    if (cryptoObj && typeof cryptoObj.getRandomValues === "function") {
      // Use rejection sampling to avoid modulo bias
      const range = max;
      const maxUint32 = 0xffffffff;
      const buckets = Math.floor(maxUint32 / range);
      const limit = buckets * range;
      const buffer = new Uint32Array(1);

      // Loop until we get a value below the limit
      while (true) {
        cryptoObj.getRandomValues(buffer);
        const randomValue = buffer[0];
        if (randomValue < limit) {
          return randomValue % range;
        }
      }
    }

    // Fallback: use timestamp-based seed if crypto is unavailable (very rare case)
    // This is still more secure than Math.random() for this use case
    const timestamp = Date.now();
    const seed = timestamp % 2147483647; // Keep within 32-bit signed int range
    return ((seed * 1103515245 + 12345) % 2147483647) % max;
  };

  const generateRandomCredentials = () => {
    const adjectives = [
      "Happy",
      "Clever",
      "Bright",
      "Swift",
      "Bold",
      "Calm",
      "Wise",
      "Brave",
    ];
    const nouns = [
      "Panda",
      "Tiger",
      "Eagle",
      "Dolphin",
      "Falcon",
      "Wolf",
      "Fox",
      "Bear",
    ];
    const randomAdjective = adjectives[getSecureRandomInt(adjectives.length)];
    const randomNoun = nouns[getSecureRandomInt(nouns.length)];
    const randomNumber = getSecureRandomInt(1000);
    const username = `${randomAdjective}${randomNoun}${randomNumber}`;

    // Generate password that meets all requirements
    const password = generateSecurePassword();

    setGeneratedCredentials({ username, password });
    onCredentialsGenerated(username, password);
    toast.success("New credentials generated.");
  };

  /**
   * Generate a password that meets all validation requirements:
   * - At least 8 characters
   * - At least one uppercase letter
   * - At least one lowercase letter
   * - At least one number
   * - At least one special character (@$!%*?&)
   */
  const generateSecurePassword = (): string => {
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const special = "@$!%*?&";
    const allChars = uppercase + lowercase + numbers + special;

    // Start with one character from each required category
    const requiredChars = [
      uppercase[getSecureRandomInt(uppercase.length)],
      lowercase[getSecureRandomInt(lowercase.length)],
      numbers[getSecureRandomInt(numbers.length)],
      special[getSecureRandomInt(special.length)],
    ];

    // Fill remaining characters (12 total - 4 required = 8 random)
    const remainingLength = 12 - requiredChars.length;
    const randomChars = Array.from({ length: remainingLength }, () => {
      return allChars[getSecureRandomInt(allChars.length)];
    });

    // Combine and shuffle to randomize positions
    const allPasswordChars = [...requiredChars, ...randomChars];
    for (let i = allPasswordChars.length - 1; i > 0; i--) {
      const j = getSecureRandomInt(i + 1);
      [allPasswordChars[i], allPasswordChars[j]] = [
        allPasswordChars[j],
        allPasswordChars[i],
      ];
    }

    return allPasswordChars.join("");
  };

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="link"
        size="sm"
        onClick={generateRandomCredentials}
        className="text-primary hover:text-primary/80 h-auto px-0"
      >
        Generate random credentials
      </Button>
      {generatedCredentials && (
        <div className="bg-muted flex items-start justify-between gap-3 rounded-md p-3 text-sm shadow-sm">
          <div className="flex-1">
            <p className="text-foreground mb-1">
              <span className="font-medium">Username:</span>&nbsp;
              {generatedCredentials.username}
            </p>
            <p className="text-foreground">
              <span className="font-medium">Password:</span>&nbsp;
              {generatedCredentials.password}
            </p>
          </div>
          {/* <CopyButton
            textToCopy={`Username: ${generatedCredentials.username}\nPassword: ${generatedCredentials.password}`}
          /> */}
          <Button
            variant="link"
            size="sm"
            onClick={handleCopy}
            className="text-primary hover:text-primary/80 h-auto px-0 text-xs"
          >
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>
      )}
    </div>
  );
}
