'use client';

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import type { Work, ScreenWork, DiffCategory, SpoilerScope } from '@/lib/types';
import { api, ApiError } from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { CheckCircleIcon } from '@/components/ui/Icons';

interface AddDiffFormProps {
  work: Work;
  screenWork: ScreenWork;
}

interface FormData {
  category: DiffCategory | '';
  claim: string;
  detail: string;
  spoiler_scope: SpoilerScope;
}

const DIFF_CATEGORIES: { value: DiffCategory; label: string }[] = [
  { value: 'PLOT', label: 'Plot' },
  { value: 'CHARACTER', label: 'Character' },
  { value: 'ENDING', label: 'Ending' },
  { value: 'SETTING', label: 'Setting' },
  { value: 'THEME', label: 'Theme' },
  { value: 'TONE', label: 'Tone' },
  { value: 'TIMELINE', label: 'Timeline' },
  { value: 'WORLDBUILDING', label: 'Worldbuilding' },
  { value: 'OTHER', label: 'Other' },
];

const SPOILER_SCOPES: { value: SpoilerScope; label: string; description: string }[] = [
  { value: 'NONE', label: 'None (safe/high-level)', description: 'Safe to read for everyone' },
  { value: 'BOOK_ONLY', label: 'Book Only', description: 'Spoils the book but not the adaptation' },
  { value: 'SCREEN_ONLY', label: 'Screen Only', description: 'Spoils the adaptation but not the book' },
  { value: 'FULL', label: 'Full (both)', description: 'Spoils both the book and adaptation' },
];

export default function AddDiffForm({ work, screenWork }: AddDiffFormProps): JSX.Element {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    category: '',
    claim: '',
    detail: '',
    spoiler_scope: 'NONE',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Load draft from localStorage
  useEffect(() => {
    const draftKey = `diff-draft-${work.id}-${screenWork.id}`;
    const savedDraft = localStorage.getItem(draftKey);
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft) as FormData;
        setFormData(draft);
        setIsDirty(true);
      } catch (error) {
        console.error('Failed to load draft:', error);
      }
    }
  }, [work.id, screenWork.id]);

  // Auto-save draft to localStorage
  useEffect(() => {
    if (isDirty) {
      const draftKey = `diff-draft-${work.id}-${screenWork.id}`;
      localStorage.setItem(draftKey, JSON.stringify(formData));
    }
  }, [formData, isDirty, work.id, screenWork.id]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent): string => {
      if (isDirty && !showSuccess) {
        e.preventDefault();
        return '';
      }
      return '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, showSuccess]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setIsDirty(true);
    setError(null);
  };

  const validateForm = (): string | null => {
    if (!formData.category) {
      return 'Please select a category.';
    }
    if (formData.claim.length < 10) {
      return 'Claim must be at least 10 characters long.';
    }
    if (formData.claim.length > 200) {
      return 'Claim must not exceed 200 characters.';
    }
    if (formData.detail.length > 1000) {
      return 'Detail must not exceed 1000 characters.';
    }
    return null;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await api.diffs.create({
        work: work.id,
        screen_work: screenWork.id,
        category: formData.category,
        claim: formData.claim,
        detail: formData.detail,
        spoiler_scope: formData.spoiler_scope,
      });

      // Clear draft from localStorage
      const draftKey = `diff-draft-${work.id}-${screenWork.id}`;
      localStorage.removeItem(draftKey);

      setShowSuccess(true);
      setIsDirty(false);

      // Redirect after brief delay
      setTimeout(() => {
        router.push(`/compare/${work.slug}/${screenWork.slug}`);
      }, 1500);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || 'Failed to create difference. Please try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      setIsSubmitting(false);
    }
  };

  const handleCancel = (): void => {
    if (isDirty && !confirm('Are you sure you want to cancel? Your changes will be saved as a draft.')) {
      return;
    }
    router.push(`/compare/${work.slug}/${screenWork.slug}`);
  };

  const handleClear = (): void => {
    if (confirm('Are you sure you want to clear the form?')) {
      setFormData({
        category: '',
        claim: '',
        detail: '',
        spoiler_scope: 'NONE',
      });
      setIsDirty(false);
      const draftKey = `diff-draft-${work.id}-${screenWork.id}`;
      localStorage.removeItem(draftKey);
    }
  };

  const claimCharCount = formData.claim.length;
  const detailCharCount = formData.detail.length;

  if (showSuccess) {
    return (
      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        <div className="bg-success/10 border border-success rounded-lg p-6 text-center">
          <div className="flex justify-center mb-4">
            <CheckCircleIcon className="w-16 h-16 text-success" />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-success mb-2">
            Difference submitted successfully!
          </h2>
          <p className="text-sm sm:text-base text-success">
            Redirecting you back to the comparison page...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-2">Add New Difference</h1>
        <p className="text-sm sm:text-base text-muted">
          Comparing <span className="font-semibold text-foreground">{work.title}</span> (book) and{' '}
          <span className="font-semibold text-foreground">{screenWork.title}</span> (
          {screenWork.type === 'MOVIE' ? 'movie' : 'TV series'})
        </p>
      </div>

      {error && (
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-danger/10 border border-danger rounded-lg text-sm sm:text-base text-danger">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium mb-2">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="w-full px-3 py-3 text-base bg-surface text-foreground border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-link min-h-[44px]"
          >
            <option value="">Select a category...</option>
            {DIFF_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs sm:text-sm text-muted">
            Choose the category that best describes this difference.
          </p>
        </div>

        {/* Claim */}
        <div>
          <label htmlFor="claim" className="block text-sm font-medium mb-2">
            Claim <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="claim"
            name="claim"
            value={formData.claim}
            onChange={handleChange}
            required
            maxLength={200}
            placeholder="e.g., Ian Malcolm has a larger role in the movie"
            className="w-full px-3 py-3 text-base bg-surface text-foreground border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-link min-h-[44px]"
          />
          <div className="flex flex-col sm:flex-row sm:justify-between mt-1 gap-1">
            <p className="text-xs sm:text-sm text-muted">
              A brief statement describing the difference (10-200 characters).
            </p>
            <span
              className={`text-xs sm:text-sm ${
                claimCharCount < 10
                  ? 'text-danger'
                  : claimCharCount > 200
                  ? 'text-danger'
                  : 'text-muted'
              }`}
            >
              {claimCharCount}/200
            </span>
          </div>
        </div>

        {/* Detail */}
        <div>
          <label htmlFor="detail" className="block text-sm font-medium mb-2">
            Detail (Optional)
          </label>
          <textarea
            id="detail"
            name="detail"
            value={formData.detail}
            onChange={handleChange}
            rows={6}
            maxLength={1000}
            placeholder="Provide a more detailed explanation of the difference..."
            className="w-full px-3 py-3 text-base bg-surface text-foreground border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-link resize-y min-h-[120px]"
          />
          <div className="flex flex-col sm:flex-row sm:justify-between mt-1 gap-1">
            <p className="text-xs sm:text-sm text-muted">
              Optional: Provide more context or explanation (max 1000 characters).
            </p>
            <span className={`text-xs sm:text-sm ${detailCharCount > 1000 ? 'text-danger' : 'text-muted'}`}>
              {detailCharCount}/1000
            </span>
          </div>
        </div>

        {/* Spoiler Scope */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Spoiler Scope <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            {SPOILER_SCOPES.map((scope) => (
              <label
                key={scope.value}
                className="flex items-start gap-3 p-3 bg-surface border border-border rounded-md cursor-pointer hover:bg-surface2 transition-colors min-h-[48px]"
              >
                <input
                  type="radio"
                  name="spoiler_scope"
                  value={scope.value}
                  checked={formData.spoiler_scope === scope.value}
                  onChange={handleChange}
                  className="mt-1 min-w-[20px] min-h-[20px]"
                />
                <div className="flex-1">
                  <div className="font-medium text-sm sm:text-base">{scope.label}</div>
                  <div className="text-xs sm:text-sm text-muted">{scope.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Preview */}
        {formData.claim && (
          <div className="border border-border rounded-lg p-4 bg-surface2">
            <h3 className="text-sm font-medium mb-2">Preview</h3>
            <div className="space-y-2">
              <div>
                <span className="text-xs text-muted uppercase">{formData.category || 'Category'}</span>
              </div>
              <p className="font-medium">{formData.claim}</p>
              {formData.detail && <p className="text-sm text-muted">{formData.detail}</p>}
              <div className="text-xs text-muted">
                Spoiler: {SPOILER_SCOPES.find((s) => s.value === formData.spoiler_scope)?.label}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-link text-white rounded-md hover:bg-link/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium min-h-[48px]"
          >
            {isSubmitting && <LoadingSpinner size="sm" />}
            {isSubmitting ? 'Submitting...' : 'Submit Difference'}
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={isSubmitting}
            className="px-6 py-3 bg-surface border border-border rounded-md hover:bg-surface2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[48px] font-medium"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="px-6 py-3 bg-surface border border-border rounded-md hover:bg-surface2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[48px] font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
