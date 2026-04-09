'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { getBrowserClient } from '@/lib/supabase/client';

const supabase = getBrowserClient();
const SupabaseContext = createContext(supabase);

export function useSupabase() {
  return useContext(SupabaseContext);
}

export default function SupabaseProvider({ children }: { children: ReactNode }) {
  return (
    <SupabaseContext.Provider value={supabase}>
      {children}
    </SupabaseContext.Provider>
  );
}
