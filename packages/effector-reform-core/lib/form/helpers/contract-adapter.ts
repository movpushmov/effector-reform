import { Contract } from '@withease/contracts';

function getFieldPath(message: string) {
  const matches = message.match(/[\w\s:]+expected/);

  if (!matches) {
    throw new Error();
  }

  return matches[0]
    .replace(' expected', '')
    .replace(/:/g, '')
    .split(' ')
    .join('.');
}

export function isContract(
  maybeContract: unknown,
): maybeContract is Contract<any, any> {
  return (
    maybeContract !== null &&
    typeof maybeContract === 'object' &&
    'isData' in maybeContract &&
    'getErrorMessages' in maybeContract
  );
}

export function contractAdapter(contract: Contract<any, any>) {
  return (values: any) => {
    if (contract.isData(values)) {
      return null;
    }

    return contract
      .getErrorMessages(values)
      .reduce<Record<string, string>>((acc, error) => {
        acc[getFieldPath(error)] = error;

        return acc;
      }, {});
  };
}
