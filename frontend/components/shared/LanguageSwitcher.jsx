'use client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../artefacto/theme';

/**
 * Selector de idioma minimalista
 * Props:
 * - dark: boolean - true para secciones con fondo rojo (texto cream)
 * - className: string - clase CSS adicional
 */
export default function LanguageSwitcher({ dark = false, className = '' }) {
  const { i18n } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);
  const currentLang = i18n.language;

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  const textColor = dark ? COLORS.cream : COLORS.black;
  const activeColor = dark ? COLORS.cream : COLORS.red;
  const inactiveOpacity = 0.4;

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: textColor,
        userSelect: 'none',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        onClick={() => changeLanguage('es')}
        style={{
          background: 'none',
          border: 'none',
          padding: '4px 6px',
          cursor: 'pointer',
          color: currentLang === 'es' ? activeColor : textColor,
          opacity: currentLang === 'es' ? 1 : (isHovered ? 0.7 : inactiveOpacity),
          fontSize: 'inherit',
          fontWeight: 'inherit',
          letterSpacing: 'inherit',
          textTransform: 'inherit',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          fontFamily: 'inherit',
          pointerEvents: 'auto',
        }}
        aria-label="Cambiar a español"
      >
        ES
      </button>
      <span style={{ opacity: 0.3, fontSize: 8 }}>|</span>
      <button
        onClick={() => changeLanguage('en')}
        style={{
          background: 'none',
          border: 'none',
          padding: '4px 6px',
          cursor: 'pointer',
          color: currentLang === 'en' ? activeColor : textColor,
          opacity: currentLang === 'en' ? 1 : (isHovered ? 0.7 : inactiveOpacity),
          fontSize: 'inherit',
          fontWeight: 'inherit',
          letterSpacing: 'inherit',
          textTransform: 'inherit',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          fontFamily: 'inherit',
          pointerEvents: 'auto',
        }}
        aria-label="Switch to English"
      >
        EN
      </button>
    </div>
  );
}
