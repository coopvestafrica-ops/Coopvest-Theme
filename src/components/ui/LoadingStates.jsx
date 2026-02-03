import React, { useState, useCallback } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// Toast configuration
export const toastConfig = {
  position: 'top-right',
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 60,
  theme: 'colored'
}

// Toast helper functions
export const showToast = {
  success: (message) => toast.success(message, toastConfig),
  error: (message) => toast.error(message, toastConfig),
  warning: (message) => toast.warn(message, toastConfig),
  info: (message) => toast.info(message, toastConfig),
  promise: async (promise, messages) => {
    return toast.promise(
      promise,
      {
        pending: messages.pending || 'Processing...',
        success: messages.success || 'Success!',
        error: messages.error || 'Something went wrong'
      },
      toastConfig
    )
  }
}

// Custom Toast Component
export const ToastContent = ({ message, type = 'info' }) => {
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  }

  const colors = {
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6'
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <span style={{
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        background: colors[type],
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '14px',
        fontWeight: 'bold'
      }}>
        {icons[type]}
      </span>
      <span style={{ color: '#1F2937', fontSize: '14px', fontWeight: '500' }}>
        {message}
      </span>
    </div>
  )
}

// Toast Provider Component
export const ToastProvider = ({ children }) => {
  return (
    <>
      {children}
      <ToastContainer
        {...toastConfig}
        toastClassName="custom-toast"
        bodyClassName="custom-toast-body"
      />
    </>
  )
}

// Loading Spinner Component
export const LoadingSpinner = ({ size = 'md', fullScreen = false, text = '' }) => {
  const sizes = {
    sm: '24px',
    md: '40px',
    lg: '56px',
    xl: '72px'
  }

  const spinnerStyle = {
    width: sizes[size],
    height: sizes[size],
    border: '3px solid #E5E7EB',
    borderTopColor: '#3B82F6',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite'
  }

  const containerStyle = fullScreen ? {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    zIndex: 9999
  } : {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    gap: '12px'
  }

  return (
    <div style={containerStyle}>
      <div style={spinnerStyle} />
      {text && (
        <p style={{ color: '#6B7280', fontSize: '14px', marginTop: '8px' }}>
          {text}
        </p>
      )}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

// Button with loading state
export const LoadingButton = ({
  children,
  loading = false,
  disabled = false,
  onClick,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(loading)

  const handleClick = async (e) => {
    if (isLoading || disabled) return

    if (onClick) {
      setIsLoading(true)
      try {
        await onClick(e)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const variants = {
    primary: {
      background: '#3B82F6',
      color: 'white',
      hover: '#2563EB'
    },
    secondary: {
      background: '#6B7280',
      color: 'white',
      hover: '#4B5563'
    },
    danger: {
      background: '#EF4444',
      color: 'white',
      hover: '#DC2626'
    },
    success: {
      background: '#10B981',
      color: 'white',
      hover: '#059669'
    }
  }

  const sizes = {
    sm: { padding: '8px 16px', fontSize: '13px' },
    md: { padding: '10px 20px', fontSize: '14px' },
    lg: { padding: '14px 28px', fontSize: '16px' }
  }

  const buttonStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '500',
    cursor: (isLoading || disabled) ? 'not-allowed' : 'pointer',
    opacity: (isLoading || disabled) ? 0.6 : 1,
    transition: 'all 0.2s ease',
    width: fullWidth ? '100%' : 'auto',
    ...variants[variant],
    ...sizes[size],
    ...props.style
  }

  return (
    <button
      onClick={handleClick}
      disabled={isLoading || disabled}
      style={buttonStyle}
      {...props}
    >
      {isLoading && (
        <span style={{
          width: '16px',
          height: '16px',
          border: '2px solid transparent',
          borderTopColor: 'currentColor',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
      )}
      {children}
    </button>
  )
}

// Skeleton Loader Component
export const SkeletonLoader = ({ count = 1, height = '20px', width = '100%', borderRadius = '4px' }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {Array(count).fill(0).map((_, i) => (
        <div
          key={i}
          style={{
            height,
            width,
            borderRadius,
            background: 'linear-gradient(90deg, #F3F4F6 25%, #E5E7EB 50%, #F3F4F6 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite'
          }}
        />
      ))}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  )
}

// Card with loading state
export const LoadingCard = ({ height = '200px' }) => (
  <div style={{
    height,
    borderRadius: '12px',
    border: '1px solid #E5E7EB',
    overflow: 'hidden',
    background: 'white'
  }}>
    <SkeletonLoader count={5} height="32px" style={{ margin: '16px' }} />
  </div>
)

// Table with loading state
export const LoadingTable = ({ rows = 5, columns = 4 }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px' }}>
    {/* Header skeleton */}
    <div style={{ display: 'flex', gap: '12px', paddingBottom: '12px', borderBottom: '2px solid #E5E7EB' }}>
      {Array(columns).fill(0).map((_, i) => (
        <div key={i} style={{
          flex: 1,
          height: '20px',
          borderRadius: '4px',
          background: '#F3F4F6'
        }} />
      ))}
    </div>
    {/* Row skeletons */}
    {Array(rows).fill(0).map((_, i) => (
      <div key={i} style={{ display: 'flex', gap: '12px', padding: '12px 0' }}>
        {Array(columns).fill(0).map((_, j) => (
          <div key={j} style={{
            flex: 1,
            height: '24px',
            borderRadius: '4px',
            background: i % 2 === 0 ? '#F9FAFB' : '#F3F4F6'
          }} />
        ))}
      </div>
    ))}
  </div>
)

// Inline loading indicator
export const InlineLoading = ({ size = 'sm', color = '#3B82F6' }) => {
  const sizes = { sm: '16px', md: '24px', lg: '32px' }

  return (
    <span style={{
      display: 'inline-block',
      width: sizes[size],
      height: sizes[size],
      border: `2px solid ${color}20`,
      borderTopColor: color,
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite'
    }} />
  )
}

// Full page error state
export const ErrorState = ({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry
}) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    padding: '40px',
    textAlign: 'center'
  }}>
    <div style={{
      width: '80px',
      height: '80px',
      borderRadius: '50%',
      background: '#FEE2E2',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '24px'
    }}>
      <span style={{ fontSize: '36px', color: '#EF4444' }}>!</span>
    </div>
    <h3 style={{ color: '#1F2937', fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>
      {title}
    </h3>
    <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '24px', maxWidth: '400px' }}>
      {message}
    </p>
    {onRetry && (
      <button
        onClick={onRetry}
        style={{
          padding: '10px 24px',
          background: '#3B82F6',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontWeight: '500',
          cursor: 'pointer'
        }}
      >
        Try Again
      </button>
    )}
  </div>
)

// Empty state component
export const EmptyState = ({
  icon = '📭',
  title = 'No data found',
  description = 'There is no data to display at the moment.',
  action
}) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    textAlign: 'center'
  }}>
    <div style={{ fontSize: '48px', marginBottom: '16px' }}>{icon}</div>
    <h3 style={{ color: '#1F2937', fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
      {title}
    </h3>
    <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '24px', maxWidth: '400px' }}>
      {description}
    </p>
    {action}
  </div>
)

// Export all components
export default {
  ToastProvider,
  ToastContainer,
  showToast,
  ToastContent,
  LoadingSpinner,
  LoadingButton,
  SkeletonLoader,
  LoadingCard,
  LoadingTable,
  InlineLoading,
  ErrorState,
  EmptyState
}
