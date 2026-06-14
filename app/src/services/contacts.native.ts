import * as Contacts from 'expo-contacts/legacy';
import { ContactsResult } from './contacts';

export const requestPermissions = async (): Promise<boolean> => {
  const { status } = await Contacts.requestPermissionsAsync();
  return status === 'granted';
};

export const getContacts = async (): Promise<ContactsResult> => {
  try {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status !== 'granted') {
      return { success: false, contacts: [], error: 'Permission denied' };
    }

    const { data } = await Contacts.getContactsAsync({
      fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
    });

    if (data.length > 0) {
      const contacts = data
        .filter((c: any) => c.phoneNumbers && c.phoneNumbers.length > 0)
        .map((c: any) => {
          const rawMobile = c.phoneNumbers![0].number || '';
          const cleanMobile = rawMobile.replace(/\D/g, '').slice(-10);
          return {
            name: c.name || 'Unknown',
            mobile: cleanMobile,
          };
        })
        .filter((c: any) => c.mobile.length === 10);

      return { success: true, contacts };
    }

    return { success: true, contacts: [] };
  } catch (error: any) {
    return { success: false, contacts: [], error: error?.message };
  }
};
