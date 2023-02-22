describe('Counters CRUD', () => {
    beforeEach(() => {
      cy.login(Cypress.env('username'), Cypress.env('password'));
    });
  
    it('successfully creates weak & volatile counter', () => {
      cy.get('a[aria-label="nav-item-Counters"]').click();
      //Creating new weak counter
      cy.get('button[data-cy="createCounterButton"]').click();
      cy.get("[aria-label=counter-name-input]").type("TestWeakVolatileCounter");
      cy.get("#volatile").click();
      cy.get("#weak").click();
      cy.get("[aria-label=initial-value-input]").focus().type(1);
      cy.get("[aria-label=concurrency-level-input]").focus().type(3);
      cy.get("[aria-label=Create]").click();
      cy.contains("Counter TestWeakVolatileCounter has been created");
    });

    it('successfully shows error while creating counter with duplicate name', () => {
        cy.get('a[aria-label="nav-item-Counters"]').click();
        //Creating new weak counter
        cy.get('button[data-cy="createCounterButton"]').click();
        cy.get("[aria-label=counter-name-input]").type("TestWeakVolatileCounter");
        cy.get("#volatile").click();
        cy.get("#weak").click();
        cy.get("[aria-label=initial-value-input]").focus().type(1);
        cy.get("[aria-label=concurrency-level-input]").focus().type(3);
        cy.get("[aria-label=Create]").click();
        cy.contains("Unexpected error creating counter TestWeakVolatileCounter");
      });

    it('successfully creates weak & persistent counter', () => {
        cy.get('a[aria-label="nav-item-Counters"]').click();
        //Creating new weak counter
        cy.get('button[data-cy="createCounterButton"]').click();
        cy.get("[aria-label=counter-name-input]").type("TestWeakPersistentCounter");
        cy.get("#persistent").click();
        cy.get("#weak").click();
        cy.get("[aria-label=initial-value-input]").focus().type(1);
        cy.get("[aria-label=concurrency-level-input]").focus().type(3);
        cy.get("[aria-label=Create]").click();
        cy.contains("Counter TestWeakPersistentCounter has been created");
      });

    it ('successfully creates strong & persistent counter', () => {
      cy.get('a[aria-label="nav-item-Counters"]').click();
      //Creating new strong counter
      cy.get('button[data-cy="createCounterButton"]').click();
      cy.get("[aria-label=counter-name-input]").type("TestStrongPersistentCounter");
      cy.get("#persistent").click();
      cy.get("#strong").click();
      cy.get("[aria-label=initial-value-input]").focus().type(16);
      cy.get("[aria-label=lower-bound-input]").focus().type(0);
      cy.get("[aria-label=upper-bound-input]").focus().type(100);
      cy.get("[aria-label=Create]").click();
      cy.contains("Counter TestStrongPersistentCounter has been created");
    });

    it ('successfully creates strong & volatile counter', () => {
        cy.get('a[aria-label="nav-item-Counters"]').click();
        //Creating new strong counter
        cy.get('button[data-cy="createCounterButton"]').click();
        cy.get("[aria-label=counter-name-input]").type("TestStrongVolatileCounter");
        cy.get("#volatile").click();
        cy.get("#strong").click();
        cy.get("[aria-label=initial-value-input]").focus().type(16);
        cy.get("[aria-label=lower-bound-input]").focus().type(0);
        cy.get("[aria-label=upper-bound-input]").focus().type(100);
        cy.get("[aria-label=Create]").click();
        cy.contains("Counter TestStrongVolatileCounter has been created");
      });

      it ('successfully adds delta to strong counter', () => {
        cy.get('a[aria-label="nav-item-Counters"]').click();
        cy.contains('strong-5');
        cy.contains('td', 'strong-5').parent()
        .within($tr => {                       
            cy.get('td button').should('exist');
            cy.get('td button').click();
            cy.get('[data-cy=addDeltaAction]').click();
        });
        cy.get("#add-delta-counter-modal").should('exist');
        
        //Writing normal delta value
        cy.get("[data-cy=counterDeltaNum]").clear().type(1);
        cy.get("[data-cy=confirmAddDeltaButton]").click();
        cy.contains("Delta value for counter strong-5 has been set.")
        cy.get("#add-delta-counter-modal").should('not.exist');
        cy.contains('td', 'strong-5').parent()
        .within($tr => {                       
            cy.get('[data-label="Current value"]').contains('4');
        });
      });

      it ('successfully resets strong counter', () => {
        cy.get('a[aria-label="nav-item-Counters"]').click();
        cy.contains('td', 'strong-5').parent()
        .within($tr => {                       
            cy.get('[data-label="Current value"]').contains('4');
        });
        cy.contains('td', 'strong-5').parent()
        .within($tr => {                       
            cy.get('td button').should('exist');
            cy.get('td button').click();
            cy.get('[data-cy=resetCounter]').click();
        });
        
        cy.get("[data-cy=resetCounterButton]").click();
        cy.contains('td', 'strong-5').parent()
        .within($tr => {                       
            cy.get('[data-label="Current value"]').contains('3');
        });
        cy.get("#reset-counter-modal").should('not.exist');
        cy.contains("Counter strong-5 has been reset.")
      });

      it ('successfully deletes weak counter', () => {
        cy.get('a[aria-label="nav-item-Counters"]').click();
        cy.contains('weak-5');
        cy.contains('td', 'weak-5').parent()
        .within($tr => {                       
            cy.get('td button').should('exist');
            cy.get('td button').click();
            cy.get('[data-cy=resetCounter]').should('not.exist');
            cy.get('[data-cy=addDeltaAction]').should('not.exist');
            cy.get('[data-cy=deleteCounter]').click();
        });
        
        cy.get("[data-cy=deleteCounterButton]").click();

        cy.get("#delete-counter-modal").should('not.exist');
        cy.contains("Counter weak-5 has been deleted.");
        cy.get("[aria-label='cache-managers.counters.counters-table-label']").contains("td", "weak-5").should("not.exist");
      });

      it ('successfully deletes strong counter', () => {
        cy.get('a[aria-label="nav-item-Counters"]').click();
        cy.contains('strong-5');
        cy.contains('td', 'strong-5').parent()
        .within($tr => {                       
            cy.get('td button').should('exist');
            cy.get('td button').click();
            cy.get('[data-cy=deleteCounter]').click();
        });
        
        cy.get("[data-cy=deleteCounterButton]").click();

        cy.get("#delete-counter-modal").should('not.exist');
        cy.contains("Counter strong-5 has been deleted.");
        cy.get("[aria-label='cache-managers.counters.counters-table-label']").contains("td", "strong-5").should("not.exist");
      });

      it ('successfully filters counters', () => {
        cy.get('a[aria-label="nav-item-Counters"]').click();
        cy.contains('strong-4');
        cy.contains('weak-4');

        //Selecting only strong counters
        cy.get("#counterFilterSelect").click();
        cy.get("[data-cy='strongCounter']").click();
        cy.get("#counterFilterSelect").click(); //Closing the filter select
        cy.contains("weak-4").should("not.exist");
        cy.contains("PERSISTENT");
        cy.contains("VOLATILE");
        cy.contains("1 - 6 of 6");

        //Selecting only strong and perisitent counters
        cy.get("#counterFilterSelect").click();
        cy.get("[data-cy='persistentCounter']").click();
        cy.get("#counterFilterSelect").click(); //Closing the filter select
        cy.contains("weak-4").should("not.exist");
        cy.contains("PERSISTENT");
        cy.contains("VOLATILE").should('not.exist');
        cy.contains("1 - 5 of 5");

        //Selecting only strong and perisitent counters
        cy.get("#counterFilterSelect").click();
        cy.get("[data-cy='volatileCounter']").click();
        cy.get("#counterFilterSelect").click(); //Closing the filter select
        cy.contains("weak-4").should("not.exist");
        cy.contains("PERSISTENT").should('not.exist');
        cy.contains("VOLATILE");
        cy.contains("1 - 1 of 1");

        //Selecting only weak and volatile counters
        cy.get("#counterFilterSelect").click();
        cy.get("[data-cy='weakCounter']").click();
        cy.get("#counterFilterSelect").click(); //Closing the filter select
        cy.contains("strong-4").should("not.exist");
        cy.contains("weak-4").should("not.exist");
        cy.contains("PERSISTENT").should('not.exist');
        cy.contains("VOLATILE");
        cy.contains("TestWeakVolatileCounter");
        cy.contains("1 - 1 of 1");

        //Selecting only weak and persistent counters
        cy.get("#counterFilterSelect").click();
        cy.get("[data-cy='persistentCounter']").click();
        cy.get("#counterFilterSelect").click(); //Closing the filter select
        cy.contains("strong-4").should("not.exist");
        cy.contains("weak-4");
        cy.contains("PERSISTENT");
        cy.contains("VOLATILE").should('not.exist');
        cy.contains("1 - 5 of 5");

        //Selecting all weak counters
        cy.get("#counterFilterSelect").click();
        cy.get("[data-cy='persistentCounter']").click();
        cy.get("#counterFilterSelect").click(); //Closing the filter select
        cy.contains("strong-4").should("not.exist");
        cy.contains("weak-4");
        cy.contains("PERSISTENT");
        cy.contains("VOLATILE");
        cy.contains("1 - 6 of 6");

        //Selecting all counters
        cy.get("#counterFilterSelect").click();
        cy.get("[data-cy='weakCounter']").click();
        cy.get("#counterFilterSelect").click(); //Closing the filter select
        cy.contains("strong-4");
        cy.contains("weak-4");
        cy.contains("PERSISTENT");
        cy.contains("VOLATILE");
        cy.contains("1 - 10 of 12");
      });
  });