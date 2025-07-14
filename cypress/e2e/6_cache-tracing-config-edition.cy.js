describe('Cache Tracing Update', () => {
  const cacheNames = ['people', 'indexed-cache']; //non-auth and auth caches

  it('tracing is not editable when tracing is not enabled in the server', () => {
    cy.origin('http://localhost:31222/console/cache/default', () => {
      cy.visit("/", {
        headers: {
          'Accept-Encoding': 'gzip, deflate, br'
        },
        auth: {
          username: Cypress.env('username'),
          password: Cypress.env('password')
        }
      });
      cy.contains("Tracing").should("not.exist");
      cy.get('[data-cy=detailCacheActions]').click();
      cy.get("[data-cy=manageConfigEditionLink]").click();
      cy.get('[data-cy=nav-item-Tracing]').should('not.exist');
    })
  });

  cacheNames.forEach((cacheName) => {
    it('successfully displays tracing and changes options for cache ' + cacheName, () => {
      cy.login(Cypress.env('username'), Cypress.env('password'), '/cache/' + cacheName);
      cy.contains('Tracing is enabled');

      cy.get('[data-cy=detailCacheActions]').click();
      cy.get("[data-cy=manageConfigEditionLink]").click();
      cy.get('[data-cy=nav-item-Tracing]').click();
      cy.contains("Tracing settings");
      cy.get('[data-cy=tracingSwitch]').should('exist');
      cy.get('[data-cy=tracingSwitch]').uncheck({force: true});
      cy.get('[data-cy=saveConfigButton-tracing]').click();
      cy.get('[data-cy=backButton-tracing]').click();
      cy.contains('Detail of cache ' + cacheName);
      cy.contains('Tracing is disabled');

      cy.get('[data-cy=detailCacheActions]').click();
      cy.get("[data-cy=manageConfigEditionLink]").click();
      cy.get('[data-cy=nav-item-Tracing]').click();
      cy.get('[data-cy=tracingSwitch]').check({force: true});
      cy.contains('Categories');
      cy.contains('container');
      cy.get('[data-cy=menu-toogle-categorySelector]').click();
      cy.get('[data-cy=option-typeahead-x-site]').click();
      cy.get('[data-cy=option-typeahead-cluster]').click();
      cy.get('[data-cy=option-typeahead-persistence]').click();
      cy.get('[data-cy=menu-toogle-categorySelector]').click();
      cy.get('[data-cy=saveConfigButton-tracing]').click();
      cy.contains(`Updated ${cacheName} cache: tracing.categories configured successfully`);
      cy.get('[data-cy=backButton-tracing]').click();
      cy.contains('Detail of cache ' + cacheName);
      cy.contains('Tracing is enabled');
    });
  })

});
