describe('Empty values test', () => {
  it('successfully shows 0 counters and displays the modal', () => {
    cy.origin('http://localhost:31222/console/', () => {
      cy.visit("/", {
        headers: {
          'Accept-Encoding': 'gzip, deflate, br'
        },
        auth: {
          username: Cypress.env('username'),
          password: Cypress.env('password')
        }
      });
      cy.get('[data-cy=sideBarToggle]').click();
      cy.contains("NYC");
      cy.get('[data-cy="tab-Counters"]').click({multiple: true, force: true});
      cy.contains("No counters");
      cy.contains("Click \"Create a counter\" and configure a counter. You can also create counters from the CLI or remote clients.");
      cy.get('button[data-cy="createCounterButton"]').click();
      cy.get("#create-counter-modal").should('exist');
      cy.get('[aria-label=Cancel]').click();
      cy.get("#create-counter-modal").should('not.exist');
    })
  });

  it('successfully shows 0 schemas and displays the modal', () => {
    cy.origin('http://localhost:31222/console/', () => {
      cy.visit("/", {
        headers: {
          'Accept-Encoding': 'gzip, deflate, br'
        },
        auth: {
          username: Cypress.env('username'),
          password: Cypress.env('password')
        }
      });
      cy.get('[data-cy=sideBarToggle]').click();
      cy.contains("NYC");
      cy.get('[data-cy="tab-Schemas"]').click({multiple: true, force: true});
      cy.contains("No schema");
      cy.contains("Click \"Create a Protobuf schema\" and provide schema.");
      cy.get('button[data-cy="createSchemaButton"]').click();
      cy.get("#create-schema-modal").should('exist');
      cy.get('[data-cy="cancelAddSchemaButton"]').click();
      cy.get("#create-schema-modal").should('not.exist');
    })
  });

});
