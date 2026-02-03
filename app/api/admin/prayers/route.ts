import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// GET - List all prayer types
export async function GET() {
  try {
    const { supabase } = await createAdminClient()

    const { data, error } = await supabase
      .from('prayer_types')
      .select(`
        *,
        counter:prayer_counters(*)
      `)
      .order('display_order', { ascending: true })

    if (error) throw error

    return NextResponse.json(data)

  } catch (error) {
    console.error('Error fetching prayer types:', error)
    return NextResponse.json(
      { error: 'Failed to fetch prayer types' },
      { status: 500 }
    )
  }
}

// POST - Create new prayer type
export async function POST(request: NextRequest) {
  try {
    const { supabase, adminUser } = await createAdminClient()
    const body = await request.json()

    // Get active program
    const { data: program } = await supabase
      .from('programs')
      .select('id')
      .eq('is_active', true)
      .single()

    if (!program) {
      return NextResponse.json(
        { error: 'No active program found' },
        { status: 400 }
      )
    }

    // Get max display order
    const { data: maxOrder } = await supabase
      .from('prayer_types')
      .select('display_order')
      .order('display_order', { ascending: false })
      .limit(1)
      .single()

    const newOrder = (maxOrder?.display_order || 0) + 1

    // Insert prayer type
    const { data, error } = await supabase
      .from('prayer_types')
      .insert({
        program_id: program.id,
        name: body.name,
        description: body.description || null,
        type: body.type,
        increment_value: body.type === 'count' ? body.increment_value : null,
        time_increment_minutes: body.type === 'time' ? body.time_increment_minutes : null,
        is_visible: body.is_visible ?? true,
        is_enabled: body.is_enabled ?? true,
        icon: body.icon || null,
        display_order: newOrder,
      })
      .select()
      .single()

    if (error) throw error

    // Log action
    await supabase.from('admin_logs').insert({
      admin_id: adminUser.id,
      action: 'create_prayer_type',
      entity_type: 'prayer_type',
      entity_id: data.id,
      details: { name: body.name, type: body.type },
    })

    return NextResponse.json(data)

  } catch (error) {
    console.error('Error creating prayer type:', error)
    return NextResponse.json(
      { error: 'Failed to create prayer type' },
      { status: 500 }
    )
  }
}
