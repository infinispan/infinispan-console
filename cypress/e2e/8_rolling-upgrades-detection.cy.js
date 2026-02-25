describe('Rolling Upgrades', () => {
  it('successfully shows the rolling upgrades detection message in NYC', () => {
    cy.origin('http://localhost:31222/console/', () => {
      cy.visit('/', {
        headers: {
          'Accept-Encoding': 'gzip, deflate, br',
        },
        auth: {
          username: Cypress.env('username'),
          password: Cypress.env('password'),
        },
      });
      cy.get('[data-cy=sideBarToggle]').click();
      cy.contains('NYC');
      cy.contains(
        'Rolling Upgrade in Progress — Some features may be temporarily unavailable',
      );
    });
  });

  it('successfully shows the different server versions NYC, upgrades server and shows upgrade message', () => {
    cy.origin('http://localhost:31222/console/', () => {
      cy.visit('/cluster-membership', {
        headers: {
          'Accept-Encoding': 'gzip, deflate, br',
        },
        auth: {
          username: Cypress.env('username'),
          password: Cypress.env('password'),
        },
      });
      cy.get('[data-cy=sideBarToggle]').click();
      cy.contains('2 members in use');
      cy.contains(
        'Rolling Upgrade in Progress — Some features may be temporarily unavailable',
      );
      cy.contains('16.0.4');
      cy.contains('16.0.6');

      // Restarting the docker container with same version and waiting for 20seconds to server to come up, reloading the page
      cy.exec(
        'bash restart_server_with_latest_version.sh > ~/log.log',
        120000,
      ).then((result) => {
        cy.log(result.stdout);
      }); //waiting for script to finish max for 3 minutes
      cy.wait(20000);
      cy.reload();

      cy.get('[data-cy=sideBarToggle]').click();
      cy.contains('2 members in use');
      cy.contains(
        'Upgrade Complete — Please clear your browser cache and reconnect to see the latest console version.',
      );
      cy.contains('16.0.4').should('not.exist');
      cy.contains('16.0.6');
    });
  });

  it('successfully refreshes the page and checks that upgrade done message is dissappeared', () => {
    cy.origin('http://localhost:31222/console/', () => {
      cy.visit('/', {
        headers: {
          'Accept-Encoding': 'gzip, deflate, br',
        },
        auth: {
          username: Cypress.env('username'),
          password: Cypress.env('password'),
        },
      });
      cy.get('[data-cy=sideBarToggle]').click();
      cy.contains(
        'Upgrade Complete — Please clear your browser cache and reconnect to see the latest console version.',
      ).should('not.exist');
    });
  });
});
