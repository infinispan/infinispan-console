import { Grid, GridItem, InputGroup, InputGroupItem, TextInput } from '@patternfly/react-core';
import { SelectSingle } from '@app/Common/SelectSingle';
import { TimeUnits } from '@services/infinispanRefData';
import { selectOptionProps } from '@utils/selectOptionPropsCreator';
import React from 'react';

const TimeQuantityInputGroup = (props: { name: string, defaultValue?: string, value: number | undefined; minValue?: number, unit: string | undefined;
  valueModifier: (number) => void, unitModifier: (string) => void, validate?: () => 'success' | 'warning' | 'error' | 'default' }) => {
  return (
    <InputGroup>
      <InputGroupItem>
        <Grid>
          <GridItem span={5}>
            <TextInput
              data-cy={props.name}
              min={props.minValue}
              validated={props.validate? props.validate() : 'default'}
              size={150}
              placeholder={props.defaultValue}
              value={props.value}
              type="number"
              onChange={(_event, val) => {
                props.valueModifier(isNaN(parseInt(val))? undefined! : parseInt(val));
              }}
              aria-label={props.name}
            />
          </GridItem>
          <GridItem span={7}>
            <SelectSingle
              id={props.name + 'UnitSelector'}
              placeholder={''}
              selected={props.unit || TimeUnits.milliseconds}
              options={selectOptionProps(TimeUnits)}
              style={{ width: '150px' }}
              onSelect={(value) => props.unitModifier(value)}
            />
          </GridItem>
        </Grid>
      </InputGroupItem>
    </InputGroup>
  );
};

export default TimeQuantityInputGroup;
