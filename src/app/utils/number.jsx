export const formatNumber = (num, maxDecimals = 3) => {
  num = Number(num);
  if (Number.isNaN(num)) return undefined;
  if (Number.isInteger(num)) return num.toString();
  return num.toFixed(maxDecimals).replace(/\.?0+$/, '');
};
