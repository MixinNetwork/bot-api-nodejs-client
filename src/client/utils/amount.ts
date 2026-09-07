import BigNumber from 'bignumber.js';

const validateUnit = (unit: number) => {
  if (!Number.isSafeInteger(unit) || unit < 0) throw new Error(`invalid unit: ${unit}`);
};

export const formatUnits = (amount: BigNumber.Value, unit: number) => {
  validateUnit(unit);
  return BigNumber(amount).shiftedBy(-unit);
};
export const parseUnits = (amount: BigNumber.Value, unit: number) => {
  validateUnit(unit);
  return BigNumber(amount).shiftedBy(unit).integerValue(BigNumber.ROUND_FLOOR);
};
