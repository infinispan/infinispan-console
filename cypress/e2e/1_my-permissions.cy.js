describe('My Permissions page', () => {
  const observerUserName = 'observer';

  it('successfully displays permissions for admin user', () => {
    cy.login(Cypress.env('username'), Cypress.env('password'), '/my-permissions');

    // Identity card
    cy.contains('Identity').should('exist');
    cy.get('[data-cy=username]').should('contain', 'admin');
    cy.get('[data-cy=limitedAccessLabel]').should('not.exist');

    // Group principals
    cy.get('[data-cy=groupPrincipals]').should('exist');
    cy.get('[data-cy=groupPrincipals]').should('contain', 'admin');

    // Global permissions card
    cy.contains('Global Permissions').should('exist');
    cy.get('[data-cy=globalPermissions]').should('exist');
    cy.get('[data-cy=globalPermissions]').should('contain', 'ADMIN');
    cy.get('[data-cy=globalPermissions]').should('contain', 'ALL');

    // Cache permissions table
    cy.contains('Cache Permissions').should('exist');
    cy.get('[data-cy=cachePermissionsTable]').should('exist');

    // All caches should have FULL ACCESS for admin
    cy.contains('FULL ACCESS').should('exist');

    // Cache name links should exist for non-internal caches
    cy.get('[data-cy=cachePermissionsTable]').find('a').should('have.length.greaterThan', 0);

    // Internal caches should be marked
    cy.contains('Internal').should('exist');

    // Pagination should exist
    cy.get('#cache-permissions-toolbar').should('exist');

    // Search filter
    cy.get('#cache-permissions-toolbar').find('input').type('default', {force: true});
    cy.get('[data-cy=cachePermissionsTable]').should('contain', 'default');

    // Clear search
    cy.get('#cache-permissions-toolbar').find('button[aria-label="Reset"]').click({force: true});

    // Click on a cache link to verify navigation works
    cy.get('[data-cy=cachePermissionsTable]').contains('a', 'default').click();
    cy.url().should('include', '/cache/default');
  });

  it('successfully displays permissions for observer user', () => {
    cy.login(observerUserName, Cypress.env('password'), '/my-permissions');

    // Identity card
    cy.contains('Identity').should('exist');
    cy.get('[data-cy=username]').should('contain', 'observer');

    // Limited access label should be visible for non-admin
    cy.get('[data-cy=limitedAccessLabel]').should('exist');

    // Group principals
    cy.get('[data-cy=groupPrincipals]').should('exist');
    cy.get('[data-cy=groupPrincipals]').should('contain', 'observer');

    // Global permissions - should have fewer permissions than admin
    cy.get('[data-cy=globalPermissions]').should('exist');
    cy.get('[data-cy=globalPermissions]').should('not.contain', 'ADMIN');

    // Cache permissions table
    cy.get('[data-cy=cachePermissionsTable]').should('exist');

    // Observer should see NO PERMISSION on some caches
    cy.contains('Access Level').should('exist');
    cy.contains('Permissions').should('exist');
    cy.contains('NO PERMISSION').should('exist');

    // Caches with NO PERMISSION should not have links
    cy.contains('NO PERMISSION').parents('tr').find('a').should('not.exist');
  });

  it('observer navigating to a cache without read permission sees not authorized', () => {
    cy.login(observerUserName, Cypress.env('password'), '/cache/a-rbac-test-cache');

    // Should display the not authorized page
    cy.contains('Unauthorized access').should('exist');
    cy.contains("don't have permission").should('exist');

    // Should have a button to go back home
    cy.contains('Return to home page').should('exist');
    cy.contains('Return to home page').click();
    cy.url().should('include', '/');
  });
});
