export function checkAvailable(): Promise<boolean>;
export function authenticate(promptMessage: string): Promise<{ success: boolean; error?: string }>;
