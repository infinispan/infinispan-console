import {
  CONF_MUTABLE_SECURITY_AUTHORIZATION_ROLES
} from '../../src/services/cacheConfigUtils';

describe('RBAC Cache Update', () => {
  before(() => {
    cy.cleanupTest(Cypress.env('username'), Cypress.env('password'),
      `/caches/a-rbac-test-cache?action=set-mutable-attribute&attribute-name=${CONF_MUTABLE_SECURITY_AUTHORIZATION_ROLES}&attribute-value=observer admin monitor`,
      'POST');
  });

  it('successfully displays and updates roles', () => {
    cy.login(Cypress.env('username'), Cypress.env('password'), '/cache/a-rbac-test-cache');
    cy.get('[data-cy=cacheConfigurationTab]').click();
    cy.contains("observer").should('exist');
    cy.contains("admin").should('exist');
    cy.contains("monitor").should('exist');
    cy.contains("deployer").should('not.exist');
    cy.get('[data-cy=detailCacheActions]').click();
    cy.get('[data-cy=manageConfigEditionLink]').click();
    cy.get('[data-cy=nav-item-Security]').click();
    cy.contains("Security settings");
    cy.get('[data-cy=menu-toogle-rolesSelector]').click().type('deployer').type('{enter}');
    cy.get('[data-cy=menu-toogle-rolesSelector]').click()
    cy.get('[data-cy=saveConfigButton-security]').click();
    cy.get('[data-cy=backButton-security]').click();
    cy.contains('Updated a-rbac-test-cache cache: security.authorization.roles configured successfully');
    cy.get('[data-cy=cacheConfigurationTab]').click();
    cy.contains("observer").should('exist');
    cy.contains("admin").should('exist');
    cy.contains("monitor").should('exist');
    cy.contains("deployer").should('exist');
  });

  it('tab is invisible for not indexed caches', () => {
    cy.login(Cypress.env('username'), Cypress.env('password'), '/cache/default');
    cy.get('[data-cy=nav-item-Indexed]').should('not.exist');
  });
});
