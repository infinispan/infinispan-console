import React from 'react';
import {BackgroundImage} from '@patternfly/react-core';
import lg from '!!url-loader!@app/assets/images/infinispanbg_1200.png';
import sm from '!!url-loader!@app/assets/images/infinispanbg_768.png';
import sm2x from '!!url-loader!@app/assets/images/infinispanbg_768@2x.png';
import xs from '!!url-loader!@app/assets/images/infinispanbg_576.png';
import xs2x from '!!url-loader!@app/assets/images/infinispanbg_576@2x.png';

const ConsoleBackground = () => {

  const images = {
    lg: lg,
    sm: sm,
    sm2x: sm2x,
    xs: xs,
    xs2x: xs2x
  };

  const defaultFilter = (
    <filter>
    </filter>
  );

  return (
    <BackgroundImage src={images} filter={defaultFilter}/>
  );
};
export { ConsoleBackground };
