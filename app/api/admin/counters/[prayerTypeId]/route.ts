import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// PATCH - Edit counter
export async function PATCH(
  request: NextRequest,
  { params }: { params: { prayerTypeId: string } }
) {
  try {
    const { supabase, adminUser } = await createAdminClient()
    const { new_value } = await request.json()
    const { prayerTypeId } = params

    const { data, error } = await supabase.rpc('admin_edit_prayer_counter', {
      p_prayer_type_id: prayerTypeId,
      p_new_value: new_value,
      p_admin_note: null,
    })

    if (error) throw error

    return NextResponse.json(data[0])

  } catch (error) {
    console.error('Error editing counter:', error)
    return NextResponse.json(
      { error: 'Failed to edit counter' },
      { status: 500 }
    )
  }
}
