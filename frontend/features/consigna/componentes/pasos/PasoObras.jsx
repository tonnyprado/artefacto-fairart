import { color } from '../../tema';
import { TituloPaso } from '../marco/TituloPaso';
import { FormulaPrecio } from '../obras/FormulaPrecio';
import { TablaObras } from '../obras/TablaObras';
import { SelectorDescuento } from '../obras/SelectorDescuento';

/**
 * @param {Object} props
 * @param {any[]} props.obras
 * @param {Record<string, number>} props.ganancias
 * @param {number | null} props.descuento
 * @param {(obraId: string, g: number) => void} props.onGanancia
 * @param {(v: number | null) => void} props.onDescuento
 */
export function PasoObras({ obras, ganancias, descuento, onGanancia, onDescuento }) {
  return (
    <div>
      <TituloPaso numero="10" titulo="Tus obras en consignación" />
      <p style={{ fontSize: 14.5, maxWidth: 660, lineHeight: 1.45, color: 'rgba(0,0,0,0.75)', margin: '12px 0 14px' }}>
        Estas son las obras que postulaste en tu registro, ahora con el desglose completo. La última columna es el <b>precio que verá el público</b>.
      </p>
      <FormulaPrecio />
      <p style={{ fontSize: 13, maxWidth: 660, lineHeight: 1.45, color: color.rojo, fontWeight: 600, margin: '0 0 16px' }}>
        Edita tu precio ya considerando IVA y comisión por pago con tarjeta. Lo demás se recalcula y registramos la diferencia.
      </p>
      <TablaObras obras={obras} ganancias={ganancias} onGanancia={onGanancia} />
      <SelectorDescuento valor={descuento} onCambiar={onDescuento} />
    </div>
  );
}
