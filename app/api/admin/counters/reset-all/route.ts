import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// POST - Reset all counters
export async function POST() {
  try {
    const { supabase, adminUser } = await createAdminClient()

    // Get all prayer type IDs
    const { data: prayerTypes } = await supabase
      .from('prayer_types')
      .select('id')

    if (!prayerTypes) {
      return NextResponse.json({ success: true })
    }

    // Reset each counter
    for (const pt of prayerTypes) {
      await supabase.rpc('admin_reset_prayer_counter', {
        p_prayer_type_id: pt.id,
        p_admin_note: 'Bulk reset',
      })
    }

    // Log bulk action
    await supabase.from('admin_logs').insert({
      admin_id: adminUser.id,
      action: 'reset_all_counters',
      entity_type: 'prayer_counter',
      details: { count: prayerTypes.length },
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error resetting all counters:', error)
    return NextResponse.json(
      { error: 'Failed to reset counters' },
      { status: 500 }
    )
  }
}
