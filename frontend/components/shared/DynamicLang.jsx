'use client';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Componente que actualiza dinámicamente el atributo lang del HTML
 * según el idioma actual de i18next
 */
export default function DynamicLang() {
  const { i18n } = useTranslation();

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = i18n.language;
    }
  }, [i18n.language]);

  return null;
}
