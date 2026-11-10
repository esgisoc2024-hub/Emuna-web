import { NextResponse } from 'next/server';
import { anon } from '@/lib/supabase';
export const revalidate = 60;
export async function GET() {
  const { data } = await anon().from('cases').select('slug,title,service,images').eq('published', true).order('created_at', { ascending: false }).limit(6);
  return NextResponse.json(data || []);
}
