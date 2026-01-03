'use client';

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import type { Work, ScreenWork, DiffCategory, SpoilerScope } from '@/lib/types';
import { api, ApiError } from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { CheckCircleIcon } from '@/components/ui/Icons';
import { MAX_IMAGE_SIZE_BYTES, MAX_IMAGE_SIZE_MB, MIN_CLAIM_LENGTH, MAX_CLAIM_LENGTH, MAX_DETAIL_LENGTH } from '@/lib/constants';
import { FONTS, LETTER_SPACING, BORDERS, TEXT, monoUppercase } from '@/lib/brutalist-design';

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

    // Validate file size
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setError(`Image size must be less than ${MAX_IMAGE_SIZE_MB}MB.`);
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
    if (formData.claim.length < MIN_CLAIM_LENGTH) {
      return `Claim must be at least ${MIN_CLAIM_LENGTH} characters long.`;
    }
    if (formData.claim.length > MAX_CLAIM_LENGTH) {
      return `Claim must not exceed ${MAX_CLAIM_LENGTH} characters.`;
    }
    if (formData.detail.length > MAX_DETAIL_LENGTH) {
      return `Detail must not exceed ${MAX_DETAIL_LENGTH} characters.`;
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
        <div className={`bg-black dark:bg-white border ${BORDERS.solid} rounded-md p-6 text-center`}>
          <div className="flex justify-center mb-4">
            <CheckCircleIcon className="w-16 h-16 text-white dark:text-black" />
          </div>
          <h2 className={`${TEXT.body} font-bold text-white dark:text-black mb-2 ${monoUppercase}`} style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide }}>
            Difference submitted successfully!
          </h2>
          <p className={`${TEXT.secondary} text-white dark:text-black`} style={{ fontFamily: FONTS.mono }}>
            Redirecting you back to the comparison page...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      <div className="mb-4 sm:mb-6">
        <h1 className={`text-xl sm:text-2xl font-bold mb-2 text-black dark:text-white ${monoUppercase}`} style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wider }}>Add New Difference</h1>
        <p className={`${TEXT.secondary} ${TEXT.mutedMedium}`} style={{ fontFamily: FONTS.sans }}>
          Comparing <span className="font-semibold text-black dark:text-white">{work.title}</span> (book) and{' '}
          <span className="font-semibold text-black dark:text-white">{screenWork.title}</span> (
          {screenWork.type === 'MOVIE' ? 'movie' : 'TV series'})
        </p>
      </div>

      {error && (
        <div className={`mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 dark:bg-red-950/20 border ${BORDERS.solid} border-red-600 dark:border-red-400 rounded-md ${TEXT.secondary} text-red-600 dark:text-red-400`} style={{ fontFamily: FONTS.mono }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
        {/* Category */}
        <div>
          <label htmlFor="category" className={`block ${TEXT.secondary} font-bold mb-2 ${monoUppercase}`} style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide }}>
            Category <span className="text-red-500">*</span>
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className={`w-full px-3 py-3 ${TEXT.secondary} bg-white dark:bg-black text-black dark:text-white border ${BORDERS.medium} rounded-md focus:outline-none focus:border-black dark:focus:border-white min-h-[44px]`}
            style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.normal }}
          >
            <option value="">Select a category...</option>
            {DIFF_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
          <p className={`mt-1 ${TEXT.metadata} ${TEXT.mutedMedium}`} style={{ fontFamily: FONTS.sans }}>
            Choose the category that best describes this difference.
          </p>
        </div>

        {/* Claim */}
        <div>
          <label htmlFor="claim" className={`block ${TEXT.secondary} font-bold mb-2 ${monoUppercase}`} style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide }}>
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
            className={`w-full px-3 py-3 ${TEXT.secondary} bg-white dark:bg-black text-black dark:text-white border ${BORDERS.medium} rounded-md focus:outline-none focus:border-black dark:focus:border-white min-h-[44px]`}
            style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.normal }}
          />
          <div className="flex flex-col sm:flex-row sm:justify-between mt-1 gap-1">
            <p className={`${TEXT.metadata} ${TEXT.mutedMedium}`} style={{ fontFamily: FONTS.sans }}>
              A brief statement describing the difference (10-200 characters).
            </p>
            <span
              className={`${TEXT.metadata} ${
                claimCharCount < 10
                  ? 'text-red-600 dark:text-red-400'
                  : claimCharCount > 200
                  ? 'text-red-600 dark:text-red-400'
                  : TEXT.mutedMedium
              }`}
              style={{ fontFamily: FONTS.mono }}
            >
              {claimCharCount}/200
            </span>
          </div>
        </div>

        {/* Detail */}
        <div>
          <label htmlFor="detail" className={`block ${TEXT.secondary} font-bold mb-2 ${monoUppercase}`} style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide }}>
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
            className={`w-full px-3 py-3 ${TEXT.secondary} bg-white dark:bg-black text-black dark:text-white border ${BORDERS.medium} rounded-md focus:outline-none focus:border-black dark:focus:border-white resize-y min-h-[120px]`}
            style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.normal }}
          />
          <div className="flex flex-col sm:flex-row sm:justify-between mt-1 gap-1">
            <p className={`${TEXT.metadata} ${TEXT.mutedMedium}`} style={{ fontFamily: FONTS.sans }}>
              Optional: Provide more context or explanation (max 1000 characters).
            </p>
            <span className={`${TEXT.metadata} ${detailCharCount > 1000 ? 'text-red-600 dark:text-red-400' : TEXT.mutedMedium}`} style={{ fontFamily: FONTS.mono }}>
              {detailCharCount}/1000
            </span>
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label htmlFor="image" className={`block ${TEXT.secondary} font-bold mb-2 ${monoUppercase}`} style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide }}>
            Image (Optional)
          </label>
          <input
            type="file"
            id="image"
            name="image"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileChange}
            className={`w-full px-3 py-3 ${TEXT.secondary} bg-white dark:bg-black text-black dark:text-white border ${BORDERS.medium} rounded-md focus:outline-none focus:border-black dark:focus:border-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 ${TEXT.metadata} file:font-bold file:bg-black/10 dark:file:bg-white/10 file:text-black dark:file:text-white hover:file:bg-black/20 hover:dark:file:bg-white/20 min-h-[44px]`}
            style={{ fontFamily: FONTS.mono }}
          />
          <p className={`mt-1 ${TEXT.metadata} ${TEXT.mutedMedium}`} style={{ fontFamily: FONTS.sans }}>
            Optional: Add an image to illustrate the difference (max 5MB, JPEG/PNG/WebP).
          </p>
          {imagePreview && (
            <div className="mt-3 relative inline-block">
              <img
                src={imagePreview}
                alt="Preview"
                className={`max-w-full max-h-64 rounded-md border ${BORDERS.medium}`}
              />
              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({ ...prev, image: null }));
                  setImagePreview(null);
                  const fileInput = document.getElementById('image') as HTMLInputElement;
                  if (fileInput) fileInput.value = '';
                }}
                className={`absolute top-2 right-2 bg-red-600 dark:bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-700 dark:hover:bg-red-600 transition-colors`}
                aria-label="Remove image"
              >
                ×
              </button>
            </div>
          )}
        </div>

        {/* Spoiler Scope */}
        <div>
          <label className={`block ${TEXT.secondary} font-bold mb-2 ${monoUppercase}`} style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide }}>
            Spoiler Scope <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            {SPOILER_SCOPES.map((scope) => (
              <label
                key={scope.value}
                className={`flex items-start gap-3 p-3 bg-stone-50 dark:bg-stone-950 border ${BORDERS.medium} rounded-md cursor-pointer hover:border-black hover:dark:border-white transition-colors min-h-[48px]`}
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
                  <div className={`font-bold ${TEXT.secondary}`} style={{ fontFamily: FONTS.mono }}>{scope.label}</div>
                  <div className={`${TEXT.metadata} ${TEXT.mutedMedium}`} style={{ fontFamily: FONTS.sans }}>{scope.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Preview */}
        {formData.claim && (
          <div className={`border ${BORDERS.medium} rounded-md p-4 bg-stone-50 dark:bg-stone-950`}>
            <h3 className={`${TEXT.secondary} font-bold mb-2 ${monoUppercase}`} style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide }}>Preview</h3>
            <div className="space-y-2">
              <div>
                <span className={`${TEXT.metadata} ${TEXT.mutedMedium} font-bold ${monoUppercase}`} style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide }}>{formData.category || 'Category'}</span>
              </div>
              <p className="font-bold" style={{ fontFamily: FONTS.mono }}>{formData.claim}</p>
              {formData.detail && <p className={`${TEXT.secondary} ${TEXT.mutedMedium}`} style={{ fontFamily: FONTS.sans }}>{formData.detail}</p>}
              <div className={`${TEXT.metadata} ${TEXT.mutedMedium}`} style={{ fontFamily: FONTS.mono }}>
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
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-md border ${BORDERS.solid} hover:bg-black/90 hover:dark:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold min-h-[48px] ${monoUppercase}`}
            style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.tight }}
          >
            {isSubmitting && <LoadingSpinner size="sm" />}
            {isSubmitting ? 'Submitting...' : 'Submit Difference'}
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={isSubmitting}
            className={`px-6 py-3 bg-white dark:bg-black border ${BORDERS.medium} rounded-md hover:border-black hover:dark:border-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[48px] font-bold ${monoUppercase}`}
            style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.tight }}
          >
            Clear
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            className={`px-6 py-3 bg-white dark:bg-black border ${BORDERS.medium} rounded-md hover:border-black hover:dark:border-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[48px] font-bold ${monoUppercase}`}
            style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.tight }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
