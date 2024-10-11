describe('Cache Tracing', () => {
  const cacheNames = ['people', 'indexed-cache']; //non-auth and auth caches
  
  cacheNames.forEach((cacheName) => {
    it('successfully displays tracing and changes options for cache ' + cacheName, () => {
      cy.login(Cypress.env('username'), Cypress.env('password'), '/cache/' + cacheName);
      cy.contains('Tracing is enabled');
  
      cy.get('[data-cy=detailCacheActions]').click();
      cy.get("[data-cy=manageTracingLink]").click();
      cy.get('[data-cy=tracingSwitch]').should('exist');
      cy.get('[data-cy=tracingSwitch]').uncheck({force: true});
      cy.get('[data-cy=saveButton]').click();
      cy.get('[data-cy=backButton]').click();
      cy.contains('Detail of cache ' + cacheName);
      cy.contains('Tracing is disabled');
  
      cy.get('[data-cy=detailCacheActions]').click();
      cy.get("[data-cy=manageTracingLink]").click();
      cy.get('[data-cy=tracingSwitch]').check({force: true});
      cy.contains('Categories');
      cy.contains('container');
      cy.get('[data-cy=menu-toogle-categorySelector]').click();
      cy.get('[data-cy=option-typeahead-x-site]').click();
      cy.get('[data-cy=option-typeahead-cluster]').click();
      cy.get('[data-cy=option-typeahead-persistence]').click();
      cy.get('[data-cy=menu-toogle-categorySelector]').click();
      cy.get('[data-cy=saveButton]').click();
      cy.contains('Cache ' + cacheName + ' successfully updated.');
      cy.get('[data-cy=backButton]').click();
      cy.contains('Detail of cache ' + cacheName);
      cy.contains('Tracing is enabled');
    });
  })
  
});
