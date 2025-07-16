describe('Access Management', () => {
  beforeEach(() => {
    // cleanup created data
    cy.cleanupTest(Cypress.env('username'), Cypress.env('password'), '/security/permissions/aRole')
    cy.cleanupTest(Cypress.env('username'), Cypress.env('password'), '/security/roles/aPrincipal?action=grant')
    // logs in the access management page
    cy.login(Cypress.env('username'), Cypress.env('password'), '/access-management');
  });

  it('successfully loads the page', () => {
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

  it('successfully creates, updates and removes a role', () => {
    // create
    cy.get('button[data-cy="createRoleButton"]').click();
    cy.get("[aria-label=role-name-input]").type("aRole");
    cy.get("[aria-label=role-description-input]").type("aRole description");
    cy.get("[data-cy=menu-toogle-permissions]").click();
    cy.get("[data-cy=option-typeahead-ALL]").click();
    cy.get("[data-cy=menu-toogle-permissions]").click();
    cy.get("[aria-label=Create]").click();
    cy.contains('Role aRole has been created');
    cy.contains('aRole description');

    cy.login(Cypress.env('username'), Cypress.env('password'), '/access-management/role/aRole');
    cy.get('[aria-label=role-name-input')
      .should('have.value', 'aRole')
      .should('be.disabled');
    cy.get('[aria-label=role-description-input]')
      .should('have.value', 'aRole description')
      .type(' with update');
    cy.get('[aria-label=Save').click();
    cy.login(Cypress.env('username'), Cypress.env('password'), '/access-management/role/aRole');
    cy.get('[aria-label=role-description-input]')
      .should('have.value', 'aRole description with update');

    cy.get('[aria-label=nav-item-permissions').click();
    cy.contains('ALL');
    cy.get('[data-cy=addPermissionButton').click();
    cy.get('[data-cy=menu-toogle-permissions]').click();
    cy.get("[data-cy=option-typeahead-READ]").click();
    cy.get('[data-cy=menu-toogle-permissions]').click();
    cy.get('[aria-label=Save').click();
    cy.get("[aria-label=READ-menu]").click();
    cy.get("[aria-label=removePermission-READ]").click();
    cy.get("[aria-label=Remove]").click();
    cy.contains('Role aRole has been updated');

    cy.get('[aria-label=nav-item-caches').click();
    cy.contains('default');

    // remove
    cy.login(Cypress.env('username'), Cypress.env('password'), '/access-management');
    cy.get("[aria-label=aRole-menu]").click();
    cy.get("[aria-label=deleteRole]").click();
    cy.get("[aria-label=Delete]").click();
    cy.contains('Role aRole has been deleted');
    cy.contains('aRole description').should('not.exist');
  });

  it('successfully creates, updates and removes a principal', () => {
    // Log in the console
    cy.get('[aria-label=nav-item-principals').click();
    cy.contains('No principal role mappers').click();
    cy.get('[data-cy=grantAccessPrincipalButton').click();
    cy.get("[aria-label=principal-name-input]").type("aPrincipal");
    cy.get("[data-cy=menu-toogle-roles]").click();
    cy.get("[data-cy=option-typeahead-deployer]").click({animationDistanceThreshold: 20, waitForAnimations: false});
    cy.get("[data-cy=menu-toogle-roles]").click();
    cy.get('[aria-label=Save').click();
    cy.contains('Access granted to aPrincipal.');
    cy.get('[data-cy=detailLink-admin]').should('not.exist');
    cy.get('[data-cy=detailLink-deployer]').should('exist');
    cy.get('[aria-label^="Close"]').first().click();
//@TODO uncomment when ISPN-16618 is fixed
    //Managing roles of the principal
    // cy.get("[aria-label=aPrincipal-menu]").click();
    // cy.get("[aria-label=manageRoles]").click();
    // cy.get("[data-cy=menu-toogle-roles]").click();
    // cy.get("[data-cy=option-typeahead-admin]").click();
    // cy.get("[data-cy=option-typeahead-deployer]").click();
    // cy.get("[data-cy=menu-toogle-roles]").click();
    // cy.get('[aria-label=Save').click();
    // cy.get('[data-cy=detailLink-admin]').should('exist');
    // cy.get('[data-cy=detailLink-deployer]').should('not.exist');
    //@TODO uncomment when the both popups will be shown properly
    //cy.contains('Roles [admin] granted to aPrincipal.');
    //cy.contains('Roles [deployer] denied to aPrincipal.');

    //Removing principal
    // cy.get("[aria-label=aPrincipal-menu]").click();
    // cy.get("[aria-label=removePrincipal]").click();
    // cy.get("[data-cy=cancelPrincipalRemoveButton]").click();
    // cy.contains("aPrincipal");
    // cy.get("[aria-label=aPrincipal-menu]").click();
    // cy.get("[aria-label=removePrincipal]").click();
    // cy.get("[data-cy=removePrincipalButton]").click();
    // cy.contains('aPrincipal successfully removed.')
    // cy.contains('aPrincipal').should('not.exist');
  });

});
