import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from '../../components/ErrorBoundary.jsx';

const CrashComponent = () => {
  throw new Error('Component Render Failure Trigger');
};

describe('ErrorBoundary Component Tests', () => {
  it('should capture child crashes and display standard fallback banner', () => {
    // Suppress React console error logging of mock render failures during test runs
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <CrashComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Interface Error Detected')).toBeTruthy();
    expect(screen.getByRole('button', { name: /Reload Interface/i })).toBeTruthy();
    
    consoleSpy.mockRestore();
  });
});
