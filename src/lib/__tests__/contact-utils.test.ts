import { filterContacts, sortContacts, Contact } from '../contact-utils';

const mockContacts: Contact[] = [
  {
    id: 1,
    name: 'Alice Rossi',
    email: 'alice@example.com',
    created_at: '2026-01-01T10:00:00Z',
    consultations: [
      { id: 101, consultation_date: '2026-05-01T10:00:00Z' },
    ]
  },
  {
    id: 2,
    name: 'Zack Bianchi',
    email: 'zack@example.com',
    created_at: '2026-01-02T10:00:00Z',
    consultations: []
  },
  {
    id: 3,
    name: 'Mario Verdi',
    email: 'mario@test.com',
    created_at: '2026-01-03T10:00:00Z',
    consultations: [
      { id: 103, consultation_date: '2026-06-01T10:00:00Z' },
      { id: 102, consultation_date: '2026-04-01T10:00:00Z' }
    ]
  },
];

describe('contact-utils', () => {

  describe('filterContacts', () => {
    it('should filter by text search query (case-insensitive)', () => {
      const result = filterContacts(mockContacts, 'mario', 'all');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Mario Verdi');
      
      const emailResult = filterContacts(mockContacts, 'test.com', 'all');
      expect(emailResult).toHaveLength(1);
      expect(emailResult[0].email).toBe('mario@test.com');
    });

    it('should filter by hasSome consultations', () => {
      const result = filterContacts(mockContacts, '', 'hasSome');
      expect(result).toHaveLength(2);
      expect(result.map(c => c.name)).toContain('Alice Rossi');
      expect(result.map(c => c.name)).toContain('Mario Verdi');
    });

    it('should filter by none consultations', () => {
      const result = filterContacts(mockContacts, '', 'none');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Zack Bianchi');
    });
  });

  describe('sortContacts', () => {
    it('should sort alphabetically by name', () => {
      const result = sortContacts(mockContacts, 'name');
      expect(result[0].name).toBe('Alice Rossi');
      expect(result[1].name).toBe('Mario Verdi');
      expect(result[2].name).toBe('Zack Bianchi');
    });

    it('should sort by latestConsultation descending', () => {
      const result = sortContacts(mockContacts, 'latestConsultation');
      // Mario has the latest date (June), Alice has (May), Zack has none (0)
      expect(result[0].name).toBe('Mario Verdi');
      expect(result[1].name).toBe('Alice Rossi');
      expect(result[2].name).toBe('Zack Bianchi');
    });
  });
});
