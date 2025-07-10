import { CONF_MUTABLE_EXPIRATION_LIFESPAN, CONF_MUTABLE_EXPIRATION_MAXIDLE } from '../../src/services/cacheConfigUtils';

describe('Cache Expiration', () => {
  const expirationCaches = ['people', 'indexed-cache']; //non-auth and auth caches
  const nonAdminUserNames = ['monitor', 'observer', 'application', 'deployer']; // non admin users

  before(() => {
    // Set people cache expiration disabled
    cy.cleanupTest(Cypress.env('username'), Cypress.env('password'),
      `/caches/people?action=set-mutable-attribute&attribute-name=${CONF_MUTABLE_EXPIRATION_MAXIDLE}&attribute-value=-1`,
      'POST');

    cy.cleanupTest(Cypress.env('username'), Cypress.env('password'),
      `/caches/people?action=set-mutable-attribute&attribute-name=${CONF_MUTABLE_EXPIRATION_LIFESPAN}&attribute-value=-1`,
      'POST');

    // Set indexed-cache cache expiration disabled
    cy.cleanupTest(Cypress.env('username'), Cypress.env('password'),
      `/caches/indexed-cache?action=set-mutable-attribute&attribute-name=${CONF_MUTABLE_EXPIRATION_MAXIDLE}&attribute-value=-1`,
      'POST');
    // Set indexed-cache cache expiration disabled
    cy.cleanupTest(Cypress.env('username'), Cypress.env('password'),
      `/caches/indexed-cache?action=set-mutable-attribute&attribute-name=${CONF_MUTABLE_EXPIRATION_LIFESPAN}&attribute-value=-1`,
      'POST');
  });

  expirationCaches.forEach((cacheName) => {
    it('successfully displays and updates expiration config in cache: ' + cacheName, () => {
      cy.login(Cypress.env('username'), Cypress.env('password'), '/cache/' + cacheName);

      cy.get('[data-cy=detailCacheActions]').click();
      cy.get("[data-cy=manageConfigEditionLink]").click();
      cy.get('[data-cy=expirationSwitch]').should('exist');
      cy.contains('Expiration is disabled');
      cy.get('[data-cy=backButton-expiration]').click();
      cy.contains('Detail of cache ' + cacheName);
      cy.get('[data-cy=detailCacheActions]').click();
      cy.get("[data-cy=manageConfigEditionLink]").click();
      cy.get('[data-cy=expirationSwitch]')
        .wait(500)
        .check({force: true});
      cy.get('[data-cy=lifespan]').clear().type(-2);
      cy.get('[data-cy=maxidle]').clear().type(-2);
      cy.get('[data-cy=saveConfigButton-expiration]').click();
      cy.contains('The minimum value is -1.');
      cy.contains('The minimum value is -1. Must be lower than lifespan');
      cy.get('[data-cy=lifespan]').clear().type(11);
      cy.get('[data-cy=maxidle]').clear().type(12);
      cy.get('[data-cy=saveConfigButton-expiration]').click();
      cy.contains('Maxidle must be lower than lifespan');
      cy.get('[data-cy=toggle-lifespanUnitSelector]').click();
      cy.get('[data-cy=lifespanUnitSelector-option-hours]').click();
      cy.get('[data-cy=toggle-maxidleUnitSelector]').click();
      cy.get('[data-cy=maxidleUnitSelector-option-minutes]').click();
      cy.get('[data-cy=saveConfigButton-expiration]').click();
      cy.get('[data-cy=saveConfigButton-expiration]').click();
      cy.contains(`Updated ${cacheName} cache: expiration.lifespan configured successfully`);
      cy.contains(`Updated ${cacheName} cache: expiration.max-idle configured successfully`);
      cy.get('[data-cy=backButton-expiration]').click();
      cy.get('[data-cy=cacheConfigurationTab]').click();
      cy.contains('"max-idle": "12m"')
      cy.contains('"lifespan": "11h"')
      cy.get('[data-cy=detailCacheActions]').click();
      cy.get("[data-cy=manageConfigEditionLink]").click();
      cy.contains('Expiration is enabled');
      cy.get('[data-cy=lifespan]').should('have.value', '11');
      cy.get('[data-cy=toggle-lifespanUnitSelector]').contains('hours');
      cy.get('[data-cy=maxidle]').should('have.value', '12');
      cy.get('[data-cy=toggle-maxidleUnitSelector]').contains('minutes');
      cy.get('[data-cy=expirationSwitch]').uncheck({force: true});
      cy.get('[data-cy=saveConfigButton-expiration]').click();
      cy.get('[data-cy=backButton-expiration]').click();
      cy.get("[data-cy=cacheConfigurationTab]").click();
      cy.contains('"lifespan": "-1"')
      cy.contains('"max-idle": "-1"')
    });
  })

  nonAdminUserNames.forEach((user) => {
    it('non admins can\' access the page: ' + user, () => {
      cy.login(user, Cypress.env('password'), '/cache/people');
      cy.get('[data-cy=detailCacheActions]').click();
      cy.get('[data-cy=manageConfigEditionLink]').should('not.exist');
    });
  });
});
