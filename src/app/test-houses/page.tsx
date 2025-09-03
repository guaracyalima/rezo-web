'use client';

import React from 'react';
import Navigation from '../../components/common/Navigation';

export default function TestHousesPage() {
  return (
    <>
      <Navigation currentPath="/test-houses" />
      <div className="container py-4">
        <h1 className="h3 fw-bold text-dark mb-4">Houses Test Page</h1>          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h2 className="h5 fw-semibold mb-3">Main Routes:</h2>
              <div className="d-grid gap-2">
                <a href="/dashboard/houses" className="btn btn-outline-primary text-start">
                  /dashboard/houses - Dashboard Houses Management (Requires Login)
                </a>
                <a href="/houses" className="btn btn-outline-success text-start">
                  /houses - Public Houses Listing (Auto-location + Fallbacks)
                </a>
                <a href="/events" className="btn btn-outline-info text-start">
                  /events - Public Events Listing (Upcoming spiritual events)
                </a>
                <a href="/dashboard/events" className="btn btn-outline-warning text-start">
                  /dashboard/events - Events Management (Requires Login)
                </a>
              </div>
              <div className="mt-3">
                <small className="text-muted">
                  <strong>Public Houses Features:</strong><br />
                  • Auto-detects user location (GPS → IP → São Paulo fallback)<br />
                  • Search without page refresh<br />
                  • No sidebar (public access)<br />
                  • Mobile responsive design<br />
                  <br />
                  <strong>New Events Features:</strong><br />
                  • Create and manage spiritual events<br />
                  • Public events calendar<br />
                  • Location-based event discovery<br />
                  • RSVP and contact integration<br />
                  • Image galleries and detailed descriptions
                </small>
              </div>
            </div>
          </div>

          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h2 className="h5 fw-semibold mb-3">Authentication Routes:</h2>
              <div className="d-grid gap-2">
                <a href="/login" className="btn btn-outline-success text-start">
                  /login - Login Page (Monday.com style)
                </a>
                <a href="/register" className="btn btn-outline-success text-start">
                  /register - Register Page (Multi-step)
                </a>
                <a href="/forgot-password" className="btn btn-outline-warning text-start">
                  /forgot-password - Password Recovery
                </a>
              </div>
            </div>
          </div>

        <div className="alert alert-warning">
          <h5 className="alert-heading fw-semibold">Note:</h5>
          <p className="mb-2">The houses components depend on Firebase authentication. Make sure you have:</p>
          <ul className="mb-0">
            <li>Firebase project configured</li>
            <li>User authentication set up</li>
            <li>Firestore database with houses collection</li>
          </ul>
        </div>
      </div>
    </>
  );
}