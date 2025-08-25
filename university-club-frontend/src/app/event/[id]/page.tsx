'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { eventsApi, registrationsApi } from '@/lib/firestore';
import { Event, Registration } from '@/types';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Calendar, MapPin, Users, User, ArrowLeft, CheckCircle } from 'lucide-react';

export default function EventDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, userProfile } = useAuth();

  const [event, setEvent] = useState<Event | null>(null);
  const [userRegistration, setUserRegistration] = useState<Registration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [registering, setRegistering] = useState(false);
  const [registrationReason, setRegistrationReason] = useState('');

  const loadEvent = async () => {
    if (!id || typeof id !== 'string') return;

    try {
      setLoading(true);
      setError(null);

      const eventData = await eventsApi.getEvent(id);
      if (!eventData) {
        setError('Event not found');
        return;
      }

      setEvent(eventData);

      // Check if user is already registered
      if (user) {
        try {
          const userRegistrations = await registrationsApi.getUserRegistrations(user.uid);
          const existingRegistration = userRegistrations.find(reg => reg.eventId === id);
          setUserRegistration(existingRegistration || null);
        } catch (error) {
          console.error('Error checking registration status:', error);
        }
      }
    } catch (error) {
      console.error('Error loading event:', error);
      setError('Failed to load event details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvent();
  }, [id, user]);

  const handleRegister = async () => {
    if (!event || !user || !userProfile) return;

    try {
      setRegistering(true);
      setError(null);

      await registrationsApi.registerForEvent(
        event.id,
        user.uid,
        userProfile.displayName,
        userProfile.email,
        registrationReason.trim() || undefined
      );

      // Reload event to get updated attendee count
      await loadEvent();

      // Clear form
      setRegistrationReason('');
    } catch (error) {
      console.error('Error registering for event:', error);
      setError(error instanceof Error ? error.message : 'Failed to register for event. Please try again.');
    } finally {
      setRegistering(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading event details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <div className="mt-4">
              <Button onClick={() => router.back()} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!event) return null;

  const isEventFull = event.currentAttendees >= event.maxAttendees;
  const canRegister = user && !userRegistration && event.status === 'active' && !isEventFull;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <Button onClick={() => router.back()} variant="outline" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Events
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Event Info */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl mb-2">{event.title}</CardTitle>
                      <CardDescription className="text-base">
                        Organized by {event.organizerName}
                      </CardDescription>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                      {event.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
                  </div>

                  {event.tags.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {event.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Event Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Event Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{formatDate(event.date)}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Users className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{event.currentAttendees} / {event.maxAttendees} attendees</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <User className="h-4 w-4 mr-2 text-gray-500" />
                    <span>Created {formatDate(event.createdAt)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Registration */}
              <Card>
                <CardHeader>
                  <CardTitle>Registration</CardTitle>
                </CardHeader>
                <CardContent>
                  {error && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {!user ? (
                    <div className="text-center">
                      <p className="text-gray-600 mb-4">
                        Please sign in to register for this event.
                      </p>
                      <Button onClick={() => router.push('/login')}>
                        Sign In
                      </Button>
                    </div>
                  ) : userRegistration ? (
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                        <span className="text-green-600 font-medium">Already Registered</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        You registered on {formatDate(userRegistration.registrationTime)}
                      </p>
                      {userRegistration.reason && (
                        <p className="text-sm text-gray-600 mt-2">
                          Reason: {userRegistration.reason}
                        </p>
                      )}
                    </div>
                  ) : event.status !== 'active' ? (
                    <div className="text-center">
                      <p className="text-gray-600">
                        This event is {event.status} and not accepting registrations.
                      </p>
                    </div>
                  ) : isEventFull ? (
                    <div className="text-center">
                      <p className="text-red-600 font-medium mb-2">Event is Full</p>
                      <p className="text-sm text-gray-600">
                        This event has reached its maximum capacity.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="reason">Why are you interested? (Optional)</Label>
                        <Textarea
                          id="reason"
                          placeholder="Tell us why you're interested in attending..."
                          value={registrationReason}
                          onChange={(e) => setRegistrationReason(e.target.value)}
                          rows={3}
                        />
                      </div>
                      <Button
                        onClick={handleRegister}
                        disabled={registering}
                        className="w-full"
                      >
                        {registering ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Registering...
                          </>
                        ) : (
                          'Register for Event'
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}