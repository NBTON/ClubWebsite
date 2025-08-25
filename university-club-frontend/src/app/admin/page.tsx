'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { eventsApi, registrationsApi } from '@/lib/firestore';
import { Event, Registration } from '@/types';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Plus, Edit, Trash2, Users, Calendar, Eye } from 'lucide-react';

export default function AdminDashboard() {
  const { user, userProfile, isOrganizer, loading: authLoading } = useAuth();
  const router = useRouter();

  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'events' | 'registrations'>('events');

  // Redirect if not authorized
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else if (!isOrganizer) {
        router.push('/');
      }
    }
  }, [user, isOrganizer, authLoading, router]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all events (including cancelled/completed for admin view)
      const { events: allEvents } = await eventsApi.getEvents(undefined, 100);
      setEvents(allEvents);
    } catch (error) {
      console.error('Error loading events:', error);
      setError('Failed to load events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadEventRegistrations = async (eventId: string) => {
    try {
      const eventRegistrations = await registrationsApi.getEventRegistrations(eventId);
      setRegistrations(eventRegistrations);
    } catch (error) {
      console.error('Error loading registrations:', error);
      setError('Failed to load registrations. Please try again.');
    }
  };

  useEffect(() => {
    if (user && isOrganizer) {
      loadEvents();
    }
  }, [user, isOrganizer]);

  const handleViewRegistrations = async (event: Event) => {
    setSelectedEvent(event);
    await loadEventRegistrations(event.id);
    setView('registrations');
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    try {
      await eventsApi.deleteEvent(eventId);
      await loadEvents(); // Reload events list
    } catch (error) {
      console.error('Error deleting event:', error);
      setError('Failed to delete event. Please try again.');
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (!user || !isOrganizer) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-600">
              Manage events and view registrations
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Navigation Tabs */}
          <div className="mb-6">
            <nav className="flex space-x-4">
              <button
                onClick={() => setView('events')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  view === 'events'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Events ({events.length})
              </button>
              {selectedEvent && (
                <button
                  onClick={() => setView('registrations')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    view === 'registrations'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Registrations for "{selectedEvent.title}" ({registrations.length})
                </button>
              )}
            </nav>
          </div>

          {view === 'events' ? (
            <>
              <div className="mb-6">
                <Button onClick={() => router.push('/admin/create-event')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Event
                </Button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Loading events...</span>
                  </div>
                </div>
              ) : events.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No events found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by creating your first event.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events.map((event) => (
                    <Card key={event.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg mb-2">{event.title}</CardTitle>
                            <CardDescription className="line-clamp-2">
                              {event.description}
                            </CardDescription>
                          </div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                            {event.status}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="h-4 w-4 mr-2" />
                            {formatDate(event.date)}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Users className="h-4 w-4 mr-2" />
                            {event.currentAttendees} / {event.maxAttendees} attendees
                          </div>
                          <div className="flex space-x-2 pt-2">
                            <Button
                              onClick={() => handleViewRegistrations(event)}
                              variant="outline"
                              size="sm"
                              className="flex-1"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Registrations
                            </Button>
                            <Button
                              onClick={() => router.push(`/admin/edit-event/${event.id}`)}
                              variant="outline"
                              size="sm"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() => handleDeleteEvent(event.id)}
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              {selectedEvent && (
                <div className="mb-6">
                  <Button onClick={() => setView('events')} variant="outline" className="mb-4">
                    ← Back to Events
                  </Button>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Registrations for "{selectedEvent.title}"
                  </h2>
                  <p className="text-gray-600">
                    {registrations.length} registration{registrations.length !== 1 ? 's' : ''}
                  </p>
                </div>
              )}

              {registrations.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No registrations found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    No one has registered for this event yet.
                  </p>
                </div>
              ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  <ul className="divide-y divide-gray-200">
                    {registrations.map((registration) => (
                      <li key={registration.id} className="px-6 py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="text-lg font-medium text-gray-900">
                                  {registration.userName}
                                </h3>
                                <p className="text-sm text-gray-600">{registration.userEmail}</p>
                                {registration.reason && (
                                  <p className="text-sm text-gray-500 mt-1">
                                    Reason: {registration.reason}
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-gray-600">
                                  Registered: {formatDate(registration.registrationTime)}
                                </p>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(registration.status)}`}>
                                  {registration.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}