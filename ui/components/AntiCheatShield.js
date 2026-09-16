'use client';

import { useEffect, useState } from 'react';

export default function AntiCheatShield({ roundName = 'Quiz', enabled = true, onViolation = null }) {
  const [violations, setViolations] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');

  useEffect(() => {
    if (!enabled) return;

    // 1. Disable Right Click Context Menu
    function handleContextMenu(e) {
      e.preventDefault();
      triggerWarning('Right-click is disabled during the competition.');
    }

    // 2. Block Inspect Element & Shortcut Keys
    function handleKeyDown(e) {
      // F12
      if (e.key === 'F12') {
        e.preventDefault();
        triggerWarning('Opening Developer Tools (F12) is prohibited!');
        return;
      }
      // Ctrl+Shift+I / J / C (DevTools)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && ['I', 'i', 'J', 'j', 'C', 'c'].includes(e.key)) {
        e.preventDefault();
        triggerWarning('Developer Tools shortcuts are disabled!');
        return;
      }
      // Ctrl+U (View Source)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U')) {
        e.preventDefault();
        triggerWarning('Viewing page source is disabled!');
        return;
      }
      // Block Ctrl+C / Ctrl+A if desired
      if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C')) {
        e.preventDefault();
        triggerWarning('Copying question text is prohibited!');
        return;
      }
    }

    // 3. Tab-Switch / Window Blur Detection
    function handleVisibilityChange() {
      if (document.hidden) {
        setViolations((prev) => {
          const next = prev + 1;
          if (onViolation) onViolation(next);
          return next;
        });
        triggerWarning('Tab switch detected! Please stay on this test tab to avoid disqualification.');
      }
    }

    // 4. Block copy event
    function handleCopy(e) {
      e.preventDefault();
      triggerWarning('Copying text to clipboard is prohibited!');
    }

    function triggerWarning(msg) {
      setWarningMessage(msg);
      setShowWarningModal(true);
    }

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('copy', handleCopy);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('copy', handleCopy);
    };
  }, [enabled, onViolation]);

  if (!showWarningModal) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        style={{
          background: '#141414',
          border: '2px solid var(--red)',
          borderRadius: 14,
          padding: 28,
          maxWidth: 440,
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 0 40px rgba(229, 9, 20, 0.4)',
        }}
      >
        <div style={{ fontSize: 44, marginBottom: 12 }}>⚠️</div>
        <h3 style={{ fontSize: 22, color: '#fff', marginBottom: 8, fontWeight: 'bold' }}>
          Anti-Cheat Shield Active
        </h3>
        <p style={{ color: 'var(--red)', fontWeight: 'bold', fontSize: 14, marginBottom: 12 }}>
          {warningMessage}
        </p>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, lineHeight: 1.5, marginBottom: 20 }}>
          Navigating away from the competition tab or attempting to inspect code triggers an automatic log to event monitors.
          <br />
          <strong style={{ color: 'var(--gold)' }}>Total Violations Recorded: {violations}</strong>
        </p>
        <button
          className="btn btn-primary btn-block"
          style={{ height: 44, fontWeight: 'bold' }}
          onClick={() => setShowWarningModal(false)}
        >
          I Understand &amp; Return to Test
        </button>
      </div>
    </div>
  );
}
