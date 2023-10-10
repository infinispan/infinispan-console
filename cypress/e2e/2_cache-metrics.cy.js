describe('Cache Metrics Overview', () => {
  it('successfully checks cache metrics', () => {
    cy.login(Cypress.env('username'), Cypress.env('password'), '/cache/people');
    //Check for Labels
    cy.get('[data-cy=cacheMetricsTab]').click();
    cy.contains('Approx. number of entries');
    cy.contains('Minimum number of nodes');

    // Check for data greater than -1
    cy.get('dt[aria-label="view-cache-approximate-unique-entries"]')
      .invoke('text')
      .then(parseFloat)
      .should('be.gt', -1);
    cy.get('dt[aria-label="view-cache-metrics-nodes"]').invoke('text').then(parseFloat).should('be.gt', -1);
  });

  it('successfully checks cache metrics for heap memory', () => {
    cy.login(Cypress.env('username'), Cypress.env('password'), '/cache/heap-test');
    cy.get('[data-cy=cacheMetricsTab]').click();
    cy.contains('Size in heap memory');
    cy.get('dt[aria-label="view-cache-metrics-heap"]').invoke('text').then(parseFloat).should('be.gt', -1);
  });

  it('successfully checks cache metrics for off-heap memory', () => {
    cy.login(Cypress.env('username'), Cypress.env('password'), '/cache/off-heap-test');
    cy.contains('Metrics (Enabled)').click();
    cy.contains('Size in off-heap memory');
    cy.get('dt[aria-label="view-cache-metrics-off-heap"]').invoke('text').then(parseFloat).should('be.gt', -1);
  });

  it('successfully checks cache metrics for off-heap memory', () => {
    cy.login(Cypress.env('username'), Cypress.env('password'), '/cache/jboss-cache');
    verifyCacheMetrics(0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
  });

  // TODO: Add a test of good stats display with a cache that does not change and provided different metrics

  function verifyCacheMetrics(
    appUniqueEntries,
    appEntrInMemory,
    appEntries,
    hitsCount,
    missesCount,
    storesCount,
    retrievalsCount,
    removeHits,
    removeMisses,
    evictions
  ) {
    cy.get('[data-cy=cacheMetricsTab]').click();
    cy.contains('Entries');
    cy.contains('Memory');
    cy.contains('Performance');
    cy.contains('Data access');
    cy.contains('Data for nodes');

    cy.get('dt[aria-label="view-cache-approximate-unique-entries"]')
      .invoke('text')
      .then(parseFloat)
      .should('be.gte', appUniqueEntries);

    cy.get('dt[aria-label="view-cache-approximate-entries-in-memory"]')
      .invoke('text')
      .then(parseFloat)
      .should('be.gte', appEntrInMemory);

    cy.get('dt[aria-label="view-cache-approximate-entries"]')
      .invoke('text')
      .then(parseFloat)
      .should('be.gte', appEntries);

    cy.get('dt[aria-label="view-cache-metrics-heap"]')
      .invoke('text')
      .then(parseFloat).should('be.eq', -1);

    cy.get('dt[aria-label="view-cache-metrics-nodes"]')
      .invoke('text')
      .then(parseFloat)
      .should('be.gte', 1);

    cy.get('dt[aria-label="average-cache-read-time"]')
      .invoke('text')
      .then(parseFloat)
      .should('be.gte', 0);

    cy.get('dt[aria-label="average-cache-write-time"]')
      .invoke('text')
      .then(parseFloat)
      .should('be.gte', 0);

    cy.get('dt[aria-label="average-cache-delete-time"]')
      .invoke('text')
      .then(parseFloat)
      .should('be.gte', 0);

    cy.get('[data-cy=HitsVal]')
      .invoke('text')
      .then(parseFloat)
      .should('be.gte', hitsCount);
    cy.get('[data-cy=MissesVal]')
      .invoke('text')
      .then(parseFloat)
      .should('be.gte', missesCount);
    cy.get('[data-cy=StoresVal]')
      .invoke('text')
      .then(parseFloat)
      .should('be.gte', storesCount);
    cy.get('[data-cy=RetrievalsVal]')
      .invoke('text')
      .then(parseFloat)
      .should('be.gte', retrievalsCount);
    cy.get('[data-cy=RemovehitsVal]')
      .invoke('text')
      .then(parseFloat)
      .should('be.gte', removeHits);
    cy.get('[data-cy=RemovemissesVal]')
      .invoke('text')
      .then(parseFloat)
      .should('be.gte', removeMisses);
    cy.get('[data-cy=EvictionsVal]')
      .invoke('text')
      .then(parseFloat)
      .should('be.gte', evictions);

    cy.get('[data-cy=data-distribution-chart]').should('exist');
  }
});
