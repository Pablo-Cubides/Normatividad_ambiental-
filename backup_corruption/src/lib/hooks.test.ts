import { renderHook, act } from '@testing-library/react';
import { useDebouncedSearch, useMemoizedValue, useDebouncedCallback } from '@/lib/hooks';

describe('Custom Hooks', () => {
  describe('useDebouncedSearch', () => {
    it('should return initial value immediately', () => {
      const { result } = renderHook(() => useDebouncedSearch('initial', 100));
      expect(result.current.value).toBe('initial');
      expect(result.current.debouncedValue).toBe('initial');
    });

    it('should update value immediately but debounce debouncedValue', async () => {
      const { result } = renderHook(() => useDebouncedSearch('', 100));

      act(() => {
        result.current.setValue('test');
      });

      expect(result.current.value).toBe('test');
      expect(result.current.debouncedValue).toBe('');

      // Wait for debounce
      await new Promise(resolve => setTimeout(resolve, 150));
      expect(result.current.debouncedValue).toBe('test');
    });
  });

  describe('useMemoizedValue', () => {
    it('should memoize expensive computations', () => {
      let callCount = 0;
      const expensiveFunction = () => {
        callCount++;
        return callCount;
      };

      const { result, rerender } = renderHook(
        ({ deps }) => useMemoizedValue(expensiveFunction, deps),
        { initialProps: { deps: [1] } }
      );

      expect(result.current).toBe(1);

      // Rerender with same deps - should not call function again
      rerender({ deps: [1] });
      expect(result.current).toBe(1);
      expect(callCount).toBe(1);

      // Rerender with different deps - should call function again
      rerender({ deps: [2] });
      expect(result.current).toBe(2);
      expect(callCount).toBe(2);
    });
  });

  describe('useDebouncedCallback', () => {
    it('should debounce callback execution', async () => {
      const mockCallback = jest.fn();
      const { result } = renderHook(() => useDebouncedCallback(mockCallback, 100));

      act(() => {
        result.current();
      });

      expect(mockCallback).not.toHaveBeenCalled();

      // Wait for debounce
      await new Promise(resolve => setTimeout(resolve, 150));
      expect(mockCallback).toHaveBeenCalledTimes(1);
    });
  });
});