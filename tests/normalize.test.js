import { describe, it, expect } from 'vitest';
import { normalizeArticle, normalizeProfile, normalizeUser } from '../src/utils/normalize.js';
import { validateField, rules } from '../src/services/validation.service.js';
import { truncate, escapeText } from '../src/utils/sanitize.js';

describe('normalizeArticle', () => {
  it('maps Supabase snake_case fields to UI model', () => {
    const article = normalizeArticle({
      id: 'abc',
      title: 'Heart Health',
      content: 'Body',
      cover_url: 'https://example.com/cover.jpg',
      created_at: '2024-01-01T00:00:00.000Z',
      category: 'cardiology',
      profiles: { full_name: 'Dr. Smith', bio: 'Cardiologist' },
    });

    expect(article.id).toBe('abc');
    expect(article.cover).toBe('https://example.com/cover.jpg');
    expect(article.createdAt).toBe('2024-01-01T00:00:00.000Z');
    expect(article.author.name).toBe('Dr. Smith');
  });
});

describe('normalizeUser', () => {
  it('prefers profile full_name over metadata', () => {
    const user = normalizeUser({
      id: '1',
      email: 'user@test.com',
      user_metadata: { full_name: 'Meta Name' },
      profile: { full_name: 'Profile Name', role: 'admin', bio: 'Bio' },
    });

    expect(user.name).toBe('Profile Name');
    expect(user.role).toBe('admin');
    expect(user.email).toBe('user@test.com');
  });
});

describe('normalizeProfile', () => {
  it('normalizes admin user rows', () => {
    const profile = normalizeProfile({
      id: '1',
      full_name: 'Admin User',
      email: 'admin@test.com',
      role: 'admin',
      active: true,
      created_at: '2024-02-01T00:00:00.000Z',
    });

    expect(profile.name).toBe('Admin User');
    expect(profile.email).toBe('admin@test.com');
    expect(profile.active).toBe(true);
  });
});

describe('validation.service', () => {
  it('validates email format', () => {
    expect(validateField('bad-email', [rules.email])).toBe('Enter a valid email address');
    expect(validateField('good@example.com', [rules.email])).toBeNull();
  });

  it('enforces strong password rules', () => {
    expect(validateField('short', [rules.strongPassword])).toContain('8 characters');
    expect(validateField('longenough1', [rules.strongPassword])).toContain('uppercase');
    expect(validateField('StrongPass1', [rules.strongPassword])).toBeNull();
  });
});

describe('sanitize helpers', () => {
  it('escapes HTML entities in text', () => {
    expect(escapeText('<script>')).toBe('&lt;script&gt;');
  });

  it('truncates long plain text', () => {
    const text = 'word '.repeat(40);
    expect(truncate(text, 20).length).toBeLessThanOrEqual(21);
  });
});
