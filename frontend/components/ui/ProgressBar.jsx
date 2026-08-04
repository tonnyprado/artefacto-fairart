const COLORS = {
  red: '#B83030',
  black: '#141210',
  cream: '#F4EDE4',
  creamDark: '#E8DED1',
  gray: '#6B6B6B',
}

const FONTS = {
  body: 'acumin-pro, sans-serif',
}

/**
 * Progress Bar para formulario multi-step
 */
export default function ProgressBar({ steps, currentStep }) {
  return (
    <div style={{ width: '100%' }}>
      {/* Steps */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16
      }}>
        {steps.map((step, index) => {
          const stepNumber = index + 1
          const isActive = stepNumber === currentStep
          const isCompleted = stepNumber < currentStep

          return (
            <div key={index} style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
              {/* Step Circle */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                flex: 1
              }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: 15,
                    fontFamily: FONTS.body,
                    transition: 'all 0.3s ease',
                    background: isCompleted ? COLORS.black : isActive ? COLORS.red : 'rgba(20,18,16,0.2)',
                    color: isCompleted || isActive ? COLORS.cream : COLORS.gray,
                    border: isActive ? `3px solid ${COLORS.black}` : 'none',
                    boxShadow: isActive ? '0 0 0 4px rgba(184,48,48,0.2)' : 'none'
                  }}
                >
                  {isCompleted ? (
                    <svg style={{ width: 20, height: 20 }} fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    stepNumber
                  )}
                </div>
                <span
                  style={{
                    fontSize: 11,
                    marginTop: 8,
                    fontWeight: 600,
                    fontFamily: FONTS.body,
                    textAlign: 'center',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: isActive ? COLORS.red : isCompleted ? COLORS.black : COLORS.gray,
                    transition: 'all 0.3s ease',
                  }}
                  className="hidden sm:block"
                >
                  {step}
                </span>
              </div>

              {/* Line connector (except for last step) */}
              {index < steps.length - 1 && (
                <div style={{
                  flex: 1,
                  height: 3,
                  marginLeft: 8,
                  marginRight: 8,
                  marginTop: -32
                }}>
                  <div
                    style={{
                      height: '100%',
                      transition: 'all 0.3s ease',
                      background: stepNumber < currentStep ? COLORS.black : 'rgba(20,18,16,0.2)'
                    }}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Progress percentage */}
      <div style={{ marginTop: 24 }}>
        <div style={{
          width: '100%',
          background: 'rgba(20,18,16,0.15)',
          height: 6,
          borderRadius: '16px',
          overflow: 'hidden'
        }}>
          <div
            style={{
              background: COLORS.red,
              height: 6,
              transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
              width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
              borderRadius: '16px'
            }}
          />
        </div>
      </div>
    </div>
  )
}
