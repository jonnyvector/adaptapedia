'use client';

import { useState, useRef, useEffect } from 'react';
import type { SpoilerScope } from '@/lib/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface AddCommentFormProps {
  diffItemId: number;
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

      await api.comments.create(diffItemId, body, spoilerScope);

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
        <label htmlFor="comment-body" className="block text-sm font-medium mb-2">
          Add your comment
        </label>
        <textarea
          ref={textareaRef}
          id="comment-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Share your thoughts on this difference..."
          className={`w-full px-3 py-2 border rounded-lg resize-none bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-link/50 transition-colors ${
            isOverLimit
              ? 'border-danger focus:border-danger focus:ring-danger/50'
              : 'border-border'
          }`}
          rows={3}
          disabled={isSubmitting}
          aria-describedby="char-count comment-error"
          aria-invalid={isOverLimit || isTooShort}
        />

        {/* Character counter */}
        <div className="flex items-center justify-between mt-1">
          <div>
            {isTooShort && (
              <p className="text-xs text-danger">
                Minimum {MIN_CHARS} characters required
              </p>
            )}
            {error && (
              <p id="comment-error" className="text-xs text-danger">
                {error}
              </p>
            )}
            {success && (
              <p className="text-xs text-success">
                Comment posted successfully!
              </p>
            )}
          </div>
          <span
            id="char-count"
            className={`text-xs ${
              isOverLimit
                ? 'text-danger font-semibold'
                : charCount > CHAR_LIMIT * 0.9
                ? 'text-warn'
                : 'text-muted'
            }`}
          >
            {charCount}/{CHAR_LIMIT}
          </span>
        </div>
      </div>

      {/* Spoiler scope selector */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Spoiler Level
        </label>
        <div className="flex flex-wrap gap-2">
          {spoilerScopes.map((scope) => (
            <button
              key={scope.value}
              type="button"
              onClick={() => setSpoilerScope(scope.value)}
              disabled={isSubmitting}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                spoilerScope === scope.value
                  ? 'bg-link text-white'
                  : 'bg-surface border border-border text-foreground hover:bg-surface2 disabled:opacity-50'
              }`}
              title={scope.description}
              aria-label={`${scope.label} - ${scope.description}`}
            >
              {scope.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted mt-1">
          {spoilerScopes.find((s) => s.value === spoilerScope)?.description}
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="flex items-center gap-2 px-4 py-2 bg-link text-white rounded-lg text-sm font-medium hover:bg-link/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Post comment"
        >
          {isSubmitting && <LoadingSpinner size="sm" />}
          {isSubmitting ? 'Posting...' : 'Post Comment'}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 bg-surface border border-border text-foreground rounded-lg text-sm font-medium hover:bg-surface2 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
