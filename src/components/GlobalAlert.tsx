'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

export default function GlobalAlert() {
  const [scan, setScan] = useState<any>(null);

  useEffect(() => {
    try {
      const q = query(collection(db, 'public_scans'), orderBy('timestamp', 'desc'), limit(1));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const data = snapshot.docs[0].data();
          const isRecent = data.timestamp && (Date.now() - data.timestamp.toMillis() < 30000);
          if (isRecent) {
            setScan(data);
            setTimeout(() => setScan(null), 6000);
          }
        }
      }, (error) => {
        // Silently handle Firestore connection issues
        console.warn('GlobalAlert listener failed:', error.code);
      });
      return () => unsubscribe();
    } catch (error) {
      console.warn('GlobalAlert setup failed');
    }
  }, []);

  return (
    <AnimatePresence>
      {scan && (
        <motion.div 
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          style={{ 
            position: 'fixed', 
            top: '20px', 
            left: '20px', 
            right: '20px', 
            background: 'var(--primary)', 
            color: 'white', 
            padding: '1rem', 
            borderRadius: '1.25rem', 
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            border: '2px solid rgba(255,255,255,0.2)'
          }}
        >
          <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.5rem', borderRadius: '0.75rem' }}>
            <AlertCircle size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.1rem', opacity: 0.9 }}>Public Insight</p>
            <p style={{ fontSize: '0.85rem', fontWeight: 600, margin: 0 }}>
              Someone scanned <strong>{scan.product}</strong> for <strong>{scan.condition}</strong>
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
