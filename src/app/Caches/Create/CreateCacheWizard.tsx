import React, { useEffect, useState } from 'react';
import { Wizard } from '@patternfly/react-core';
import GettingStarted from './GettingStarted';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const CreateCacheWizard: React.FunctionComponent<any> = (props) => {
  const [formValue, setFormValue] = useState({});
  const [stepIdReached, setStepIdReached] = useState(1);
  const [isFormValid, setIsFormValid] = useState(false);

  const title = 'Create Cache';

  const onFormChange = (isValid, value) => {
    setIsFormValid(isValid);
    setFormValue(value);
  };

  const onNext = (step, prevStep) => {
    setStepIdReached(step.id);
    setIsFormValid(true);
  };

  const onBack = (step, prevStep) => {
    // setIsFormValid(true);
  };

  const closeWizard = () => {
    console.log('Close Wizard');

    <Link to="/">
      {/* <Button id="back-button" variant="secondary" target="_blank">
        {t('caches.create.back-button-label')}
      </Button> */}
    </Link>;
  };

  // Steps
  const stepGettingStarted = {
    id: 1,
    name: 'Getting started',
    component: (
      <GettingStarted
        formValue={formValue}
        isFormValid={isFormValid}
        onFormChange={onFormChange}
      />
    ),
    enableNext: isFormValid,
    canJumpTo: stepIdReached >= 1,
  };

  const stepEditCode = {
    id: 2,
    name: 'Edit code',
    component: <p>Step 2 content</p>,
    nextButtonText: 'Create Cache',
  };

  const steps = [stepGettingStarted, stepEditCode];

  return (
    <Wizard
      navAriaLabel={`${title} steps`}
      mainAriaLabel={`${title} content`}
      onNext={onNext}
      onBack={onBack}
      onClose={closeWizard}
      steps={steps}
    />
  );
};

export { CreateCacheWizard };
