import { CONF_MUTABLE_INDEXING_INDEXED_ENTITIES } from '../../src/services/cacheConfigUtils';

describe('Indexed Cache Update', () => {
  before(() => {
    cy.cleanupTest(Cypress.env('username'), Cypress.env('password'),
      `/caches/indexed-cache?action=set-mutable-attribute&attribute-name=${CONF_MUTABLE_INDEXING_INDEXED_ENTITIES}&attribute-value='org.infinispan.Person'`,
      'POST');
  });

  it('successfully displays and updates indexed entities', () => {
    cy.login(Cypress.env('username'), Cypress.env('password'), '/cache/indexed-cache');
    cy.get('[data-cy=cacheConfigurationTab]').click();
    cy.contains("org.infinispan.Person").should('exist');
    cy.contains("org.infinispan.Car").should('not.exist');
    cy.get('[data-cy=detailCacheActions]').click();
    cy.get('[data-cy=manageConfigEditionLink]').click();
    cy.get('[data-cy=nav-item-Indexed]').click();
    cy.contains("Indexing settings");
    cy.get('[data-cy=menu-toogle-entitiesSelector]').click().type('org.infinispan.Car').type('{enter}');
    cy.get('[data-cy=menu-toogle-entitiesSelector]').click()
    cy.get('[data-cy=saveConfigButton-indexing]').click();
    cy.get('[data-cy=backButton-indexing]').click();
    cy.contains('Updated indexed-cache cache: indexing.indexed-entities configured successfully');
    cy.get('[data-cy=cacheConfigurationTab]').click();
    cy.contains("org.infinispan.Car").should('exist');
    cy.contains("org.infinispan.Person").should('exist');
  });

  it('tab is invisible for not indexed caches', () => {
    cy.login(Cypress.env('username'), Cypress.env('password'), '/cache/default');
    cy.get('[data-cy=detailCacheActions]').click();
    cy.get('[data-cy=manageConfigEditionLink]').click();
    cy.get('[data-cy=nav-item-Indexed]').should('not.exist');
  });
});
