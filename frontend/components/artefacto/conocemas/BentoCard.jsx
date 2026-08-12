'use client';

/**
 * Componente base para tarjetas del diseño bento/masonry
 */
export default function BentoCard({
  children,
  className = '',
  backgroundColor = 'transparent',
  borderRadius = '20px',
  padding = '24px',
  gridColumn,
  gridRow,
  style = {},
}) {
  const gridStyle = {};
  if (gridColumn) gridStyle.gridColumn = gridColumn;
  if (gridRow) gridStyle.gridRow = gridRow;

  return (
    <div
      className={`bento-card ${className}`}
      style={{
        backgroundColor,
        borderRadius,
        padding,
        overflow: 'hidden',
        ...gridStyle,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
