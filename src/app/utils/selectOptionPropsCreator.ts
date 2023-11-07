import { SelectOptionProps } from '@patternfly/react-core';
import { EncodingType } from '@services/infinispanRefData';

export const selectOptionProps = (enumeration, excluding?): SelectOptionProps[] => {
  const selectOptions: SelectOptionProps[] = [];
  Object.keys(enumeration).forEach((key) => {
    let add: boolean = true;
    if (excluding) {
      excluding.forEach((exclusion) => {
        if (enumeration[key] == exclusion) {
          add = false;
          return;
        }
      });
    }
    if (add) {
      selectOptions.push({
        id: key,
        value: enumeration[key],
        children: enumeration[key]
      });
    }
  });

  return selectOptions;
};

export const selectOptionPropsFromArray = (arr: string[]): SelectOptionProps[] => {
  const selectOptions: SelectOptionProps[] = [];
  arr.forEach((element) =>
    selectOptions.push({
      id: element.toLowerCase().replace(' ', '_'),
      value: element,
      children: element
    })
  );
  return selectOptions;
};
