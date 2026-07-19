import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Login } from '../../pages/Login.jsx';

// Mock routing hooks
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  Link: ({ children }) => <a href="#">{children}</a>
}));

// Mock custom authentication hooks
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    login: vi.fn()
  })
}));

describe('Login View Component Tests', () => {
  it('renders login forms and text inputs correctly', () => {
    render(<Login />);
    
    // Find text placeholders
    expect(screen.getByPlaceholderText(/admin@agritrack.in/i)).toBeTruthy();
    expect(screen.getByPlaceholderText(/••••••••/)).toBeTruthy();
    expect(screen.getByRole('button', { name: /Verify & Sign In/i })).toBeTruthy();
  });
});
