// This component has been replaced by ServiceSchedulingMonday.tsx
// Use ServiceSchedulingMonday instead for the new Monday.com-style booking interface

import React from 'react';

interface DeprecatedProps {
  service?: any;
  house?: any;
  onClose?: () => void;
  onBookingComplete?: (id: string) => void;
}

export default function ServiceScheduling({ onClose }: DeprecatedProps) {
  return (
    <div style={{ 
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{ 
        background: 'white',
        padding: '40px',
        borderRadius: '12px',
        textAlign: 'center' as const,
        maxWidth: '500px',
        margin: '20px'
      }}>
        <h2 style={{ color: '#ff6b35', marginBottom: '16px' }}>⚠️ Component Deprecated</h2>
        <p style={{ marginBottom: '24px', color: '#676879' }}>
          This component has been replaced by <strong>ServiceSchedulingMonday</strong>.
        </p>
        <p style={{ marginBottom: '24px', color: '#676879' }}>
          Please use the new Monday.com-style booking interface.
        </p>
        <button 
          onClick={onClose}
          style={{
            background: '#0085ff',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}