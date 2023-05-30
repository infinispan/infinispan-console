export const checkIfServerVersionIsGreaterOrEqual = (serverVersion, versionToCompare) => {
  const serverVersionArray = serverVersion.split('.');
  const versionToCompareArray = versionToCompare.split('.');

  if (serverVersionArray.length === 0 && serverVersionArray[0] === '') {
    return false;
  }

  for (let i = 0; i < serverVersionArray.length; i++) {
    if (parseInt(serverVersionArray[i]) > parseInt(versionToCompareArray[i])) {
      return true;
    }
    if (parseInt(serverVersionArray[i]) < parseInt(versionToCompareArray[i])) {
      return false;
    }
  }
  return true;
};
