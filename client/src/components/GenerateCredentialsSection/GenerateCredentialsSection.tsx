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
      "happy",
      "clever",
      "bright",
      "swift",
      "bold",
      "calm",
      "wise",
      "brave",
    ];
    const nouns = [
      "panda",
      "tiger",
      "eagle",
      "dolphin",
      "falcon",
      "wolf",
      "fox",
      "bear",
    ];
    const randomAdjective =
      adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomNumber = Math.floor(Math.random() * 1000);
    const username = `${randomAdjective}${randomNoun}${randomNumber}`;

    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    const password = Array.from(
      { length: 12 },
      () => chars[Math.floor(Math.random() * chars.length)]
    ).join("");

    setGeneratedCredentials({ username, password });
    onCredentialsGenerated(username, password);
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={generateRandomCredentials}
        className="text-blue-500 hover:text-blue-700 underline text-sm transition-colors duration-200"
      >
        Generate random credentials
      </button>
      {generatedCredentials && (
        <div className="bg-gray-50 border border-gray-200 rounded-md p-3 text-sm flex justify-between items-start gap-3">
          <div className="flex-1">
            <p className="text-gray-700 mb-1">
              <span className="font-medium">Username:</span>{" "}
              {generatedCredentials.username}
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Password:</span>{" "}
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
