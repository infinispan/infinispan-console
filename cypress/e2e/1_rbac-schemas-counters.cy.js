describe('RBAC Schemas, Counters, Tasks and Global Stats', () => {
  // --- Schemas ---

  it('observer user can view schemas but not create them', () => {
    cy.login('observer', Cypress.env('password'));
    cy.get('[data-cy="tab-Schemas"]').click({multiple: true, force: true});
    cy.contains('people');
    cy.contains('test-6.proto');
    cy.get('[data-cy="people.protoConfig"]').click();
    cy.contains('message Person');
    cy.get('button[aria-label="create-schema-button"]').should('not.exist');
    cy.get('[data-cy="actions-people.proto"]>button').click();
    cy.get('[aria-label="editSchemaAction"]').should('exist');
    cy.get('[aria-label="deleteSchemaAction"]').should('exist');
  });

  it('deployer user can create schemas', () => {
    cy.login('deployer', Cypress.env('password'));
    cy.get('[data-cy="tab-Schemas"]').click({multiple: true, force: true});
    cy.contains('people');
    cy.get('[data-cy="people.protoConfig"]').click();
    cy.contains('message Person');
    cy.get('button[aria-label="create-schema-button"]').should('exist');
    cy.get('[data-cy="actions-people.proto"]>button').click();
    cy.get('[aria-label="editSchemaAction"]').should('exist');
    cy.get('[aria-label="deleteSchemaAction"]').should('exist');
  });

  it('admin user can create schemas', () => {
    cy.login(Cypress.env('username'), Cypress.env('password'));
    cy.get('[data-cy="tab-Schemas"]').click({multiple: true, force: true});
    cy.contains('people');
    cy.get('[data-cy="people.protoConfig"]').click();
    cy.contains('message Person');
    cy.get('button[aria-label="create-schema-button"]').should('exist');
    cy.get('[data-cy="actions-people.proto"]>button').click();
    cy.get('[aria-label="editSchemaAction"]').should('exist');
    cy.get('[aria-label="deleteSchemaAction"]').should('exist');
  });

  // --- Counters ---

  it('observer user cannot delete or create counters', () => {
    cy.login('observer', Cypress.env('password'));
    cy.get('[data-cy="tab-Counters"]').click({multiple: true, force: true});
    cy.contains('strong-1');
    showFiltersIfNeeded();
    cy.get('[data-cy=toggle-counterTypeFilter]').should('exist');
    cy.get('[data-cy=toggle-counterStorageFilter]').should('exist');
    // Delete is disabled
    cy.get('[data-cy=actions-strong-1]').click();
    cy.get('[aria-label="deleteCounter"]').click();
    cy.get('[data-cy="deleteCounterButton"]').should('exist');
    cy.get('[data-cy="deleteCounterButton"]').should('be.disabled');
    cy.get('[data-cy="cancelCounterDeleteButton"]').click();
    // Set counter is available
    cy.get('[data-cy=actions-strong-1]').click();
    cy.get('[aria-label="setCounterAction"]').click();
    cy.get('[data-cy="confirmSetbutton"]').should('exist');
    cy.get('[data-cy="confirmSetbutton"]').should('not.be.disabled');
    cy.get('[data-cy="cancelSetButton"]').click();
  });

  it('admin user can delete and create counters', () => {
    cy.login(Cypress.env('username'), Cypress.env('password'));
    cy.get('[data-cy="tab-Counters"]').click({multiple: true, force: true});
    cy.contains('strong-1');
    showFiltersIfNeeded();
    cy.get('[data-cy=toggle-counterTypeFilter]').should('exist');
    // Delete is enabled
    cy.get('[data-cy=actions-strong-1]').click();
    cy.get('[aria-label="deleteCounter"]').click();
    cy.get('[data-cy="deleteCounterButton"]').should('not.be.disabled');
    cy.get('[data-cy="cancelCounterDeleteButton"]').click();
    // Set counter
    cy.get('[data-cy=actions-strong-1]').click();
    cy.get('[aria-label="setCounterAction"]').click();
    cy.get('[data-cy="confirmSetbutton"]').should('not.be.disabled');
    cy.get('[data-cy="cancelSetButton"]').click();
    // Create button visible
    cy.get('[data-cy="createCounterButton"]').should('exist');
  });

  // --- Tasks ---

  it('admin user can see tasks page', () => {
    cy.login(Cypress.env('username'), Cypress.env('password'));
    cy.get('[data-cy="tab-Tasks"]').click({multiple: true, force: true});
    cy.contains('hello');
  });

  // --- Global Stats ---

  it('monitor user cannot clear global stats', () => {
    cy.login('monitor', Cypress.env('password'), '/global-stats');
    cy.get('[data-cy="globalStatsActions"]').click();
    cy.get('[data-cy="clearAccessMetricsButton"]').should('not.exist');
  });

  it('observer user cannot clear global stats', () => {
    cy.login('observer', Cypress.env('password'), '/global-stats');
    cy.get('[data-cy="globalStatsActions"]').click();
    cy.get('[data-cy="clearAccessMetricsButton"]').should('not.exist');
  });

  // --- Not own secured cache ---

  it('monitor user cannot see a-rbac-test-cache', () => {
    cy.login('monitor', Cypress.env('password'));
    cy.get('[id^="pagination-caches-top-toggle"]').first().click();
    cy.get('[data-action=per-page-100]').click();
    cy.get('[data-cy=detailButton-a-rbac-test-cache]').should('not.exist');
  });

  it('observer user cannot see a-rbac-test-cache', () => {
    cy.login('observer', Cypress.env('password'));
    cy.get('[id^="pagination-caches-top-toggle"]').first().click();
    cy.get('[data-action=per-page-100]').click();
    cy.get('[data-cy=detailButton-a-rbac-test-cache]').should('not.exist');
  });

  it('application user cannot see indexed-cache', () => {
    cy.login('application', Cypress.env('password'));
    cy.get('[id^="pagination-caches-top-toggle"]').first().click();
    cy.get('[data-action=per-page-100]').click();
    cy.get('[data-cy=detailButton-indexed-cache]').should('not.exist');
  });

  function showFiltersIfNeeded() {
    cy.get('body').then(($body) => {
      if ($body.find('button[aria-label="Show Filters"]').length) {
        cy.get('button[aria-label="Show Filters"]').click();
      }
    });
  }
});
