describe('Bounded Cache Update', () => {
  before(() => {
    // Set  a-rbac-test-cache Max Size to 1.5
    cy.cleanupTest(Cypress.env('username'), Cypress.env('password'),
      '/caches/a-rbac-test-cache?action=set-mutable-attribute&attribute-name=memory.max-size&attribute-value=1.5GB',
      'POST');

    // Set jsonCache Max Count to 9000
    cy.cleanupTest(Cypress.env('username'), Cypress.env('password'),
      '/caches/json-cache?action=set-mutable-attribute&attribute-name=memory.max-count&attribute-value=9000',
      'POST');
  });

  it('successfully displays and updates max size in bounded cache', () => {
    cy.login(Cypress.env('username'), Cypress.env('password'), '/cache/a-rbac-test-cache');
    cy.get('[data-cy=detailCacheActions]').click();
    cy.get("[data-cy=manageConfigEditionLink]").click();
    cy.get("[data-cy=nav-item-Bounded]").click();
    cy.contains("Bounded settings");
    cy.contains("Maximum amount of memory");
    cy.get('[data-cy=memorySizeInput]').should('have.value', '1.5');
    cy.contains('GB');
    cy.get('[data-cy=memorySizeInput]').clear();
    cy.contains('You must specify a positive number');
    cy.get('[data-cy=memorySizeInput]').type('2');
    cy.get('[data-cy=toggle-memorySizeUnit]').click();
    cy.get('#option-MB').click();
    cy.get('[data-cy=saveConfigButton-bounded]').click();
    cy.contains('Updated a-rbac-test-cache cache: memory.max-size configured successfully');
    cy.get('[data-cy=backButton-bounded]').click();
    cy.get('[data-cy=cacheConfigurationTab]').click();
  });

  it('successfully displays and updates max count in bounded cache', () => {
    cy.login(Cypress.env('username'), Cypress.env('password'), '/cache/json-cache');
    cy.get('[data-cy=detailCacheActions]').click();
    cy.get("[data-cy=manageConfigEditionLink]").click();
    cy.get("[data-cy=nav-item-Bounded]").click();
    cy.contains("Bounded settings");
    cy.contains("Total number of entries");
    cy.get('[data-cy=memorySizeMaxCount]').should('have.value', '9000');
    cy.get('[data-cy=memorySizeMaxCount]').clear();
    cy.contains('You must specify a positive number');
    cy.get('[data-cy=memorySizeMaxCount]').type('2000');
    cy.get('[data-cy=saveConfigButton-bounded]').click();
    cy.contains('Updated json-cache cache: memory.max-count configured successfully');
    cy.get('[data-cy=backButton-bounded]').click();
    cy.get('[data-cy=cacheConfigurationTab]').click();
    cy.contains('"max-count": "2000"').click();
  });

  it('tab is invisible for not bounded caches', () => {
    cy.login(Cypress.env('username'), Cypress.env('password'), '/cache/default');
    cy.get('[data-cy=nav-item-Bounded]').should('not.exist');
  });
});
