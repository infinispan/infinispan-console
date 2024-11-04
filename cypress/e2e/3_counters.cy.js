describe('Counters CRUD', () => {
    beforeEach(() => {
      cy.login(Cypress.env('username'), Cypress.env('password'));
    });

    function clickTabCounters() {
      cy.get('[data-cy="tab-Counters"]').click({multiple: true, force: true});
    }

    it ('successfully adds delta to strong counter', () => {
      // Makes sure strong-5 has value 3
      cy.cleanupTest(Cypress.env('username'), Cypress.env('password'),
        '/counters/strong-5?action=getAndSet&value=3', 'POST');

      clickTabCounters()
      cy.contains('strong-5');
      cy.get("[data-cy=actions-strong-5").click();
      cy.get('[aria-label=addDeltaAction]').click();
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
      // Makes sure strong-5 has value 4
      cy.cleanupTest(Cypress.env('username'), Cypress.env('password'),
        '/counters/strong-5?action=getAndSet&value=4', 'POST');

      clickTabCounters()
      cy.contains('td', 'strong-5').parent()
        .within($tr => {
          cy.get('[data-label="Current value"]').contains('4');
        });
      cy.get("[data-cy=actions-strong-5").click();
      cy.get('[aria-label=resetCounter]').click();

      cy.get("[data-cy=resetCounterButton]").click();
      cy.contains('td', 'strong-5').parent()
        .within($tr => {
          cy.get('[data-label="Current value"]').contains('3');
        });
      cy.get("#reset-counter-modal").should('not.exist');
      cy.contains("Counter strong-5 has been reset.")
    });

    it('successfully creates weak & volatile counter', () => {
      // Make sure TestWeakVolatileCounter does not exist
      cy.cleanupTest(Cypress.env('username'), Cypress.env('password'),
        '/counters/TestWeakVolatileCounter');

      clickTabCounters()
      //Creating new weak counter
      cy.get('button[data-cy="createCounterButton"]').click();
      cy.get("[aria-label=counter-name-input]").type("TestWeakVolatileCounter");
      cy.get("#volatile").click();
      cy.get("#weak").click();
      cy.get("[aria-label=initial-value-input]").focus().type(1);
      cy.get("[aria-label=concurrency-level-input]").focus().type(3);
      cy.get("[aria-label=Create]").click();
      cy.contains("Counter TestWeakVolatileCounter has been created");
      // Shows error while creating counter with duplicate name
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
        // Make sure TestWeakPersistentCounter does not exist
        cy.cleanupTest(Cypress.env('username'), Cypress.env('password'),
        '/counters/TestWeakPersistentCounter');
        clickTabCounters()
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
      // Make sure TestStrongPersistentCounter does not exist
      cy.cleanupTest(Cypress.env('username'), Cypress.env('password'),
        '/counters/TestStrongPersistentCounter');

      clickTabCounters()
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
        // Make sure TestStrongVolatileCounter does not exist
        cy.cleanupTest(Cypress.env('username'), Cypress.env('password'),
          '/counters/TestStrongVolatileCounter');
        clickTabCounters()
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

      it ('successfully deletes weak counter', () => {
        // Make sure to delete and create 'weak-counter-for-delete'
        cy.cleanupTest(Cypress.env('username'), Cypress.env('password'),
          '/counters/weak-counter-for-delete');
        const weakCounter = {
          'weak-counter' : {
            'storage': 'PERSISTENT'
          }
        }
        cy.cleanupTest(Cypress.env('username'), Cypress.env('password'),
          '/counters/weak-counter-for-delete', 'POST', weakCounter, true);

        cy.login(Cypress.env('username'), Cypress.env('password'));
        clickTabCounters()
        cy.contains('weak-counter-for-delete');
        cy.get("[data-cy=actions-weak-counter-for-delete").click();
        cy.get('[aria-label=resetCounter]').should('not.exist');
        cy.get('[aria-label=addDeltaAction]').should('not.exist');
        cy.get('[aria-label=deleteCounter]').click();
        cy.get("[data-cy=deleteCounterButton]").click();
        cy.get("#delete-counter-modal").should('not.exist');
        cy.contains("Counter weak-counter-for-delete has been deleted.");
        cy.get('[name=close-alert-button]').click(); //Closing alert popup.
        // make sure we reload all. sometimes delete happens after retrieve
        cy.login(Cypress.env('username'), Cypress.env('password'));
        clickTabCounters()
        cy.get("[data-cy=counter-search]").type('weak-counter-for-delete')
        cy.contains('No result found');
      });

      it ('successfully deletes strong counter', () => {
        // Make sure to delete and create 'strong-counter-for-delete'
        cy.cleanupTest(Cypress.env('username'), Cypress.env('password'),
          '/counters/strong-counter-for-delete');
        const strongCounter = {
          'strong-counter' : {
            'storage': 'PERSISTENT'
          }
        }
        cy.cleanupTest(Cypress.env('username'), Cypress.env('password'),
          '/counters/strong-counter-for-delete', 'POST', strongCounter, true);
        cy.login(Cypress.env('username'), Cypress.env('password'));
        clickTabCounters()
        cy.contains('strong-counter-for-delete');
        cy.get("[data-cy=actions-strong-counter-for-delete").click();
        cy.get('[aria-label=deleteCounter]').click();
        cy.get("[data-cy=deleteCounterButton]").click();
        cy.get("#delete-counter-modal").should('not.exist');
        cy.contains("Counter strong-counter-for-delete has been deleted.");
        cy.get('[name=close-alert-button]').click(); //Closing alert popup.
        // make sure we reload all. sometimes delete happens after retrieve
        cy.login(Cypress.env('username'), Cypress.env('password'));
        clickTabCounters()
        cy.get("[data-cy=counter-search]").type('strong-counter-for-delete')
        cy.contains('No result found');
      });


      it ('successfully filters counters', () => {
        clickTabCounters()
        cy.get('[id^="pagination-counters-top-toggle"]').first().click();
        cy.get('[data-action=per-page-20]').click();
        cy.contains('strong-4');
        cy.contains('weak-4');

        //Selecting only strong counters
        cy.get("#toggle-counterTypeFilter").click();
        cy.get('#option-STRONG_COUNTER').click();
        cy.contains("weak-4").should("not.exist");
        cy.get("#toggle-counterTypeFilter").click();
        cy.get('#option-counterTypeFilterClear').click();
        cy.contains("weak-4");
        //Selecting only weak counters
        cy.get("#toggle-counterTypeFilter").click();
        cy.get('#option-WEAK_COUNTER').click();
        cy.contains("strong-4").should("not.exist");
        cy.get("#toggle-counterTypeFilter").click();
        cy.get('#option-counterTypeFilterClear').click();
        cy.contains("strong-4");
        //Selecting only Volatile counters
        cy.contains("Persistent");
        cy.get("#toggle-counterStorageFilter").click();
        cy.get('#option-VOLATILE').click();
        cy.contains("Persistent").should("not.exist");
        // TODO add more
      });

      it ('successfully sets value to strong counter', () => {
        clickTabCounters()
        cy.contains('strong-4');
        cy.get("[data-cy=actions-strong-4").click();
        cy.get('[aria-label=setCounterAction]').click();
        cy.get("#set-counter-modal").should('exist');

        //Writing normal value to set counter
        cy.get("[data-cy=counterSetNum]").clear().type(4);
        cy.get("[data-cy=confirmSetbutton]").click();
        cy.contains("Counter strong-4 has been set to value 4")
        cy.get("#set-counter-modal").should('not.exist');
        cy.contains('td', 'strong-4').parent()
        .within($tr => {
            cy.get('[data-label="Current value"]').contains('4');
        });
      });

      it('successfully shows error while setting value to strong counter with value out of bounds', () => {
        clickTabCounters()
        cy.contains('TestStrongPersistentCounter');
        cy.get("[data-cy=actions-TestStrongPersistentCounter").click();
        cy.get('[aria-label=setCounterAction]').click();
        cy.get("#set-counter-modal").should('exist');

        //Writing value out of upper bound to set counter
        cy.get("[data-cy=counterSetNum]").clear().type(101);
        cy.contains("The counter value must be between the lower bound and the upper bound inclusively");

        //Writing normal value to set counter
        cy.get("[data-cy=counterSetNum]").clear().type(3);
        cy.contains("The counter value must be between the lower bound and the upper bound inclusively").should('not.exist');

        //Writing value out of lower bound to set counter
        cy.get("[data-cy=counterSetNum]").clear().type(-1);
        cy.contains("The counter value must be between the lower bound and the upper bound inclusively");

        cy.get("[data-cy=cancelSetButton]").click();
        cy.get("#set-counter-modal").should('not.exist');
        cy.contains('td', 'TestStrongPersistentCounter').parent()
        .within($tr => {
            cy.get('[data-label="Current value"]').contains('16');
        });
      })
  });
