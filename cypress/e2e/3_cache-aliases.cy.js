describe('Data Container Caches', () => {
  beforeEach(() => {
    cy.login(Cypress.env('username'), Cypress.env('password'));
  });

  it('successfully add / update / remove an alias', () => {
    cy.get('[data-cy=actions-default]').click();
    cy.get('[aria-label=updateAliasesCacheAction]').click();
    cy.get('[data-cy=updateAliasesCacheModal]').should('exist');
    cy.get('#updateAliasesCacheModal [aria-label=Close]').click(); //Closing modal with close button
    cy.get('[data-cy=updateAliasesCacheModal]').should('not.exist');

    cy.get('[data-cy=actions-default]').click();
    cy.get('[aria-label=updateAliasesCacheAction]').click();
    cy.get('[data-cy=updateAliasesCacheModal]').should('exist');
    cy.get('[data-cy=closeAction]').click(); //Closing modal with Close button
    cy.get('[data-cy=updateAliasesCacheModal]').should('not.exist');
    cy.get('[data-cy=actions-default]').click();
    cy.get('[aria-label=updateAliasesCacheAction]').click();
    // add aliases
    cy.get('[data-cy=menu-toogle-aliasesSelector]')
      .click().type('alias1')
      .type('{enter}');
    cy.get('[data-cy=updateAliasesButton]').click(); //Update aliases
    cy.get('[data-cy=closeAction]').click(); //Closing modal with Close button
    cy.contains('alias1');

    // Check detail has aliases
    cy.login(Cypress.env('username'), Cypress.env('password'), '/cache/default');
    cy.contains('Aliases');
    cy.contains('alias1');
    cy.login(Cypress.env('username'), Cypress.env('password'));

    cy.get('[data-cy=actions-default]').click();
    cy.get('[aria-label=updateAliasesCacheAction]').click();
    // add aliases
    cy.get('[data-cy=menu-toogle-aliasesSelector]')
      .click().type('alias1')
      .type('{enter}');
    cy.get('[data-cy=updateAliasesButton]').click(); //Update aliases
    cy.get('[data-cy=closeAction]').click(); //Closing modal with Close button
    cy.contains('alias1').should('not.exist');
    cy.contains('Success alert:Cache default successfully updated.');

    // Check detail has aliases
    cy.login(Cypress.env('username'), Cypress.env('password'), '/cache/default');
    cy.contains('Aliases').should('not.exist');
    cy.contains('alias1').should('not.exist');
    cy.login(Cypress.env('username'), Cypress.env('password'));
  });
});
