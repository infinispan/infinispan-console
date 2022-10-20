export const numberWithCommas = (x) => {
  let numberSplit = x.toString().split('.');
  numberSplit[0] = numberSplit[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return numberSplit.join('.');
};
