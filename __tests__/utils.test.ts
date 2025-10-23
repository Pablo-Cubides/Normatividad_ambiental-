import { normalizeData, mergeCandidates } from '../src/lib/utils';

describe('utils', () => {
  describe('normalizeData', () => {
    it('should handle empty object', () => {
      const result = normalizeData({});
      expect(result).toEqual({});
    });

    it('should normalize country field', () => {
      const input = { pais: 'Brasil' };
      const result = normalizeData(input) as any;
      expect(result.country).toBe('Brasil');
    });
  });

  describe('mergeCandidates', () => {
    it('should handle empty object and add metadata', () => {
      const result = mergeCandidates({}, 'agua', 'brasil');
      // Function adds domain and country to result
      expect(result).toHaveProperty('domain', 'agua');
      expect(result).toHaveProperty('country', 'brasil');
    });

    // Add more tests as needed for specific merge logic
  });
});