'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function ProgramHeader() {
  const [programName, setProgramName] = useState('Vitanova 2026')

  useEffect(() => {
    const supabase = createClient()

    async function fetchProgram() {
      const { data } = await supabase
        .from('programs')
        .select('name')
        .eq('is_active', true)
        .single()

      if (data) {
        setProgramName(data.name)
      }
    }

    fetchProgram()
  }, [])

  return (
    <header className="border-b border-gray-800 bg-surface/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif font-bold text-gradient">
              {programName}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Prayer Repository
            </p>
          </div>
          
          <div className="text-right">
            <p className="text-xs text-gray-600">Powered by</p>
            <p className="text-sm font-medium text-gray-400">Jesus Youth SJCET</p>
          </div>
        </div>
      </div>
    </header>
  )
}