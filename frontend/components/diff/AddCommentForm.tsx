'use client';

import { useState } from 'react';
import type { SpoilerScope } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { FONTS, LETTER_SPACING, BORDERS, TEXT, monoUppercase } from '@/lib/brutalist-design';

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

  const getHelperText = () => {
    if (success) return 'Comment posted successfully!';
    if (error) return error;
    if (isTooShort) return `Minimum ${MIN_CHARS} characters required`;
    return undefined;
  };

  const getErrorMessage = () => {
    if (isOverLimit || isTooShort || error) {
      return getHelperText() || undefined;
    }
    return undefined;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Textarea */}
      <Textarea
        id="comment-body"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={parentId ? 'Write your reply...' : 'Share your thoughts on this difference...'}
        rows={parentId ? 2 : 3}
        maxLength={CHAR_LIMIT}
        disabled={isSubmitting}
        label={parentId ? 'Add a reply' : 'Add your comment'}
        error={getErrorMessage()}
        showCharCount={true}
        textareaSize="md"
      />

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
