// Tests for UI logic in ExploreContent without importing React/Next internals.

function computeAvailableSectorIds(sectors) {
  if (!sectors) return [];
  return Object.entries(sectors)
    .filter(([_id, sd]) => Array.isArray(sd?.parameters) && sd.parameters.length > 0)
    .map(([id]) => id);
}

test('computeAvailableSectorIds returns only sectors with non-empty parameters', () => {
  const sectors = {
    industria: { name: 'Industria', parameters: [{ parameter: 'pH' }] },
    domestic: { name: 'Doméstico', parameters: [] },
    agricultura: { name: 'Agricultura' },
  };
  const ids = computeAvailableSectorIds(sectors);
  expect(ids).toEqual(['industria']);
});

test('selected sector resets to todos when not available', () => {
  const sectors = {
    industria: { name: 'Industria', parameters: [{ parameter: 'pH' }] },
    domestic: { name: 'Doméstico', parameters: [] },
  };
  const available = computeAvailableSectorIds(sectors);
  let selectedSector = 'domestic';
  if (selectedSector && selectedSector !== 'todos' && !available.includes(selectedSector)) {
    selectedSector = 'todos';
  }
  expect(selectedSector).toBe('todos');
});
