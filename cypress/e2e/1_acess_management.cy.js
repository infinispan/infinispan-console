describe('Global stats', () => {
  beforeEach(() => {
    cy.login(Cypress.env('username'), Cypress.env('password'), '/access-management');
  });

  it('successfully loads Access Management page', () => {
    cy.get('h1').should('contain', 'Access management');
    cy.contains('admin');
    cy.contains('Superuser');
  });

  it('successfully flushes the ACL cache', () => {
    cy.get('[data-cy=aclActions]').click();
    cy.get('[data-cy="flushCacheAction"]').click();
    cy.get('[aria-label="Cancel"]').click();
    cy.contains('flushed').should('not.exist');

    cy.get('[data-cy=aclActions]').click();
    cy.get('[data-cy="flushCacheAction"]').click();
    cy.get('[aria-label="Flush"]').click();
    cy.contains('Access control list cache successfully flushed across the cluster');

  });

  it('successfully creates and removes a role', () => {
    // create
    cy.get('button[data-cy="createRoleButton"]').click();
    cy.get("[aria-label=role-name-input]").type("aRole");
    cy.get("[aria-label=role-description-input]").type("aRole description");
    cy.get("[data-cy=menu-toogle-permissions").click();
    cy.get("#option-typeahead-ALL").click();
    cy.get("[data-cy=menu-toogle-permissions").click();
    cy.get("[aria-label=Create]").click();
    cy.contains('Role aRole has been created');
    cy.contains('aRole description');

    // remove
    cy.get("[aria-label=aRole-menu]").click();
    cy.get("[aria-label=deleteRole]").click();
    cy.get("[aria-label=Delete]").click();
    cy.contains('Role aRole has been deleted');
    cy.contains('aRole description').should('not.exist');
  });

});
