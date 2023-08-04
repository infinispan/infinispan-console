export const numberWithCommas = (x) => {
  if (x == undefined) return '-';

  const numberSplit = x.toString().split('.');
  numberSplit[0] = numberSplit[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return numberSplit.join('.');
};
