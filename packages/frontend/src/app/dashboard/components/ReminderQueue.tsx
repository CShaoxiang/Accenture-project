'use client';

import { useState } from 'react';
import {
  useOverdueEntities,
  useGenerateReminder,
  useMarkAsContacted,
  useApproveReminder,
  type OverdueEntity,
  type ReminderDraft,
} from '@/hooks/useReminders';

export default function ReminderQueue() {
  const [selectedEntity, setSelectedEntity] = useState<OverdueEntity | null>(null);
  const [reminderDraft, setReminderDraft] = useState<ReminderDraft | null>(null);

  const { data: overdueEntities, isLoading } = useOverdueEntities(7);
  const generateReminder = useGenerateReminder();
  const markAsContacted = useMarkAsContacted();
  const approveReminder = useApproveReminder();

  const handleGenerateReminder = async (entity: OverdueEntity) => {
    try {
      const draft = await generateReminder.mutateAsync({
        entityId: entity.entityId,
        entityType: entity.entityType,
      });
      setReminderDraft(draft);
      setSelectedEntity(entity);
    } catch (error) {
      console.error('Failed to generate reminder:', error);
    }
  };

  const handleMarkAsContacted = async (entity: OverdueEntity) => {
    if (confirm(`Mark ${entity.name} as contacted?`)) {
      try {
        await markAsContacted.mutateAsync({
          entityId: entity.entityId,
          entityType: entity.entityType,
        });
      } catch (error) {
        console.error('Failed to mark as contacted:', error);
      }
    }
  };

  const handleApproveReminder = async () => {
    if (reminderDraft && confirm('Send this reminder?')) {
      try {
        await approveReminder.mutateAsync(reminderDraft.id);
        setReminderDraft(null);
        setSelectedEntity(null);
      } catch (error) {
        console.error('Failed to approve reminder:', error);
      }
    }
  };

  const formatLastContact = (date: string | null) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString();
  };

  const getEntityTypeLabel = (type: string) => {
    switch (type) {
      case 'venue':
        return 'Venue';
      case 'student_body':
        return 'Student Body';
      case 'stakeholder':
        return 'Stakeholder';
      default:
        return type;
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-lg bg-white p-6 shadow">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Reminder Queue</h3>
        <p className="text-gray-600">Loading overdue entities...</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Reminder Queue</h3>
        {overdueEntities && overdueEntities.length > 0 && (
          <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-800">
            {overdueEntities.length} overdue
          </span>
        )}
      </div>

      {!overdueEntities || overdueEntities.length === 0 ? (
        <div className="rounded-lg bg-gray-50 p-4 text-center">
          <p className="text-gray-600">No overdue entities. Great job staying on top of follow-ups!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {overdueEntities.map((entity) => (
            <div
              key={`${entity.entityType}-${entity.entityId}`}
              className="rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900">{entity.name}</h4>
                    <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                      {getEntityTypeLabel(entity.entityType)}
                    </span>
                  </div>
                  <div className="mt-2 space-y-1 text-sm text-gray-600">
                    <p>
                      <span className="font-medium">Last Contact:</span>{' '}
                      {formatLastContact(entity.lastContactDate)}
                    </p>
                    <p>
                      <span className="font-medium">Days Overdue:</span>{' '}
                      <span
                        className={
                          entity.daysOverdue > 14
                            ? 'font-semibold text-red-600'
                            : 'font-semibold text-orange-600'
                        }
                      >
                        {entity.daysOverdue}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="ml-4 flex flex-col gap-2">
                  <button
                    onClick={() => handleGenerateReminder(entity)}
                    disabled={generateReminder.isPending}
                    className="rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    Generate Reminder
                  </button>
                  <button
                    onClick={() => handleMarkAsContacted(entity)}
                    disabled={markAsContacted.isPending}
                    className="rounded bg-green-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:bg-gray-400"
                  >
                    Mark Contacted
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reminder Draft Modal */}
      {reminderDraft && selectedEntity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-xl font-semibold text-gray-900">Reminder Draft</h3>

            <div className="mb-4 rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-600">
                <span className="font-medium">To:</span> {selectedEntity.name}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Type:</span>{' '}
                {getEntityTypeLabel(selectedEntity.entityType)}
              </p>
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">Subject</label>
              <input
                type="text"
                value={reminderDraft.subject}
                readOnly
                className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-gray-900"
              />
            </div>

            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-gray-700">Message</label>
              <textarea
                value={reminderDraft.body}
                readOnly
                rows={10}
                className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-gray-900"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setReminderDraft(null);
                  setSelectedEntity(null);
                }}
                className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleApproveReminder}
                disabled={approveReminder.isPending}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-gray-400"
              >
                {approveReminder.isPending ? 'Sending...' : 'Approve & Send'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
