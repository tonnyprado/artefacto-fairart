import { cn } from '@/lib/utils'

/**
 * Progress Bar para formulario multi-step
 */

export default function ProgressBar({ steps, currentStep }) {
  return (
    <div className="w-full">
      {/* Steps */}
      <div className="flex items-center justify-between mb-2">
        {steps.map((step, index) => {
          const stepNumber = index + 1
          const isActive = stepNumber === currentStep
          const isCompleted = stepNumber < currentStep

          return (
            <div key={index} className="flex-1 flex items-center">
              {/* Step Circle */}
              <div className="flex flex-col items-center flex-1">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all',
                    isCompleted && 'bg-green-600 text-white',
                    isActive && 'bg-red-600 text-white ring-4 ring-red-100',
                    !isActive && !isCompleted && 'bg-gray-200 text-gray-500'
                  )}
                >
                  {isCompleted ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
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
                  className={cn(
                    'text-xs mt-2 font-medium hidden sm:block text-center',
                    isActive && 'text-red-600',
                    isCompleted && 'text-green-600',
                    !isActive && !isCompleted && 'text-gray-500'
                  )}
                >
                  {step}
                </span>
              </div>

              {/* Line connector (except for last step) */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-2 -mt-8">
                  <div
                    className={cn(
                      'h-full transition-all',
                      stepNumber < currentStep ? 'bg-green-600' : 'bg-gray-200'
                    )}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Progress percentage */}
      <div className="mt-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-red-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}
