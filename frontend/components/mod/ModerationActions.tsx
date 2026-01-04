'use client';

import { useState } from 'react';
import { FONTS, LETTER_SPACING, BORDERS, TEXT, monoUppercase } from '@/lib/brutalist-design';

interface ModerationActionsProps {
  type: 'diff' | 'comment';
  onApprove: () => Promise<void>;
  onReject?: (reason: string) => Promise<void>;
  onFlag?: () => Promise<void>;
  onHide?: () => Promise<void>;
  onDelete?: () => Promise<void>;
  disabled?: boolean;
}

export default function ModerationActions({
  type,
  onApprove,
  onReject,
  onFlag,
  onHide,
  onDelete,
  disabled = false,
}: ModerationActionsProps): JSX.Element {
  const [isLoading, setIsLoading] = useState(false);
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [actionMessage, setActionMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const handleAction = async (
    action: () => Promise<void>,
    successMessage: string
  ): Promise<void> => {
    setIsLoading(true);
    setActionMessage(null);
    try {
      await action();
      setActionMessage({ type: 'success', text: successMessage });
    } catch (error) {
      setActionMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Action failed',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async (): Promise<void> => {
    if (!onReject) return;
    await handleAction(
      () => onReject(rejectReason),
      `${type === 'diff' ? 'Diff' : 'Comment'} rejected`
    );
    setShowRejectInput(false);
    setRejectReason('');
  };

  const handleDelete = async (): Promise<void> => {
    if (!onDelete) return;
    await handleAction(() => onDelete(), 'Comment deleted');
    setShowDeleteConfirm(false);
  };

  return (
    <div className="space-y-3">
      {/* Action Messages */}
      {actionMessage && (
        <div
          className={`p-3 rounded-md border ${TEXT.secondary} ${
            actionMessage.type === 'success'
              ? `bg-green-100 dark:bg-green-950/30 text-green-800 dark:text-green-400 ${BORDERS.medium} border-green-600 dark:border-green-400`
              : `bg-red-100 dark:bg-red-950/30 text-red-800 dark:text-red-400 ${BORDERS.medium} border-red-600 dark:border-red-400`
          }`}
          style={{ fontFamily: FONTS.mono }}
        >
          {actionMessage.text}
        </div>
      )}

      {/* Main Action Buttons */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => handleAction(onApprove, 'Approved successfully')}
          disabled={disabled || isLoading}
          className={`px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded-md border ${BORDERS.solid} hover:opacity-90 disabled:bg-black/20 disabled:dark:bg-white/20 disabled:cursor-not-allowed transition-opacity ${TEXT.secondary} font-bold ${monoUppercase}`}
          style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.tight }}
        >
          {isLoading ? 'Processing...' : 'Approve'}
        </button>

        {type === 'diff' && onReject && (
          <button
            onClick={() => setShowRejectInput(!showRejectInput)}
            disabled={disabled || isLoading}
            className={`px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-md border ${BORDERS.solid} hover:opacity-90 disabled:bg-black/20 disabled:dark:bg-white/20 disabled:cursor-not-allowed transition-opacity ${TEXT.secondary} font-bold ${monoUppercase}`}
            style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.tight }}
          >
            Reject
          </button>
        )}

        {type === 'diff' && onFlag && (
          <button
            onClick={() =>
              handleAction(onFlag, 'Flagged for further review')
            }
            disabled={disabled || isLoading}
            className={`px-4 py-2 bg-amber-600 dark:bg-amber-700 text-white rounded-md border ${BORDERS.solid} hover:opacity-90 disabled:bg-black/20 disabled:dark:bg-white/20 disabled:cursor-not-allowed transition-opacity ${TEXT.secondary} font-bold ${monoUppercase}`}
            style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.tight }}
          >
            Flag
          </button>
        )}

        {type === 'comment' && onHide && (
          <button
            onClick={() => handleAction(onHide, 'Comment hidden')}
            disabled={disabled || isLoading}
            className={`px-4 py-2 bg-orange-600 dark:bg-orange-700 text-white rounded-md border ${BORDERS.solid} hover:opacity-90 disabled:bg-black/20 disabled:dark:bg-white/20 disabled:cursor-not-allowed transition-opacity ${TEXT.secondary} font-bold ${monoUppercase}`}
            style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.tight }}
          >
            Hide
          </button>
        )}

        {type === 'comment' && onDelete && (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={disabled || isLoading}
            className={`px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-md border ${BORDERS.solid} hover:opacity-90 disabled:bg-black/20 disabled:dark:bg-white/20 disabled:cursor-not-allowed transition-opacity ${TEXT.secondary} font-bold ${monoUppercase}`}
            style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.tight }}
          >
            Delete
          </button>
        )}
      </div>

      {/* Reject Input */}
      {showRejectInput && onReject && (
        <div className={`border ${BORDERS.medium} rounded-md p-4 bg-stone-50 dark:bg-stone-950`}>
          <label className={`block ${TEXT.secondary} font-bold mb-2 ${monoUppercase} text-black dark:text-white`} style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide }}>
            Rejection Reason (optional)
          </label>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Explain why this content is being rejected..."
            className={`w-full p-2 border ${BORDERS.medium} rounded-md mb-3 min-h-[80px] bg-white dark:bg-black text-black dark:text-white ${TEXT.secondary} focus:outline-none focus:border-black focus:dark:border-white`}
            style={{ fontFamily: FONTS.mono }}
            disabled={isLoading}
          />
          <div className="flex gap-2">
            <button
              onClick={handleReject}
              disabled={isLoading}
              className={`px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-md border ${BORDERS.solid} hover:opacity-90 disabled:bg-black/20 disabled:dark:bg-white/20 transition-opacity ${TEXT.secondary} font-bold ${monoUppercase}`}
              style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.tight }}
            >
              Confirm Reject
            </button>
            <button
              onClick={() => {
                setShowRejectInput(false);
                setRejectReason('');
              }}
              disabled={isLoading}
              className={`px-4 py-2 bg-stone-300 dark:bg-stone-700 text-black dark:text-white rounded-md border ${BORDERS.solid} hover:opacity-90 transition-opacity ${TEXT.secondary} font-bold ${monoUppercase}`}
              style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.tight }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && onDelete && (
        <div className={`border ${BORDERS.medium} border-red-600 dark:border-red-400 rounded-md p-4 bg-red-50 dark:bg-red-950/20`}>
          <p className={`${TEXT.secondary} font-bold mb-3 text-red-800 dark:text-red-400`} style={{ fontFamily: FONTS.mono }}>
            Are you sure you want to permanently delete this comment? This
            action cannot be undone.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              disabled={isLoading}
              className={`px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-md border ${BORDERS.solid} hover:opacity-90 disabled:bg-black/20 disabled:dark:bg-white/20 transition-opacity ${TEXT.secondary} font-bold ${monoUppercase}`}
              style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.tight }}
            >
              Confirm Delete
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isLoading}
              className={`px-4 py-2 bg-stone-300 dark:bg-stone-700 text-black dark:text-white rounded-md border ${BORDERS.solid} hover:opacity-90 transition-opacity ${TEXT.secondary} font-bold ${monoUppercase}`}
              style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.tight }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
