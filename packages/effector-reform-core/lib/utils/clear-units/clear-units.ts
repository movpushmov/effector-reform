import { clearNode, Unit } from 'effector';

export function clearUnits(units: Unit<any>[]) {
  for (const unit of units) {
    clearNode(unit);
  }
}
