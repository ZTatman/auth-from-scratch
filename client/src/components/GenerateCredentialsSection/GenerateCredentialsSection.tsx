import { useState } from "react";
import { CopyButton } from "../CopyButton/CopyButton";

interface GenerateCredentialsSectionProps {
  onCredentialsGenerated: (username: string, password: string) => void;
}

export function GenerateCredentialsSection({ onCredentialsGenerated }: GenerateCredentialsSectionProps) {
  const [generatedCredentials, setGeneratedCredentials] = useState<{
    username: string;
    password: string;
  } | null>(null);

  const generateRandomCredentials = () => {
    const adjectives = ["Happy", "Clever", "Bright", "Swift", "Bold", "Calm", "Wise", "Brave"];
    const nouns = ["Panda", "Tiger", "Eagle", "Dolphin", "Falcon", "Wolf", "Fox", "Bear"];
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomNumber = Math.floor(Math.random() * 1000);
    const username = `${randomAdjective}${randomNoun}${randomNumber}`;

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    const password = Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");

    setGeneratedCredentials({ username, password });
    onCredentialsGenerated(username, password);
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
