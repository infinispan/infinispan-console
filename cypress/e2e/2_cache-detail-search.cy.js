describe('Cache Detail Overview', () => {
  beforeEach(() => {
    cy.login(Cypress.env('username'), Cypress.env('password'), '/cache/people');
  });

  it('successfully searches by values', () => {
    //Opening indexed-cache cache page.
    cy.login(Cypress.env('username'), Cypress.env('password'), '/cache/indexed-cache');

    // Going back to cache entries page
    cy.get('[data-cy=manageEntriesTab]').click();
    cy.get('[data-cy=queriesTab]').click();
    cy.get('#textSearchByQuery').click().type('from org.infinispan.Person where age>2');
    cy.get('button[aria-label=searchButton]').click();
    cy.contains('1 - 1 of 1');
    cy.contains('Elaia');

    // Going back to cache entries page
    cy.get('[data-cy=manageEntriesTab]').click();
    cy.get('[data-cy=queriesTab]').click();
    cy.get('#textSearchByQuery').click().clear().type("from org.infinispan.Person where name = 'Elaia'");
    cy.get('button[aria-label=searchButton]').click();
    cy.contains('1 - 1 of 1');
    cy.contains('Elaia');

    // Going back to cache entries page
    cy.get('[data-cy=manageEntriesTab]').click();
    cy.get('[data-cy=queriesTab]').click();

    cy.get('#textSearchByQuery').click().clear().type('from org.infinispan.Person where age=2');
    cy.get('button[aria-label=searchButton]').click();
    cy.contains('Values not found.');

    //Verify query metrics available
    cy.get('[data-cy=viewQueryMetricsButton]').click();
    cy.contains('Query metrics');
    cy.contains('from org.infinispan.Person');
    cy.get('[data-cy=clearQueryMetricsButton]').click();
    cy.get('[data-cy=confirmButton]').click();
    cy.contains('from org.infinispan.Person').should('not.exist');

    // Going back to cache entries page
    cy.get('[data-cy=cacheEntriesTab]').click();
    cy.get('[data-cy="manageEntriesTab"]').click();
    cy.contains('key-9');
  });

  it('successfully manages indexes', () => {
    //Opening indexed-cache cache page.
    cy.login(Cypress.env("username"), Cypress.env("password"), '/cache/indexed-cache');

    cy.get("[data-cy=manageIndexesLink]").click();
    cy.contains("org.infinispan.Person");
    cy.contains("3 k");
    cy.get("[data-cy=backButton]").click();
    cy.contains("Elaia");

    cy.get("[data-cy=manageIndexesLink]").click();
    cy.get("[data-cy=clearIndexButton]").click();
    cy.contains("Permanently clear index?");
    cy.get("[data-cy=cancelButton]").click();
    cy.contains("Permanently clear index?").should("not.exist");

    cy.get("[data-cy=clearIndexButton]").click();
    cy.get("[data-cy=clearIndex]").click();
    cy.contains("Index of cache indexed-cache cleared.");
    cy.contains("0");

    cy.get("[data-cy=rebuildIndexButton]").click();
    cy.contains("Rebuild index?");
    cy.get("[data-cy=cancelReindexButton]").click();

    cy.get("[data-cy=rebuildIndexButton]").click();
    cy.get("[data-cy=reindexButton]").click();
    cy.contains("1").should("not.exist");

    cy.get("[data-cy=backButton]").click();
    cy.contains("Elaia");
    cy.get("[data-cy=manageIndexesLink]").click();
    cy.contains("3 k");
  })
});
