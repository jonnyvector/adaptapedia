'use client';

import { useState, useRef, useEffect } from 'react';
import type { SpoilerScope } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { FONTS, LETTER_SPACING, BORDERS, TEXT, RADIUS, monoUppercase } from '@/lib/brutalist-design';

interface AddCommentFormProps {
  diffItemId: number;
  parentId?: number;
  onCommentAdded?: () => void;
  onCancel?: () => void;
}

const CHAR_LIMIT = 500;
const MIN_CHARS = 10;

const spoilerScopes: { value: SpoilerScope; label: string; description: string }[] = [
  {
    value: 'NONE',
    label: 'Safe',
    description: 'No spoilers',
  },
  {
    value: 'BOOK_ONLY',
    label: 'Book Spoilers',
    description: 'Contains book spoilers',
  },
  {
    value: 'SCREEN_ONLY',
    label: 'Screen Spoilers',
    description: 'Contains movie/TV spoilers',
  },
  {
    value: 'FULL',
    label: 'Full Spoilers',
    description: 'Contains all spoilers',
  },
];

export default function AddCommentForm({
  diffItemId,
  parentId,
  onCommentAdded,
  onCancel,
}: AddCommentFormProps): JSX.Element {
  const [body, setBody] = useState('');
  const [spoilerScope, setSpoilerScope] = useState<SpoilerScope>('NONE');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [body]);

  const charCount = body.length;
  const isOverLimit = charCount > CHAR_LIMIT;
  const isTooShort = charCount > 0 && charCount < MIN_CHARS;
  const isValid = charCount >= MIN_CHARS && charCount <= CHAR_LIMIT;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Import api dynamically to avoid circular dependencies
      const { api } = await import('@/lib/api');

      await api.comments.create(diffItemId, body, spoilerScope, parentId);

      // Show success state
      setSuccess(true);

      // Clear form
      setBody('');
      setSpoilerScope('NONE');

      // Call callback
      if (onCommentAdded) {
        onCommentAdded();
      }

      // Reset success state after 2 seconds
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || 'Failed to post comment. Please try again.');
      } else {
        setError('Failed to post comment. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Textarea */}
      <div>
        <label htmlFor="comment-body" className={`block ${TEXT.secondary} font-bold mb-2 ${monoUppercase}`} style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide }}>
          {parentId ? 'Add a reply' : 'Add your comment'}
        </label>
        <textarea
          ref={textareaRef}
          id="comment-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={parentId ? 'Write your reply...' : 'Share your thoughts on this difference...'}
          className={`w-full px-3 py-2 border ${RADIUS.control} resize-none bg-white dark:bg-black text-black dark:text-white focus:outline-none transition-colors ${
            isOverLimit
              ? `border-red-600 dark:border-red-400 focus:border-red-600 dark:focus:border-red-400`
              : `${BORDERS.medium} focus:border-black dark:focus:border-white`
          }`}
          style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.normal }}
          rows={parentId ? 2 : 3}
          disabled={isSubmitting}
          aria-describedby="char-count comment-error"
          aria-invalid={isOverLimit || isTooShort}
        />

        {/* Character counter */}
        <div className="flex items-center justify-between mt-1">
          <div>
            {isTooShort && (
              <p className={`${TEXT.metadata} text-red-600 dark:text-red-400`} style={{ fontFamily: FONTS.mono }}>
                Minimum {MIN_CHARS} characters required
              </p>
            )}
            {error && (
              <p id="comment-error" className={`${TEXT.metadata} text-red-600 dark:text-red-400`} style={{ fontFamily: FONTS.mono }}>
                {error}
              </p>
            )}
            {success && (
              <p className={`${TEXT.metadata} text-black dark:text-white`} style={{ fontFamily: FONTS.mono }}>
                Comment posted successfully!
              </p>
            )}
          </div>
          <span
            id="char-count"
            className={`${TEXT.metadata} ${
              isOverLimit
                ? 'text-red-600 dark:text-red-400 font-bold'
                : charCount > CHAR_LIMIT * 0.9
                ? 'text-amber-600 dark:text-amber-400'
                : TEXT.mutedMedium
            }`}
            style={{ fontFamily: FONTS.mono }}
          >
            {charCount}/{CHAR_LIMIT}
          </span>
        </div>
      </div>

      {/* Spoiler scope selector */}
      <div>
        <label className={`block ${TEXT.secondary} font-bold mb-2 ${monoUppercase}`} style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide }}>
          Spoiler Level
        </label>
        <div className="flex flex-wrap gap-2">
          {spoilerScopes.map((scope) => (
            <Button
              key={scope.value}
              type="button"
              variant={spoilerScope === scope.value ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setSpoilerScope(scope.value)}
              disabled={isSubmitting}
              title={scope.description}
              aria-label={`${scope.label} - ${scope.description}`}
            >
              {scope.label}
            </Button>
          ))}
        </div>
        <p className={`${TEXT.metadata} ${TEXT.mutedMedium} mt-1`} style={{ fontFamily: FONTS.mono }}>
          {spoilerScopes.find((s) => s.value === spoilerScope)?.description}
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={!isValid || isSubmitting}
          loading={isSubmitting}
          aria-label="Post comment"
        >
          {isSubmitting ? 'Posting...' : 'Post Comment'}
        </Button>

        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
