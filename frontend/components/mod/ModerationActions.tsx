'use client';

import { useState } from 'react';

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
          className={`p-3 rounded-lg text-sm ${
            actionMessage.type === 'success'
              ? 'bg-green-100 text-green-800 border border-green-200'
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}
        >
          {actionMessage.text}
        </div>
      )}

      {/* Main Action Buttons */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => handleAction(onApprove, 'Approved successfully')}
          disabled={disabled || isLoading}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Processing...' : 'Approve'}
        </button>

        {type === 'diff' && onReject && (
          <button
            onClick={() => setShowRejectInput(!showRejectInput)}
            disabled={disabled || isLoading}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
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
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Flag
          </button>
        )}

        {type === 'comment' && onHide && (
          <button
            onClick={() => handleAction(onHide, 'Comment hidden')}
            disabled={disabled || isLoading}
            className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Hide
          </button>
        )}

        {type === 'comment' && onDelete && (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={disabled || isLoading}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Delete
          </button>
        )}
      </div>

      {/* Reject Input */}
      {showRejectInput && onReject && (
        <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
          <label className="block text-sm font-medium mb-2">
            Rejection Reason (optional)
          </label>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Explain why this content is being rejected..."
            className="w-full p-2 border border-gray-300 rounded mb-3 min-h-[80px] bg-surface text-foreground"
            disabled={isLoading}
          />
          <div className="flex gap-2">
            <button
              onClick={handleReject}
              disabled={isLoading}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-300 transition-colors"
            >
              Confirm Reject
            </button>
            <button
              onClick={() => {
                setShowRejectInput(false);
                setRejectReason('');
              }}
              disabled={isLoading}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && onDelete && (
        <div className="border border-red-300 rounded-lg p-4 bg-red-50">
          <p className="text-sm font-medium mb-3">
            Are you sure you want to permanently delete this comment? This
            action cannot be undone.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              disabled={isLoading}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-300 transition-colors"
            >
              Confirm Delete
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isLoading}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
