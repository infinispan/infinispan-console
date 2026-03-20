describe('RBAC Data Container View', () => {
  it('monitor user sees limited data container view', () => {
    cy.login('monitor', Cypress.env('password'));
    cy.contains('Data container');
    cy.contains('Tracing is enabled');
    cy.get('[data-cy=rebalancingSwitch]').should('not.exist');
    cy.get('[data-ouia-component-id=cluster-manager-header-title]').should('exist');
    cy.get('[data-cy="statusInfo-clusterManager"]').should('exist');
    cy.get('[data-cy=navigationTabs]').should('exist');
    cy.contains(/^\d+ Caches$/);
    cy.contains('Counters');
    cy.contains('Tasks').should('not.exist');
    cy.contains('Schemas').should('not.exist');
    cy.get('#cache-table-toolbar').should('exist');
    cy.get('[data-cy=paginationArea]').should('exist');
    cy.get('[data-cy=cacheFilterSelect]').should('exist');
    cy.get('[data-cy=createCacheButton]').should('not.exist');
    cy.get('[data-cy=createCacheConfigButton]').should('exist');
    cy.get('[data-cy=showTemplatesButton]').should('exist');
    cy.get('[data-cy=cachesTable]').should('exist');
    cy.contains('default');
    cy.get('[data-cy=actions-default]').should('not.exist');
  });

  it('observer user sees schemas tab but no create cache button', () => {
    cy.login('observer', Cypress.env('password'));
    cy.contains('Data container');
    cy.get('[data-cy=rebalancingSwitch]').should('not.exist');
    cy.contains('Schemas');
    cy.get('[data-cy=createCacheButton]').should('not.exist');
    cy.get('[data-cy=createCacheConfigButton]').should('exist');
    cy.get('[data-cy=actions-default]').should('not.exist');
  });

  it('deployer user sees create cache button and cache actions', () => {
    cy.login('deployer', Cypress.env('password'));
    cy.contains('Data container');
    cy.get('[data-cy=rebalancingSwitch]').should('not.exist');
    cy.contains('Schemas');
    cy.get('[data-cy=createCacheButton]').should('exist');
    cy.get('[data-cy=actions-default]').should('exist');
    cy.get('[data-cy=actions-default]').click();
    cy.get('[aria-label=ignoreCacheAction]').should('not.exist');
    cy.get('[aria-label=deleteCacheAction]').should('exist');
  });

  it('admin user sees all data container features including rebalancing and ignore', () => {
    cy.login(Cypress.env('username'), Cypress.env('password'));
    cy.contains('Data container');
    cy.get('[data-cy=rebalancingSwitch]').should('exist');
    cy.contains('Schemas');
    cy.get('[data-cy=createCacheButton]').should('exist');
    cy.get('[data-cy=actions-default]').should('exist');
    cy.get('[data-cy=actions-default]').click();
    cy.get('[aria-label=ignoreCacheAction]').should('exist');
    cy.get('[aria-label=deleteCacheAction]').should('exist');
  });
});
