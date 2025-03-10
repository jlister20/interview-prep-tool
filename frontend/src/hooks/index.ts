import { useState } from 'react';
import { SessionHistoryItem } from '../types';

/**
 * Custom hook for managing session history state
 * @returns Tuple containing session history state and setter function
 */
export const useSessionHistory = () => {
  const [sessionHistory, setSessionHistory] = useState<SessionHistoryItem[]>([]);
  return [sessionHistory, setSessionHistory] as const;
};

/**
 * Custom hook for managing loading state
 * @param initialState Initial loading state
 * @returns Tuple containing loading state and setter function
 */
export const useLoading = (initialState = false) => {
  const [loading, setLoading] = useState(initialState);
  return [loading, setLoading] as const;
};

/**
 * Custom hook for managing error state
 * @returns Tuple containing error state and setter function
 */
export const useError = () => {
  const [error, setError] = useState<string | null>(null);
  return [error, setError] as const;
};
