import { SelectOptionObject } from '@patternfly/react-core/src/components/Select/SelectOption';
import React from 'react';

export interface IField {
  value: string;
  isValid: boolean;
  invalidText: string;
  helperText: string;
  validated: 'success' | 'error' | 'default';
}

export interface ISelectField {
  selected: string | SelectOptionObject | (string | SelectOptionObject)[];
  expanded: boolean;
  helperText: string;
}

class FormUtils {
  public validateNotRequiredNumericField = (
    value: string,
    fieldName: string,
    stateDispatch: React.Dispatch<React.SetStateAction<IField>>
  ): boolean => {
    const isEmpty = value.trim().length == 0;
    const isValid = isEmpty ? true : !isNaN(Number(value));
    if (isValid) {
      stateDispatch({
        value: value,
        isValid: isValid,
        invalidText: '',
        helperText: fieldName + ' is valid',
        validated: isEmpty ? 'default' : 'success'
      });
    } else {
      stateDispatch({
        value: value,
        isValid: isValid,
        invalidText: fieldName + ' has to be a number',
        helperText: 'Validating...',
        validated: 'error'
      });
    }
    return isValid;
  };

  public validateRequiredField = (
    value: string,
    fieldName: string,
    stateDispatch: React.Dispatch<React.SetStateAction<IField>>
  ): boolean => {
    const isValid = value.trim().length > 0;
    if (isValid) {
      stateDispatch({
        value: value,
        isValid: isValid,
        invalidText: '',
        helperText: fieldName + ' is valid',
        validated: 'success'
      });
    } else {
      stateDispatch({
        value: value,
        isValid: isValid,
        invalidText: fieldName + ' is required',
        helperText: 'Validating...',
        validated: 'error'
      });
    }
    return isValid;
  };
}

const formUtils: FormUtils = new FormUtils();

export default formUtils;
