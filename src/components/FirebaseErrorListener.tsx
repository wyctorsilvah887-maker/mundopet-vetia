'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';

export function FirebaseErrorListener() {
  useEffect(() => {
    const unsubscribe = errorEmitter.on('permission-error', (error) => {
      // Throwing the error so it's caught by the Next.js error overlay during development
      throw error;
    });
    return () => unsubscribe();
  }, []);

  return null;
}
