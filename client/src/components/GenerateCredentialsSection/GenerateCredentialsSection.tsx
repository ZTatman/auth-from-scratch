import { useState } from "react";
import { CopyButton } from "../CopyButton/CopyButton";

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
    const randomAdjective =
      adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomNumber = Math.floor(Math.random() * 1000);
    const username = `${randomAdjective}${randomNoun}${randomNumber}`;

    // Generate password that meets all requirements
    const password = generateSecurePassword();

    setGeneratedCredentials({ username, password });
    onCredentialsGenerated(username, password);
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
      uppercase[Math.floor(Math.random() * uppercase.length)],
      lowercase[Math.floor(Math.random() * lowercase.length)],
      numbers[Math.floor(Math.random() * numbers.length)],
      special[Math.floor(Math.random() * special.length)],
    ];

    // Fill remaining characters (12 total - 4 required = 8 random)
    const remainingLength = 12 - requiredChars.length;
    const randomChars = Array.from(
      { length: remainingLength },
      () => allChars[Math.floor(Math.random() * allChars.length)],
    );

    // Combine and shuffle to randomize positions
    const allPasswordChars = [...requiredChars, ...randomChars];
    for (let i = allPasswordChars.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allPasswordChars[i], allPasswordChars[j]] = [
        allPasswordChars[j],
        allPasswordChars[i],
      ];
    }

    return allPasswordChars.join("");
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={generateRandomCredentials}
        className="text-sm text-blue-500 underline transition-colors duration-200 hover:text-blue-700"
      >
        Generate random credentials
      </button>
      {generatedCredentials && (
        <div className="flex items-start justify-between gap-3 rounded-md border border-gray-200 bg-gray-50 p-3 text-sm">
          <div className="flex-1">
            <p className="mb-1 text-gray-700">
              <span className="font-medium">Username:</span>&nbsp;
              {generatedCredentials.username}
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Password:</span>&nbsp;
              {generatedCredentials.password}
            </p>
          </div>
          <CopyButton
            textToCopy={`Username: ${generatedCredentials.username}\nPassword: ${generatedCredentials.password}`}
          />
        </div>
      )}
    </div>
  );
}
