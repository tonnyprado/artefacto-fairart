'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import AuthGuard from '@/components/shared/AuthGuard'
import RoleGuard from '@/components/shared/RoleGuard'
import Button from '@/components/ui/Button'
import { useArtistasStore } from '@/stores/artistasStore'
import { useFasesStore } from '@/stores/fasesStore'
import { useEdicionesStore } from '@/stores/edicionesStore'
import { useCuradoresStore } from '@/stores/curadoresStore'
import ArtistasTable from '@/components/admin/ArtistasTable'
import EdicionesControl from '@/components/admin/EdicionesControl'
import FasesControl from '@/components/admin/FasesControl'
import FasesQuickControl from '@/components/admin/FasesQuickControl'
import CuradoresTable from '@/components/admin/CuradoresTable'
import MensajesContacto from '@/components/admin/MensajesContacto'
import { COLORS, FONTS } from '@/components/artefacto/theme'

/**
 * Dashboard de Admin
 *
 * Panel completo de administración con:
 * - Estadísticas generales
 * - Gestión de artistas
 * - Control de fases
 * - Gestión de curadores
 * - Navegación por tabs
 *
 * Protegido por AuthGuard y RoleGuard
 * Solo accesible para usuarios con role='admin'
 */

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { id: 'artistas', label: 'Artistas', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
  { id: 'mensajes', label: 'Mensajes', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
  { id: 'ediciones', label: 'Ediciones', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { id: 'fases', label: 'Fases', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
  { id: 'curadores', label: 'Curadores', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' }
]

const cardStyle = {
  backgroundColor: 'white',
  padding: '1.5rem',
  borderRadius: '16px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  transition: 'box-shadow 0.2s',
  border: `2px solid ${COLORS.creamDark}`
}

const StatCard = ({ icon, label, value, details, iconBg }) => (
  <div style={cardStyle}>
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '1rem'
    }}>
      <div style={{
        width: '3rem',
        height: '3rem',
        backgroundColor: iconBg,
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {icon}
      </div>
    </div>
    <p style={{
      fontSize: '0.875rem',
      color: COLORS.gray,
      marginBottom: '0.25rem',
      fontFamily: FONTS.body
    }}>{label}</p>
    <p style={{
      fontSize: '2rem',
      fontFamily: FONTS.display,
      fontWeight: FONTS.displayWeight,
      fontStyle: FONTS.displayStyle,
      color: COLORS.black
    }}>{value}</p>
    <div style={{
      display: 'flex',
      gap: '0.5rem',
      marginTop: '0.5rem',
      fontSize: '0.75rem',
      fontFamily: FONTS.body
    }}>
      {details}
    </div>
  </div>
)

function AdminDashboardContent() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('dashboard')

  // Stores
  const artistasStats = useArtistasStore(state => state.getEstadisticas())
  const fasesStats = useFasesStore(state => state.getEstadisticas())
  const edicionesStats = useEdicionesStore(state => state.getEstadisticas())
  const curadoresStats = useCuradoresStore(state => state.getEstadisticas())
  const faseActiva = useFasesStore(state => state.getFaseActiva())

  return (
    <div className="admin-panel font-sans" style={{ minHeight: '100vh', backgroundColor: COLORS.cream }}>
      {/* Header */}
      <header style={{
        backgroundColor: COLORS.red,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div style={{
          maxWidth: '1240px',
          margin: '0 auto',
          padding: '1.5rem 1rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <h1 style={{
                fontFamily: FONTS.display,
                fontWeight: FONTS.displayWeight,
                fontStyle: FONTS.displayStyle,
                fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                color: COLORS.cream,
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
                marginBottom: '0.25rem'
              }}>Panel de Administración</h1>
              <p style={{
                fontFamily: FONTS.body,
                fontWeight: FONTS.bodyWeight,
                fontSize: '0.875rem',
                color: COLORS.creamDark
              }}>Bienvenido, {user?.nombre}</p>
            </div>
            <Button variant="secondary" onClick={logout}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Cerrar Sesión
            </Button>
          </div>

          {/* Tabs Navigation */}
          <nav style={{
            display: 'flex',
            gap: '0.25rem',
            borderBottom: `2px solid ${COLORS.creamDark}`,
            overflowX: 'auto'
          }}>
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.75rem 1rem',
                  fontFamily: FONTS.subtitle,
                  fontWeight: FONTS.subtitleWeight,
                  fontStyle: FONTS.subtitleStyle,
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  transition: 'all 0.2s',
                  border: 'none',
                  borderBottom: activeTab === tab.id ? `3px solid ${COLORS.cream}` : '3px solid transparent',
                  backgroundColor: 'transparent',
                  color: activeTab === tab.id ? COLORS.cream : COLORS.creamDark,
                  cursor: 'pointer',
                  marginBottom: '-2px',
                  whiteSpace: 'nowrap'
                }}
              >
                <svg style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                </svg>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Content */}
      <main style={{
        maxWidth: '1240px',
        margin: '0 auto',
        padding: '2rem 1rem'
      }}>
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Stats Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.5rem'
            }}>
              <StatCard
                icon={
                  <svg style={{ width: '1.5rem', height: '1.5rem', color: COLORS.red }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                }
                label="Total Artistas"
                value={artistasStats.total}
                iconBg={COLORS.red + '20'}
                details={
                  <>
                    <span style={{ color: '#10b981' }}>✓ {artistasStats.aprobados} aprobados</span>
                    <span style={{ color: '#f59e0b' }}>⏳ {artistasStats.pendientes} pendientes</span>
                  </>
                }
              />

              <StatCard
                icon={
                  <svg style={{ width: '1.5rem', height: '1.5rem', color: '#3b82f6' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                }
                label="Total Fases"
                value={fasesStats.total}
                iconBg="#3b82f620"
                details={
                  <>
                    <span style={{ color: '#10b981' }}>✓ {fasesStats.activas} activas</span>
                    <span style={{ color: '#6b7280' }}>◉ {fasesStats.finalizadas} finalizadas</span>
                  </>
                }
              />

              <StatCard
                icon={
                  <svg style={{ width: '1.5rem', height: '1.5rem', color: '#a855f7' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                }
                label="Curadores"
                value={curadoresStats.total}
                iconBg="#a855f720"
                details={
                  <>
                    <span style={{ color: '#10b981' }}>✓ {curadoresStats.activos} activos</span>
                    <span style={{ color: '#6b7280' }}>◉ {curadoresStats.total_votaciones} votos</span>
                  </>
                }
              />

              <StatCard
                icon={
                  <svg style={{ width: '1.5rem', height: '1.5rem', color: '#10b981' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                label="Inscripciones Totales"
                value={fasesStats.total_artistas_inscritos}
                iconBg="#10b98120"
                details={
                  <span style={{ color: COLORS.gray }}>En todas las fases</span>
                }
              />
            </div>

            {/* Fase Activa */}
            {faseActiva && (
              <div style={{
                background: `linear-gradient(to right, ${COLORS.red}20, ${COLORS.red}10)`,
                borderLeft: `4px solid ${COLORS.red}`,
                padding: '1.5rem',
                borderRadius: '0 16px 16px 0'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                  <svg style={{ width: '1.5rem', height: '1.5rem', color: COLORS.red, marginTop: '0.25rem' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      fontFamily: FONTS.subtitle,
                      fontWeight: FONTS.subtitleWeight,
                      color: COLORS.black,
                      marginBottom: '0.5rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>Fase Activa</h3>
                    <p style={{
                      fontSize: '0.875rem',
                      color: COLORS.gray,
                      fontFamily: FONTS.body
                    }}>
                      <strong>{faseActiva.nombre}</strong> - {faseActiva.inscripciones_abiertas ? 'Inscripciones abiertas' : 'Votaciones abiertas'}
                    </p>
                    <div style={{
                      marginTop: '0.75rem',
                      display: 'flex',
                      gap: '1rem',
                      fontSize: '0.875rem',
                      fontFamily: FONTS.body,
                      flexWrap: 'wrap'
                    }}>
                      <span style={{ color: COLORS.gray }}>📊 {faseActiva.total_inscritos} inscritos</span>
                      <span style={{ color: COLORS.gray }}>🎯 {faseActiva.total_seleccionados} seleccionados</span>
                      <span style={{ color: COLORS.gray }}>👥 {faseActiva.total_curadores} curadores</span>
                    </div>
                  </div>
                  <Button size="sm" onClick={() => setActiveTab('fases')}>
                    Ver Fases
                  </Button>
                </div>
              </div>
            )}

            {/* Control Rápido de Fases */}
            <FasesQuickControl />

            {/* Quick Actions */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem'
            }}>
              {[
                { id: 'artistas', title: 'Gestionar Artistas', desc: 'Ver, aprobar o rechazar solicitudes de artistas' },
                { id: 'ediciones', title: 'Gestionar Ediciones', desc: 'Crear y administrar ediciones de ARTEFACT' },
                { id: 'fases', title: 'Controlar Fases', desc: 'Abrir/cerrar inscripciones y votaciones' },
                { id: 'curadores', title: 'Administrar Curadores', desc: 'Agregar, editar o desactivar curadores' }
              ].map(action => (
                <div
                  key={action.id}
                  onClick={() => setActiveTab(action.id)}
                  style={{
                    ...cardStyle,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.12)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '0.75rem'
                  }}>
                    <h3 style={{
                      fontFamily: FONTS.subtitle,
                      fontWeight: FONTS.subtitleWeight,
                      fontStyle: FONTS.subtitleStyle,
                      color: COLORS.black,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      fontSize: '1rem'
                    }}>
                      {action.title}
                    </h3>
                    <svg style={{ width: '1.25rem', height: '1.25rem', color: COLORS.gray }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <p style={{
                    fontSize: '0.875rem',
                    color: COLORS.gray,
                    fontFamily: FONTS.body
                  }}>
                    {action.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* User Info */}
            <div style={{
              backgroundColor: '#e8f4fd',
              borderLeft: '4px solid #3b82f6',
              padding: '1.5rem',
              borderRadius: '0 16px 16px 0'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <svg style={{ width: '1.5rem', height: '1.5rem', color: '#3b82f6', marginTop: '0.25rem' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 style={{
                    fontFamily: FONTS.subtitle,
                    fontWeight: 600,
                    color: '#1e3a8a',
                    marginBottom: '0.5rem'
                  }}>Información de Sesión</h3>
                  <div style={{
                    fontSize: '0.875rem',
                    color: '#1e40af',
                    fontFamily: FONTS.body,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem'
                  }}>
                    <p><strong>Usuario:</strong> {user?.nombre} {user?.apellido}</p>
                    <p><strong>Email:</strong> {user?.email}</p>
                    <p>
                      <strong>Rol:</strong>{' '}
                      <span style={{
                        display: 'inline-block',
                        padding: '0.25rem 0.5rem',
                        backgroundColor: '#bfdbfe',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        fontWeight: 600
                      }}>{user?.role}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Artistas Tab */}
        {activeTab === 'artistas' && <ArtistasTable />}

        {/* Mensajes Tab */}
        {activeTab === 'mensajes' && <MensajesContacto />}

        {/* Ediciones Tab */}
        {activeTab === 'ediciones' && <EdicionesControl />}

        {/* Fases Tab */}
        {activeTab === 'fases' && <FasesControl />}

        {/* Curadores Tab */}
        {activeTab === 'curadores' && <CuradoresTable />}
      </main>
    </div>
  )
}

export default function AdminDashboard() {
  return (
    <AuthGuard>
      <RoleGuard allowedRoles={['admin']}>
        <AdminDashboardContent />
      </RoleGuard>
    </AuthGuard>
  )
}
