import { numeroPaso, titularGrande } from '../../tema';

/**
 * @param {Object} props
 * @param {string} props.numero
 * @param {string} props.titulo
 */
export function TituloPaso({ numero, titulo }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, flexWrap: 'wrap', marginBottom: 6 }}>
      <div style={numeroPaso}>{numero}</div>
      <h2 style={titularGrande}>{titulo}</h2>
    </div>
  );
}
