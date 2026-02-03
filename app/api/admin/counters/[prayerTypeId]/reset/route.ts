import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// POST - Reset single counter
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ prayerTypeId: string }> }
) {
  try {
    const { supabase } = await createAdminClient()
    const { prayerTypeId } = await params

    const { error } = await supabase.rpc('admin_reset_prayer_counter', {
      p_prayer_type_id: prayerTypeId,
      p_admin_note: null,
    })

    if (error) throw error

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error resetting counter:', error)
    return NextResponse.json(
      { error: 'Failed to reset counter' },
      { status: 500 }
    )
  }
}
