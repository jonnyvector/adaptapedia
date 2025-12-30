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
  initialCategory?: DiffCategory | null;
}

interface FormData {
  category: DiffCategory | '';
  claim: string;
  detail: string;
  spoiler_scope: SpoilerScope;
  image: File | null;
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

export default function AddDiffForm({ work, screenWork, initialCategory }: AddDiffFormProps): JSX.Element {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    category: initialCategory || '',
    claim: '',
    detail: '',
    spoiler_scope: 'NONE',
    image: null,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
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
        // If we have an initial category from URL, preserve it (don't override with draft)
        if (initialCategory) {
          setFormData({ ...draft, category: initialCategory });
        } else {
          setFormData(draft);
        }
        setIsDirty(true);
      } catch (error) {
        console.error('Failed to load draft:', error);
      }
    }
  }, [work.id, screenWork.id, initialCategory]);

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

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (!file) {
      setFormData((prev) => ({ ...prev, image: null }));
      setImagePreview(null);
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB.');
      e.target.value = '';
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Only JPEG, PNG, and WebP images are allowed.');
      e.target.value = '';
      return;
    }

    setFormData((prev) => ({ ...prev, image: file }));
    setIsDirty(true);
    setError(null);

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
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
      // Use FormData for multipart upload
      const submitData = new FormData();
      submitData.append('work', work.id.toString());
      submitData.append('screen_work', screenWork.id.toString());
      submitData.append('category', formData.category as string);
      submitData.append('claim', formData.claim);
      submitData.append('detail', formData.detail);
      submitData.append('spoiler_scope', formData.spoiler_scope);

      if (formData.image) {
        submitData.append('image', formData.image);
      }

      await api.diffs.createWithImage(submitData);

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
        image: null,
      });
      setImagePreview(null);
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

        {/* Image Upload */}
        <div>
          <label htmlFor="image" className="block text-sm font-medium mb-2">
            Image (Optional)
          </label>
          <input
            type="file"
            id="image"
            name="image"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileChange}
            className="w-full px-3 py-3 text-base bg-surface text-foreground border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-link file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-link/10 file:text-link hover:file:bg-link/20 min-h-[44px]"
          />
          <p className="mt-1 text-xs sm:text-sm text-muted">
            Optional: Add an image to illustrate the difference (max 5MB, JPEG/PNG/WebP).
          </p>
          {imagePreview && (
            <div className="mt-3 relative inline-block">
              <img
                src={imagePreview}
                alt="Preview"
                className="max-w-full max-h-64 rounded-md border border-border"
              />
              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({ ...prev, image: null }));
                  setImagePreview(null);
                  const fileInput = document.getElementById('image') as HTMLInputElement;
                  if (fileInput) fileInput.value = '';
                }}
                className="absolute top-2 right-2 bg-danger text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-danger/90 transition-colors"
                aria-label="Remove image"
              >
                ×
              </button>
            </div>
          )}
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
