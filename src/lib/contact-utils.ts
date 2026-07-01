export interface Consultation {
  id: number;
  consultation_date: string;
}

export interface Contact {
  id: number;
  name: string;
  email: string;
  created_at: string;
  consultations?: Consultation[];
}

export type ConsultationFilter = 'all' | 'none' | 'hasSome';
export type SortBy = 'name' | 'latestConsultation';

/**
 * Filters a list of contacts based on a search query and a consultation filter.
 */
export function filterContacts(
  contacts: Contact[],
  query: string,
  filterType: ConsultationFilter
): Contact[] {
  const lowerQuery = query.toLowerCase();

  return contacts.filter((contact) => {
    // 1. Text search
    const matchesSearch =
      contact.name.toLowerCase().includes(lowerQuery) ||
      contact.email.toLowerCase().includes(lowerQuery);

    if (!matchesSearch) return false;

    // 2. Consultation filter
    if (filterType === 'hasSome') {
      return contact.consultations && contact.consultations.length > 0;
    }
    if (filterType === 'none') {
      return !contact.consultations || contact.consultations.length === 0;
    }
    return true; // 'all'
  });
}

/**
 * Sorts a list of contacts based on the specified sort type.
 * Mutates the array in place if using standard JS sort, but we return a new sorted array for purity.
 */
export function sortContacts(contacts: Contact[], sortType: SortBy): Contact[] {
  // Create a copy to avoid mutating original array directly
  const sorted = [...contacts];

  return sorted.sort((a, b) => {
    if (sortType === 'name') {
      return a.name.localeCompare(b.name);
    } else if (sortType === 'latestConsultation') {
      // Find latest date for A
      const latestA = a.consultations && a.consultations.length > 0
        ? new Date(a.consultations[0].consultation_date).getTime()
        : 0;
      
      // Find latest date for B
      const latestB = b.consultations && b.consultations.length > 0
        ? new Date(b.consultations[0].consultation_date).getTime()
        : 0;

      // Descending sort
      if (latestA === latestB) {
        // Fallback to name
        return a.name.localeCompare(b.name);
      }
      return latestB - latestA;
    }
    return 0;
  });
}

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #ff007f, #ff7f00)',
  'linear-gradient(135deg, #ec4899, #d946ef)',
  'linear-gradient(135deg, #a855f7, #6366f1)',
  'linear-gradient(135deg, #3b82f6, #06b6d4)',
  'linear-gradient(135deg, #10b981, #84cc16)',
  'linear-gradient(135deg, #f59e0b, #ef4444)',
];

export function getInitials(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function getAvatarGradient(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[index];
}
