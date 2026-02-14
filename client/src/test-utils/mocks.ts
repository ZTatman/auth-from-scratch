export function installClipboardMock(
  writeText: (text: string) => Promise<void>,
): () => void {
  const descriptor = Object.getOwnPropertyDescriptor(navigator, "clipboard");

  Object.defineProperty(navigator, "clipboard", {
    value: { writeText },
    configurable: true,
  });

  return () => {
    if (descriptor) {
      Object.defineProperty(navigator, "clipboard", descriptor);
      return;
    }

    Reflect.deleteProperty(navigator, "clipboard");
  };
}

export function installLocalStorageMock(
  initialEntries: Record<string, string> = {},
): () => void {
  const descriptor = Object.getOwnPropertyDescriptor(window, "localStorage");
  const store = new Map<string, string>(Object.entries(initialEntries));

  const localStorageMock: Pick<
    Storage,
    "getItem" | "setItem" | "removeItem" | "clear"
  > = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
  };

  Object.defineProperty(window, "localStorage", {
    value: localStorageMock,
    configurable: true,
  });

  return () => {
    if (descriptor) {
      Object.defineProperty(window, "localStorage", descriptor);
      return;
    }

    Reflect.deleteProperty(window, "localStorage");
  };
}
