import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import OfflinePage from '../../pages/OfflinePage.jsx';

describe('OfflinePage Component Tests', () => {
  it('renders connection loss header and retry options', () => {
    render(<OfflinePage />);
    expect(screen.getByText('Connection Lost')).toBeTruthy();
    expect(screen.getByText(/You are currently offline/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /Retry Connection/i })).toBeTruthy();
  });
});
