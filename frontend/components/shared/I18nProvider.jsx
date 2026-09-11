'use client';
import { useEffect } from 'react';
import '../../lib/i18n';

/**
 * Proveedor de i18n que inicializa el sistema de traducción
 * Se importa automáticamente la configuración de i18n
 */
export default function I18nProvider({ children }) {
  // Solo inicializa i18n al montar
  useEffect(() => {
    // i18n ya está inicializado por el import
  }, []);

  return <>{children}</>;
}
