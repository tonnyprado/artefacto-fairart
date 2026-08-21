'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState, useRef, Suspense } from 'react'
import { gsap } from 'gsap'
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

  const leftColRef = useRef(null)
  const rightColRef = useRef(null)

  useEffect(() => {
    setMounted(true)
    loadCanvasData()
  }, [])

  // Animaciones GSAP
  useEffect(() => {
    if (mounted && leftColRef.current && rightColRef.current) {
      // Animación columna izquierda (folio)
      gsap.fromTo(
        leftColRef.current.children,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.2, ease: 'power3.out' }
      )

      // Animación columna derecha (contenido)
      gsap.fromTo(
        rightColRef.current.children,
        { opacity: 0, x: 30 },
        { opacity: 1, x: 0, duration: 0.6, stagger: 0.15, ease: 'power2.out', delay: 0.3 }
      )
    }
  }, [mounted])

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
        height: '100vh',
        overflow: 'hidden',
        background: STYLES.pageBackground,
      }}>
        {/* Layout de dos columnas - folio izquierda, contenido derecha */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          height: '100vh',
        }}>
          {/* Columna izquierda: Folio centrado */}
          <div
            ref={leftColRef}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
              background: COLORS.cream,
            }}
          >
            <SuccessHeader />
            <FolioDisplay folio={folio} />
          </div>

          {/* Columna derecha: Todo el contenido */}
          <div
            ref={rightColRef}
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              padding: '24px 32px',
              gap: '16px',
            }}
          >
            <WelcomeMessage nombre={nombre} />

            <NextSteps />

            <EmailReminder email={email} />

            <ActionButtons />
          </div>
        </div>
      </main>

      <ImageModal
        imageUrl={modalImage}
        onClose={() => setModalImage(null)}
      />

      <style jsx>{`
        @media (max-width: 768px) {
          main > div {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
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
