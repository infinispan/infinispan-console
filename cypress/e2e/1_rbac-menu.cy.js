describe('RBAC Menu Visibility', () => {
  it('monitor user sees only Data Container and Global Statistics', () => {
    cy.login('monitor', Cypress.env('password'));
    cy.get('[data-cy=sideBarToggle]').click();
    cy.contains('Data Container').should('exist');
    cy.contains('Global Statistics').should('exist');
    cy.contains('Cluster Membership').should('not.exist');
    cy.contains('Connected Clients').should('not.exist');
    cy.contains('Access Management').should('not.exist');
  });

  it('observer user sees only Data Container and Global Statistics', () => {
    cy.login('observer', Cypress.env('password'));
    cy.get('[data-cy=sideBarToggle]').click();
    cy.contains('Data Container').should('exist');
    cy.contains('Global Statistics').should('exist');
    cy.contains('Cluster Membership').should('not.exist');
    cy.contains('Connected Clients').should('not.exist');
    cy.contains('Access Management').should('not.exist');
  });

  it('application user sees only Data Container and Global Statistics', () => {
    cy.login('application', Cypress.env('password'));
    cy.get('[data-cy=sideBarToggle]').click();
    cy.contains('Data Container').should('exist');
    cy.contains('Global Statistics').should('exist');
    cy.contains('Cluster Membership').should('not.exist');
    cy.contains('Connected Clients').should('not.exist');
    cy.contains('Access Management').should('not.exist');
  });

  it('deployer user sees only Data Container and Global Statistics', () => {
    cy.login('deployer', Cypress.env('password'));
    cy.get('[data-cy=sideBarToggle]').click();
    cy.contains('Data Container').should('exist');
    cy.contains('Global Statistics').should('exist');
    cy.contains('Cluster Membership').should('not.exist');
    cy.contains('Connected Clients').should('not.exist');
    cy.contains('Access Management').should('not.exist');
  });

  it('admin user sees all menu items', () => {
    cy.login(Cypress.env('username'), Cypress.env('password'));
    cy.get('[data-cy=sideBarToggle]').click();
    cy.contains('Data Container').should('exist');
    cy.contains('Global Statistics').should('exist');
    cy.contains('Cluster Membership').should('exist');
    cy.contains('Connected Clients').should('exist');
    cy.contains('Access Management').should('exist');
  });
});
