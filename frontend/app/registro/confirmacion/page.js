'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import CustomCursor from '@/components/artefacto/CustomCursor'
import {
  SuccessHeader,
  FolioDisplay,
  WelcomeMessage,
  NextSteps,
  EmailReminder,
  LienzoPreview,
  ImageModal,
  ActionButtons,
  ContactFooter,
  COLORS,
  STYLES,
} from '@/components/confirmacion'

export const dynamic = 'force-dynamic'

/**
 * Página de confirmación de registro exitoso
 * Muestra el folio, pasos siguientes y preview del lienzo
 */
function ConfirmacionContent() {
  const searchParams = useSearchParams()

  const folio = searchParams.get('folio')
  const nombre = searchParams.get('nombre')
  const email = searchParams.get('email')

  const [mounted, setMounted] = useState(false)
  const [canvasData, setCanvasData] = useState(null)
  const [modalImage, setModalImage] = useState(null)

  useEffect(() => {
    setMounted(true)
    loadCanvasData()
  }, [])

  const loadCanvasData = () => {
    try {
      const savedData = localStorage.getItem('artefacto_confirmacion_data')
      if (savedData) {
        setCanvasData(JSON.parse(savedData))
      }
    } catch (error) {
      console.error('Error leyendo datos de confirmación:', error)
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <>
      <CustomCursor />

      <main style={{
        minHeight: '100vh',
        background: STYLES.pageBackground,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
      }}>
        <div style={{ maxWidth: '600px', width: '100%' }}>
          <SuccessHeader />

          <FolioDisplay folio={folio} />

          <div style={{ marginTop: '32px' }}>
            <WelcomeMessage nombre={nombre} />
          </div>

          <div style={{ marginTop: '28px' }}>
            <NextSteps />
          </div>

          <EmailReminder email={email} />

          <LienzoPreview
            canvasData={canvasData}
            onImageClick={setModalImage}
          />

          <div style={{ marginTop: '32px' }}>
            <ActionButtons />
          </div>

          <ContactFooter />
        </div>
      </main>

      <ImageModal
        imageUrl={modalImage}
        onClose={() => setModalImage(null)}
      />
    </>
  )
}

/**
 * Loading fallback durante la carga de Suspense
 */
function LoadingFallback() {
  return (
    <div style={{
      minHeight: '100vh',
      background: STYLES.pageBackground,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{ textAlign: 'center', color: COLORS.black }}>
        <LoadingSpinner />
        <p style={{
          marginTop: '16px',
          fontFamily: 'acumin-pro, sans-serif',
          fontSize: '14px',
          color: COLORS.gray,
        }}>
          Cargando...
        </p>
      </div>
    </div>
  )
}

function LoadingSpinner() {
  return (
    <div style={{
      width: '40px',
      height: '40px',
      border: `3px solid ${COLORS.cream}`,
      borderTopColor: COLORS.black,
      borderRadius: '50%',
      margin: '0 auto',
      animation: 'spin 1s linear infinite',
    }}>
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default function ConfirmacionPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ConfirmacionContent />
    </Suspense>
  )
}
