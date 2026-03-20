describe('RBAC Cache Detail Views', () => {
  beforeEach(() => {
    cy.cleanupTest(Cypress.env('username'), Cypress.env('password'), '/caches/a-rbac-test-cache/fordCar', 'DELETE');
    cy.cleanupTest(Cypress.env('username'), Cypress.env('password'), '/caches/a-rbac-test-cache/kiaCar', 'DELETE');
    cy.cleanupTest(Cypress.env('username'), Cypress.env('password'), '/caches/indexed-cache-no-auth/stringKey', 'DELETE');
    cy.cleanupTest(Cypress.env('username'), Cypress.env('password'), '/caches/indexed-cache-no-auth/stringKey1', 'DELETE');
  });

  // --- Secured cache detail checks ---

  it('monitor user cannot see entries or query tabs on secured cache', () => {
    cy.login('monitor', Cypress.env('password'));
    navigateToCacheDetail('indexed-cache');
    cy.get('[data-cy=addEntryButton]').should('not.exist');
    cy.get('[data-cy=clearAllButton]').should('not.exist');
    cy.get('#rebalancing-switch').should('not.exist');
    cy.get('[data-cy=cacheConfigurationTab]').should('not.exist');
    cy.get('[data-cy=edit-alias-button]').should('not.exist');
    cy.get('[data-cy=cacheEntriesTab]').should('not.exist');
    cy.get('[data-cy=queriesTab]').should('not.exist');
    checkIndexManagement(false);
    checkCacheMetrics(false);
  });

  it('observer user can see entries and query on secured cache but not edit', () => {
    cy.login('observer', Cypress.env('password'));
    navigateToCacheDetail('indexed-cache');
    cy.get('[data-cy=addEntryButton]').should('not.exist');
    cy.get('#rebalancing-switch').should('not.exist');
    cy.get('[data-cy=cacheConfigurationTab]').should('not.exist');
    cy.get('[data-cy=cacheEntriesTab]').should('exist');
    cy.get('[data-cy=queriesTab]').should('exist');
    cy.contains('Elaia');
    cy.get('[data-cy=actions-elaia]').should('not.exist');
    // Query works
    cy.get('[data-cy=queriesTab]').click();
    cy.get('#textSearchByQuery').click().type('from org.infinispan.Person where age>2');
    cy.get('button[aria-label=searchButton]').click();
    cy.contains('1 - 1 of 1');
    cy.contains('Elaia');
  });

  it('application user can CRUD entries on own secured cache', () => {
    cy.login('application', Cypress.env('password'));
    navigateToCacheDetail('a-rbac-test-cache');
    cy.get('[data-cy=addEntryButton]').should('exist');
    cy.get('#rebalancing-switch').should('not.exist');
    cy.get('[data-cy=cacheConfigurationTab]').should('not.exist');
    crudEntriesOnCache();
  });

  it('deployer user can CRUD entries on own secured cache', () => {
    cy.login('deployer', Cypress.env('password'));
    navigateToCacheDetail('a-rbac-test-cache');
    cy.get('[data-cy=addEntryButton]').should('exist');
    cy.get('#rebalancing-switch').should('not.exist');
    cy.get('[data-cy=cacheConfigurationTab]').should('not.exist');
    crudEntriesOnCache();
  });

  it('admin user sees all cache detail features including rebalancing and config', () => {
    cy.login(Cypress.env('username'), Cypress.env('password'));
    navigateToCacheDetail('a-rbac-test-cache');
    cy.get('[data-cy=addEntryButton]').should('exist');
    cy.get('#rebalancing-switch').should('exist');
    cy.get('[data-cy=cacheConfigurationTab]').should('exist');
    cy.get('[data-cy=edit-alias-button]').should('exist');
    checkIndexManagement(true);
    checkCacheMetrics(true);
    crudEntriesOnCache();
  });

  // --- Non-secured cache detail checks ---

  it('admin user sees rebalancing and config on non-secured cache', () => {
    cy.login(Cypress.env('username'), Cypress.env('password'));
    navigateToCacheDetail('indexed-cache-no-auth');
    cy.get('#rebalancing-switch').should('exist');
    crudEntriesOnNonSecuredCache();
    // Config tab
    cy.get('[data-cy=cacheConfigurationTab]').click();
    cy.contains('authorization').should('not.exist');
    checkIndexManagement(true);
    checkCacheMetrics(true);
  });

  it('observer user can add entries on non-secured cache', () => {
    cy.login('observer', Cypress.env('password'));
    navigateToCacheDetail('indexed-cache-no-auth');
    cy.get('#rebalancing-switch').should('not.exist');
    crudEntriesOnNonSecuredCache();
    checkIndexManagement(false);
    checkCacheMetrics(false);
  });

  // --- No entries tab view ---

  it('non-admin user does not see config tab on not-encoded cache', () => {
    cy.login('monitor', Cypress.env('password'), '/cache/not-encoded');
    cy.get('[data-cy=manageEntriesTab]').should('not.exist');
    cy.get('[data-cy=cacheMetricsTab]').should('exist');
    cy.get('[data-cy=cacheConfigurationTab]').should('not.exist');
    cy.contains('Data access').should('exist');
  });

  it('admin user sees config and metrics tabs on not-encoded cache', () => {
    cy.login(Cypress.env('username'), Cypress.env('password'), '/cache/not-encoded');
    cy.get('[data-cy=manageEntriesTab]').should('not.exist');
    cy.get('[data-cy=cacheMetricsTab]').should('exist');
    cy.get('[data-cy=cacheConfigurationTab]').should('exist');
    cy.contains('JSON').should('exist');
    cy.get('[data-cy=cacheMetricsTab]').click();
    cy.contains('Data access').should('exist');
  });

  // --- Helper functions ---

  function navigateToCacheDetail(cacheName) {
    cy.get('[id^="pagination-caches-top-toggle"]').first().click();
    cy.get('[data-action=per-page-100]').click();
    cy.get('[data-cy=detailButton-' + cacheName + ']').click();
  }

  function checkIndexManagement(isSuperAdmin) {
    cy.get('[data-cy=detailCacheActions]').click();
    cy.get('[data-cy=manageIndexesLink]').click();
    if (isSuperAdmin) {
      cy.get('[data-cy=clearIndexButton]').should('exist');
    } else {
      cy.get('[data-cy=clearIndexButton]').should('not.exist');
    }
    cy.get('[data-cy=backButton]').click();
  }

  function checkCacheMetrics(isSuperAdmin) {
    cy.get('[data-cy=cacheMetricsTab]').click();
    cy.get('[data-cy=data-distribution-chart]').should('exist');
    if (isSuperAdmin) {
      cy.get('[data-cy=clearQueryMetricsButton]').should('exist');
    } else {
      cy.get('[data-cy=clearQueryMetricsButton]').should('not.exist');
    }
  }

  function crudEntriesOnCache() {
    // Add entry
    cy.get('[data-cy=addEntryButton]').click();
    cy.get('#key-entry').click().type('fordCar');
    cy.get('#toggle-valueContentType').click();
    cy.get('#option-custom_type').click();
    cy.get('#value-entry')
      .click()
      .type('{"_type": "org.infinispan.Car","name": "Ford","year": 2012,"number": "1BC1898"}', {
        parseSpecialCharSequences: false
      });
    cy.get('[data-cy=addButton]').click();
    cy.contains('Entry added to cache a-rbac-test-cache.');
    cy.get('[data-cy=actions-fordCar]').should('exist');

    // Add second entry
    cy.get('[data-cy=addEntryButton]').click();
    cy.get('#key-entry').click().type('kiaCar');
    cy.get('#toggle-valueContentType').click();
    cy.get('#option-custom_type').click();
    cy.get('#value-entry')
      .click()
      .type('{"_type": "org.infinispan.Car","name": "Kia","year": 2017,"number": "2AC1898"}', {
        parseSpecialCharSequences: false
      });
    cy.get('[data-cy=addButton]').click();
    cy.contains('Entry added to cache a-rbac-test-cache.');
    cy.get('[data-cy=actions-kiaCar]').should('exist');

    // Edit entry
    cy.get('[data-cy=actions-kiaCar] > button').click();
    cy.get('[aria-label=editEntryAction]').click();
    cy.get('#value-entry')
      .click()
      .clear()
      .type('{"_type": "org.infinispan.Car","name": "Kia","year": 2016,"number": "2AC1898"}', {
        parseSpecialCharSequences: false
      });
    cy.get('[data-cy=addButton]').click();
    cy.contains('Entry updated in cache a-rbac-test-cache.');
    cy.contains('2016');

    // Delete entry
    cy.get('[data-cy=actions-kiaCar] > button').click();
    cy.get('[aria-label=deleteEntryAction]').click();
    cy.get('[data-cy=deleteEntryButton]').click();
    cy.contains('Entry kiaCar deleted.');
    cy.contains('2AC1898').should('not.exist');

    // Query
    cy.get('[data-cy=queriesTab]').click();
    cy.get('#textSearchByQuery').click().type('from org.infinispan.Car where year>2010');
    cy.get('button[aria-label=searchButton]').click();
    cy.contains('1 - 1 of 1');
    cy.contains('Ford');

    // Clear all
    cy.get('[data-cy=manageEntriesTab]').click();
    cy.get('[data-cy=clearAllButton]').click();
    cy.get('[data-cy=deleteButton]').click();
  }

  function crudEntriesOnNonSecuredCache() {
    cy.get('[data-cy=addEntryButton]').click();
    cy.wait(1500);
    cy.get('#key-entry').click().type('stringKey');
    cy.get('#toggle-valueContentType').click();
    cy.get('#option-custom_type').click();
    cy.get('#value-entry')
      .click()
      .type('{"_type": "org.infinispan.Child","name": "Baby","age": 1,"city": "Miami"}', {
        parseSpecialCharSequences: false
      });
    cy.get('[data-cy=addButton]').click();
    cy.contains('Entry added to cache indexed-cache-no-auth.');
    cy.contains('stringKey');
    cy.contains('Baby');

    // Add second entry
    cy.get('[data-cy=addEntryButton]').click();
    cy.get('#cacheName').should('be.disabled');
    cy.get('#key-entry').click().type('stringKey1');
    cy.get('#value-entry').click().type('stringValue1');
    cy.get('[data-cy=addButton]').click();
    cy.contains('Entry added to cache indexed-cache-no-auth.');
    cy.contains('stringKey1');
    cy.contains('stringValue1');

    // Edit entry
    cy.get('[data-cy=actions-stringKey1] > button').click();
    cy.get('[aria-label=editEntryAction]').click();
    cy.get('#value-entry').click().type('changedValue');
    cy.get('[data-cy=addButton]').click();
    cy.contains('Entry updated in cache indexed-cache-no-auth.');
    cy.contains('changedValue');

    // Delete entry
    cy.get('[data-cy=actions-stringKey1]').click();
    cy.get('[aria-label=deleteEntryAction]').click();
    cy.get('[data-cy=deleteEntryButton]').click();
    cy.contains('Entry stringKey1 deleted.');
    cy.contains('stringValue1').should('not.exist');

    // Query
    cy.get('[data-cy=queriesTab]').click();
    cy.get('#textSearchByQuery').click().type('from org.infinispan.Child where age<2');
    cy.get('button[aria-label=searchButton]').click();
    cy.contains('1 - 1 of 1');
    cy.contains('Baby');

    // Clear all
    cy.get('[data-cy=manageEntriesTab]').click();
    cy.get('[data-cy=clearAllButton]').click();
    cy.get('[data-cy=deleteButton]').click();
    cy.wait(1500);
  }
});
