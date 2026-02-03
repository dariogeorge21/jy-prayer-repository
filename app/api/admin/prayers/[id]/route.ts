import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// PATCH - Update prayer type
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { supabase, adminUser } = await createAdminClient()
    const body = await request.json()
    const { id } = params

    const { data, error } = await supabase
      .from('prayer_types')
      .update({
        name: body.name,
        description: body.description,
        type: body.type,
        increment_value: body.type === 'count' ? body.increment_value : null,
        time_increment_minutes: body.type === 'time' ? body.time_increment_minutes : null,
        is_visible: body.is_visible,
        is_enabled: body.is_enabled,
        icon: body.icon,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    // Log action
    await supabase.from('admin_logs').insert({
      admin_id: adminUser.id,
      action: 'update_prayer_type',
      entity_type: 'prayer_type',
      entity_id: id,
      details: body,
    })

    return NextResponse.json(data)

  } catch (error) {
    console.error('Error updating prayer type:', error)
    return NextResponse.json(
      { error: 'Failed to update prayer type' },
      { status: 500 }
    )
  }
}

// DELETE - Delete prayer type
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { supabase, adminUser } = await createAdminClient()
    const { id } = params

    // Get prayer type name before deletion
    const { data: prayerType } = await supabase
      .from('prayer_types')
      .select('name')
      .eq('id', id)
      .single()

    const { error } = await supabase
      .from('prayer_types')
      .delete()
      .eq('id', id)

    if (error) throw error

    // Log action
    await supabase.from('admin_logs').insert({
      admin_id: adminUser.id,
      action: 'delete_prayer_type',
      entity_type: 'prayer_type',
      entity_id: id,
      details: { name: prayerType?.name },
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting prayer type:', error)
    return NextResponse.json(
      { error: 'Failed to delete prayer type' },
      { status: 500 }
    )
  }
}
