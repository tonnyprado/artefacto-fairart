import { useMemo } from 'react';
import { HttpConsignaApi } from './api/ConsignaApi';
import { CLAUSULAS, clausulasConDescuento } from './shared/acuerdo';
import { useContextoConsigna, useFlujoConsigna } from './hooks/useConsigna';
import { PASO_ENVIADO } from './estado/consignaReducer';
import { color, fuente } from './tema';
import { Encabezado } from './componentes/marco/Encabezado';
import { BarraProgreso } from './componentes/marco/BarraProgreso';
import { NavegacionPasos } from './componentes/marco/NavegacionPasos';
import { PieContacto } from './componentes/marco/PieContacto';
import { PasoBienvenida } from './componentes/pasos/PasoBienvenida';
import { PasoClausula } from './componentes/pasos/PasoClausula';
import { PasoFiscal } from './componentes/pasos/PasoFiscal';
import { PasoObras } from './componentes/pasos/PasoObras';
import { PasoFirma } from './componentes/pasos/PasoFirma';
import { PasoRevision } from './componentes/pasos/PasoRevision';
import { PasoEnviado } from './componentes/pasos/PasoEnviado';
import { DatosTransferencia } from './componentes/pago/DatosTransferencia';

/**
 * Punto de entrada de la feature. Montar en la ruta /consigna/:token.
 * @param {Object} props
 * @param {string} props.token
 * @param {any} [props.api] - inyectable para tests / otro backend
 * @param {string} [props.firmaDireccionUrl] - imagen pública (solo vista HTML; el PDF la toma de S3)
 */
export function ConsignaPage({ token, api, firmaDireccionUrl = '/assets/firma-direccion.png' }) {
  const cliente = useMemo(() => api ?? new HttpConsignaApi(), [api]);
  const carga = useContextoConsigna(cliente, token);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: color.crema, fontFamily: fuente.sans, color: '#000' }}>
      {carga.estado === 'cargando' && <Centro>Cargando tu acuerdo…</Centro>}
      {carga.estado === 'error' && (
        <><Encabezado /><Centro><b>{carga.status === 410 ? 'Liga expirada' : 'No pudimos abrir tu acuerdo'}</b><br />{carga.mensaje}</Centro></>
      )}
      {carga.estado === 'listo' && <Flujo api={cliente} token={token} ctx={carga.ctx} firmaDireccionUrl={firmaDireccionUrl} />}
    </div>
  );
}

function Centro({ children }) {
  return <div style={{ flex: 1, display: 'grid', placeItems: 'center', padding: 40, textAlign: 'center', fontSize: 15, lineHeight: 1.5 }}>{children}</div>;
}

function Flujo({ api, token, ctx, firmaDireccionUrl }) {
  const f = useFlujoConsigna(api, token, ctx);
  const { s, dispatch, ir } = f;
  const clausulas = useMemo(() => clausulasConDescuento(s.descuentoMax), [s.descuentoMax]);
  const etiquetaSiguiente = s.paso === 10 ? 'Confirmar precios →' : s.paso === 11 ? 'Ver documento →' : 'Siguiente →';

  const contenido = (() => {
    if (s.paso === 0) return <PasoBienvenida artista={ctx.artista} numObras={ctx.obras.length} onComenzar={() => ir(1)} />;
    if (s.paso >= 1 && s.paso <= CLAUSULAS.length) {
      const extra = s.paso === 6 ? <DatosTransferencia datos={ctx.datosPago} /> : undefined;
      return <PasoClausula clausula={clausulas[s.paso - 1]} extra={extra} />;
    }
    switch (s.paso) {
      case 9: return <PasoFiscal estado={s.estadoFiscal} constancia={s.constancia}
        onElegir={v => dispatch({ tipo: 'FISCAL', valor: v })} onArchivo={f.subirConstancia} />;
      case 10: return <PasoObras obras={ctx.obras} ganancias={s.ganancias} descuento={s.descuentoMax}
        onGanancia={(obraId, valor) => dispatch({ tipo: 'GANANCIA', obraId, valor })}
        onDescuento={v => dispatch({ tipo: 'DESCUENTO', valor: v })} />;
      case 11: return <PasoFirma nombre={ctx.artista.nombre} acepto={s.acepto} firma={s.firma}
        onAcepto={v => dispatch({ tipo: 'ACEPTO', valor: v })}
        onFirma={png => { dispatch({ tipo: 'FIRMA', valor: png }); ir(12); }} />;
      case 12: return <PasoRevision enviado={s.enviado} enviando={f.enviando} error={f.error}
        onEnviar={f.enviar} onDescargar={f.descargar}
        documento={{ artista: ctx.artista, obras: ctx.obras, ganancias: s.ganancias, descuentoMax: s.descuentoMax,
          estadoFiscal: s.estadoFiscal, constanciaNombre: s.constancia?.nombre ?? null, datosPago: ctx.datosPago,
          firmaArtista: s.firma, firmaDireccionUrl, fecha: new Date() }} />;
      case PASO_ENVIADO: return <PasoEnviado nombrePila={ctx.artista.nombrePila} correo={ctx.artista.correo}
        onRevisar={() => ir(12)} onDescargar={f.descargar} />;
    }
    return null;
  })();

  return (
    <>
      <Encabezado />
      {s.paso >= 1 && s.paso <= 12 && <BarraProgreso paso={s.paso} maxPaso={s.maxPaso} onIr={ir} />}
      <main style={{ flex: 1, width: '100%', maxWidth: 900, margin: '0 auto', padding: '28px 20px 40px', boxSizing: 'border-box' }}>
        <div key={s.paso} style={{ animation: 'afFadeUp .35s ease both' }}>{contenido}</div>
        {f.error && s.paso !== 12 && <p role="alert" style={{ color: color.rojo, fontWeight: 700, fontSize: 13 }}>{f.error}</p>}
        {s.paso >= 1 && s.paso <= 12 && (
          <NavegacionPasos onAtras={() => ir(s.paso - 1)}
            onSiguiente={s.paso < 12 ? () => ir(s.paso + 1) : undefined}
            deshabilitado={!f.puedeAvanzar} etiqueta={etiquetaSiguiente} />
        )}
      </main>
      <PieContacto whatsapp={ctx.contacto.whatsapp} url={ctx.contacto.url} nombre={ctx.artista.nombre} folio={ctx.artista.folio} />
      <style>{'@keyframes afFadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}'}</style>
    </>
  );
}
