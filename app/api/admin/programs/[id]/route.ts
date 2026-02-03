import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { supabase, adminUser } = await createAdminClient()
    const body = await request.json()
    const { id } = params

    const { data, error } = await supabase
      .from('programs')
      .update({
        name: body.name,
        description: body.description,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    await supabase.from('admin_logs').insert({
      admin_id: adminUser.id,
      action: 'update_program',
      entity_type: 'program',
      entity_id: id,
      details: body,
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating program:', error)
    return NextResponse.json(
      { error: 'Failed to update program' },
      { status: 500 }
    )
  }
}
