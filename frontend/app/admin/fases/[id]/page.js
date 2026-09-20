'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import PanelAdminRondas from '@/components/admin/PanelAdminRondas'
import Button from '@/components/ui/Button'

export default function FaseRondasPage({ params }) {
  const router = useRouter()
  const { id } = use(params)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => router.push('/admin/fases')}
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver a Fases
        </Button>
      </div>

      <PanelAdminRondas faseId={id} />
    </div>
  )
}
