import { createClient } from '@supabase/supabase-js';

let supabase = null;

export const initSupabase = (url, key) => {
    if (!url || !key) return null;
    try {
        supabase = createClient(url, key);
        return supabase;
    } catch (e) {
        console.error("Supabase init error:", e);
        return null;
    }
};

export const getSupabase = () => supabase;
