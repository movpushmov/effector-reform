import { clearNode, Unit } from 'effector';

export function clearUnits(units: Unit<any>[], deep = false) {
  for (const unit of units) {
    clearNode(unit, { deep });
  }
}
