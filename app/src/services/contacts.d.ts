export interface ContactInfo {
  name: string;
  mobile: string;
}

export interface ContactsResult {
  success: boolean;
  contacts: ContactInfo[];
  error?: string;
}

/**
 * Returns true if the device has permission to access contacts.
 */
export const requestPermissions: () => Promise<boolean>;

/**
 * Fetches contacts from the device.
 */
export const getContacts: () => Promise<ContactsResult>;
