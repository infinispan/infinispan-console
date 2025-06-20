describe('Data Container Caches', () => {
  beforeEach(() => {
    cy.login(Cypress.env('username'), Cypress.env('password'));
  });

  const cacheNames = ['default']//, 'indexed-cache'];

  cacheNames.forEach((cacheName) => {
    it('successfully add / update / remove an alias for cache ' + cacheName, () => {
      cy.get('[data-cy=actions-'+ cacheName + ']').click();
      cy.get('[aria-label=updateAliasesCacheAction]').click();
      cy.get('[data-cy=updateAliasesCacheModal]').should('exist');
      cy.get('#updateAliasesCacheModal [aria-label=Close]').click(); //Closing modal with close button
      cy.get('[data-cy=updateAliasesCacheModal]').should('not.exist');

      cy.get('[data-cy=actions-'+ cacheName + ']').click();
      cy.get('[aria-label=updateAliasesCacheAction]').click();
      cy.get('[data-cy=updateAliasesCacheModal]').should('exist');
      cy.get('[data-cy=closeAction]').click(); //Closing modal with Close button
      cy.get('[data-cy=updateAliasesCacheModal]').should('not.exist');
      cy.get('[data-cy=actions-'+ cacheName + ']').click();
      cy.get('[aria-label=updateAliasesCacheAction]').click();
      // add aliases
      cy.get('[data-cy=menu-toogle-aliasesSelector]')
        .click().type('alias1')
        .type('{enter}');
      cy.get('[data-cy=updateAliasesButton]').click(); //Update aliases
      cy.get('[data-cy=closeAction]').click(); //Closing modal with Close button
      cy.contains('alias1');

      // Check detail has aliases
      cy.login(Cypress.env('username'), Cypress.env('password'), '/cache/' + cacheName);
      cy.contains('Aliases');
      cy.contains('alias1');
      cy.get('[data-cy=edit-alias-button]').click();
      // Check modal exists
      cy.get('[data-cy=updateAliasesCacheModal]').should('exist');
      cy.get('[data-cy=closeAction]').click(); //Closing modal with Close button

      cy.login(Cypress.env('username'), Cypress.env('password'));

      cy.get('[data-cy=actions-'+ cacheName + ']').click();
      cy.get('[aria-label=updateAliasesCacheAction]').click();
      // add aliases
      cy.get('[data-cy=menu-toogle-aliasesSelector]')
        .click().type('alias1')
        .type('{enter}');
      cy.get('[data-cy=updateAliasesButton]').click(); //Update aliases
      cy.get('[data-cy=closeAction]').click(); //Closing modal with Close button
      cy.contains('alias1').should('not.exist');
      cy.contains(`Updated ${cacheName} cache: aliases configured successfully`);

      // Check detail has aliases
      cy.login(Cypress.env('username'), Cypress.env('password'), '/cache/' + cacheName);
      cy.contains('Aliases').should('not.exist');
      cy.contains('alias1').should('not.exist');
      cy.login(Cypress.env('username'), Cypress.env('password'));
    });
  });
});
