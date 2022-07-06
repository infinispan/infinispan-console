describe('Cache Creation Wizard', () => {
  beforeEach(() => {
    cy.login(Cypress.env("username"), Cypress.env("password"));
  })

  it('successfully creates with a template', () => {
    const cacheName = (Math.random() + 1).toString(36).substring(3);
    //go to create cache page
    cy.get('[data-cy=createCacheButton]').click();
    cy.get('#edit').click();
    //Checking that the Next button is disabled until the cache name is entered
    cy.get('[data-cy=wizardNextButton]').should('be.disabled');

    cy.get('#cache-name').click();
    cy.get('#cache-name').type(cacheName);

    cy.get('[data-cy=wizardNextButton]').click();

    cy.get('#template-selector').click();
    cy.contains('e2e-test-template').parent().find('button').click();
    cy.get('[data-cy=wizardNextButton]').click();
    // Once the cache created, redirection to main page is done and the cache should be visible
    //Is redirected to Data Container page
    cy.get('#cluster-manager-header').should('exist');
    cy.get('[data-cy=cacheManagerStatus]').should('exist');
    cy.get('[data-cy=rebalancingSwitch]').should('exist');
    cy.contains(cacheName);
  })
});
