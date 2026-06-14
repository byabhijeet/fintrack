import { ContactsResult } from './contacts';

export const requestPermissions = async (): Promise<boolean> => {
  return false;
};

export const getContacts = async (): Promise<ContactsResult> => {
  return { success: false, contacts: [], error: 'Contacts are only available on native devices' };
};
