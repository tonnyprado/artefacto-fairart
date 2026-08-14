'use client';

import { useState, useEffect } from 'react';
import { useOpinionesStore } from '@/stores/opinionesStore';

const MAX_CHARS = 100;

/**
 * FormOpinion - Formulario "¿Qué es arte para ti?"
 *
 * Tarjeta azul con inputs para recopilar opiniones de los visitantes.
 * Conectado al backend con validación de caracteres y filtro de contenido.
 *
 * @param {Object} style - Estilos inline (para grid positioning)
 * @param {string} className - Clases CSS del contenedor
 * @param {string} titleCls - Clases para el título
 * @param {string} subCls - Clases para el subtítulo
 * @param {string} inputCls - Clases para los inputs
 * @param {string} gapCls - Clases de gap entre inputs
 */
export default function FormOpinion({
  style,
  className,
  titleCls,
  subCls,
  inputCls,
  gapCls,
}) {
  const [opinion, setOpinion] = useState('');
  const [nombre, setNombre] = useState('');

  const {
    submitOpinion,
    isLoading,
    error,
    successMessage,
    clearMessages
  } = useOpinionesStore();

  // Limpiar mensajes después de 4 segundos
  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => {
        clearMessages();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error, clearMessages]);

  const handleOpinionChange = (e) => {
    const value = e.target.value;
    if (value.length <= MAX_CHARS) {
      setOpinion(value);
    }
  };

  const enviar = async (e) => {
    e.preventDefault();

    if (!opinion.trim() || !nombre.trim()) return;

    const result = await submitOpinion({
      opinion: opinion.trim(),
      nombre: nombre.trim()
    });

    if (result.success) {
      setOpinion('');
      setNombre('');
    }
  };

  const inputBase =
    'min-w-0 rounded-full border-none bg-white/25 font-serif italic text-white outline-none placeholder:italic placeholder:text-white/[.78] disabled:opacity-50 transition-opacity';

  const charsLeft = MAX_CHARS - opinion.length;
  const isNearLimit = charsLeft <= 20;

  return (
    <div
      id="registro"
      style={style}
      className={`flex flex-col justify-center bg-azul text-white ${className}`}
    >
      <div className="text-center">
        <p className={`font-bold ${titleCls}`}>Para ti, ¿qué es arte?</p>
        <p className={`mt-[.1em] font-serif italic ${subCls}`}>
          ¡Compártenos tu opinión!
        </p>
      </div>

      {/* Mensajes de estado */}
      {error && (
        <p className="mt-[.5em] text-center text-[1.2cqw] text-red-200 max-[1200px]:text-[2.8cqw]">
          {error}
        </p>
      )}
      {successMessage && (
        <p className="mt-[.5em] text-center text-[1.2cqw] text-green-200 max-[1200px]:text-[2.8cqw]">
          {successMessage}
        </p>
      )}

      <form onSubmit={enviar} className={`flex flex-col ${gapCls}`}>
        <div className="flex gap-[inherit]">
          <div className="relative flex-[2.4]">
            <input
              className={`w-full ${inputBase} ${inputCls}`}
              value={opinion}
              onChange={handleOpinionChange}
              placeholder="Para mí, el arte es..."
              disabled={isLoading}
              maxLength={MAX_CHARS}
              required
            />
          </div>
          <input
            className={`flex-1 text-center ${inputBase} ${inputCls}`}
            value={nombre}
            onChange={(e) => setNombre(e.target.value.slice(0, 50))}
            placeholder="Tu nombre"
            disabled={isLoading}
            maxLength={50}
            required
          />
        </div>

        {/* Contador y botón */}
        <div className="flex items-center justify-between">
          <span
            className={`text-[.9cqw] max-[1200px]:text-[2.5cqw] ${
              isNearLimit ? 'text-yellow-200' : 'text-white/60'
            }`}
          >
            {charsLeft} caracteres restantes
          </span>
          <button
            type="submit"
            disabled={isLoading || !opinion.trim() || !nombre.trim()}
            className="rounded-full bg-white px-[1.5cqw] py-[.5cqw] text-[1.1cqw] font-bold text-azul transition-all hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-50 max-[1200px]:px-[3cqw] max-[1200px]:py-[1cqw] max-[1200px]:text-[2.8cqw]"
          >
            {isLoading ? 'Enviando...' : 'Enviar'}
          </button>
        </div>
      </form>
    </div>
  );
}
