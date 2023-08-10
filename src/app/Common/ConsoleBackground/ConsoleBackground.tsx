import React from 'react';
import { BackgroundImage } from '@patternfly/react-core';
import lg from '!!url-loader!@app/assets/images/infinispanbg_1200.png';
import './ConsoleBackground.css';

const ConsoleBackground = () => {
  return <BackgroundImage src={lg} className={'background-img'} />;
};
export { ConsoleBackground };
