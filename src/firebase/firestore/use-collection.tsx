
'use client';

import { useState, useEffect } from 'react';
import {
  Query,
  onSnapshot,
  QuerySnapshot,
  DocumentData,
  FirestoreError,
} from 'firebase/firestore';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

export function useCollection<T = DocumentData>(query: Query<T> | null) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  useEffect(() => {
    if (!query) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      query,
      (snapshot: QuerySnapshot<T>) => {
        const items = snapshot.docs.map((doc) => ({
          ...(doc.data() as any),
          id: doc.id,
        }));
        setData(items as T[]);
        setLoading(false);
        setError(null);
      },
      async (err: FirestoreError) => {
        // Só emitimos FirestorePermissionError se o código for especificamente permission-denied
        if (err.code === 'permission-denied') {
          let path = 'query-restrita';
          try {
            if ((query as any).path) {
              path = (query as any).path;
            } else if ((query as any)._query?.path?.segments) {
              path = (query as any)._query.path.segments.join('/');
            }
          } catch (e) {
            // Fallback
          }
          
          const permissionError = new FirestorePermissionError({
            path: path,
            operation: 'list',
          });
          
          errorEmitter.emit('permission-error', permissionError);
        } else {
          // Logamos o erro real no console para depuração (ex: falta de índice)
          console.error('Firestore Query Error:', err);
        }
        
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [query]);

  return { data, loading, error };
}
