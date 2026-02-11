'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useEvent, useUpdateEvent, useDeleteEvent } from '@/hooks/useEvents';
import Link from 'next/link';

export default function EventDetailPage() {
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

  const { data: event, isLoading: eventLoading } = useEvent(eventId);
  const updateEvent = useUpdateEvent(eventId);
  const deleteEven