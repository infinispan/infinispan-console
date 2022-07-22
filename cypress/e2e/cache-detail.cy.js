describe('Cache Detail Overview', () => {
  beforeEach(() => {
    cy.login(Cypress.env('username'), Cypress.env('password'), '/cache/people');
  });

  it('successfully loads cache detail', () => {
    cy.contains('people');
    cy.contains('Transactional');
    cy.contains('Distributed');
    cy.contains('Rebalancing is on');

    //Checking that 3 tabs are shown
    cy.contains('Entries');
    cy.contains('Configuration');
    cy.contains('Metrics (Enabled)');
  });

  it('successfully adds new entry', () => {
    //Adding string key/value
    cy.get('[data-cy=addEntryButton]').click();
    cy.get('#cacheName').should('be.disabled');
    cy.get('#key-entry').click().type('stringKey');
    cy.get('#value-entry').click().type('stringValue');
    cy.get('[data-cy=addButton]').click();
    cy.contains('Entry added to cache people.');
    cy.get('.pf-c-alert__action > .pf-c-button').click(); //Closing alert popup.
    cy.contains('stringKey');
    cy.contains('stringValue');

    //Adding Custom key/value
    cy.get('[data-cy=addEntryButton]').click();
    cy.get('#cacheName').should('be.disabled');
    cy.get('#keyContentType').click();
    cy.get('[id="Custom Type"]').click();
    cy.get('#key-entry')
      .click()
      .type('{"_type": "org.infinispan.Person","name": "Elaia","age" : 12}', { parseSpecialCharSequences: false });
    cy.get('#value-entry')
      .click()
      .type('{"_type": "org.infinispan.Person","name": "Elaia","age" : 12}', { parseSpecialCharSequences: false });
    cy.get('[data-cy=addButton]').click();
    cy.contains('Entry added to cache people.');
    cy.get('.pf-c-alert__action > .pf-c-button').click(); //Closing alert popup.
    cy.contains('org.infinispan.Person');

    //Adding int32 key/value
    cy.get('[data-cy=addEntryButton]').click();
    cy.get('#keyContentType').click();
    cy.get('#int32').click();
    cy.get('#key-entry').click().type(2147483648); //Adding greater value than int32 max
    cy.get('#value-entry').click().type('test');
    cy.get('[data-cy=addButton]').click();
    cy.contains('NumberFormatException');
    //Changing to valid number
    cy.get('#key-entry').click().clear().type(2147483647);
    cy.get('#valueContentType').click();
    cy.get('#int32').click();
    cy.get('#value-entry').click().clear().type(-2147483647);
    cy.get('[data-cy=addButton]').click();
    cy.contains('Entry added to cache people.');
    cy.get('.pf-c-alert__action > .pf-c-button').click(); //Closing alert popup.
    cy.contains('2147483647');
    cy.contains('-2147483647');

    //Adding int64 key/value
    cy.get('[data-cy=addEntryButton]').click();
    cy.get('#keyContentType').click();
    cy.get('#int64').click();
    cy.get('#key-entry').click().type(9223372036854775808); //Adding greater value than int64 max
    cy.get('#value-entry').click().type('test');
    cy.get('[data-cy=addButton]').click();
    cy.contains('NumberFormatException');
    //Changing to valid number
    cy.get('#key-entry').click().clear().type('9223372036854775807');
    cy.get('#valueContentType').click();
    cy.get('#int64').click();
    cy.get('#value-entry').click().clear().type('-9223372036854775807');
    cy.get('[data-cy=addButton]').click();
    cy.get('.pf-c-alert__action > .pf-c-button').click(); //Closing alert popup.
    //cy.contains('9223372036854775807'); @TODO Uncomment when ISPN-14062 is fixed.
    //cy.contains('-9223372036854775807');

    //Adding double key/value
    cy.get('[data-cy=addEntryButton]').click();
    cy.get('#cacheName').should('be.disabled');
    cy.get('#keyContentType').click();
    cy.get('#double').click();
    cy.get('#key-entry').click().type(1.7976931348623157e308);
    cy.get('#valueContentType').click();
    cy.get('#double').click();
    cy.get('#value-entry').click().type(1.7976931348623157e308);
    cy.get('[data-cy=addButton]').click();
    cy.contains('Entry added to cache people.');
    cy.get('.pf-c-alert__action > .pf-c-button').click(); //Closing alert popup.
    cy.contains('1.7976931348623157e+308');
    cy.contains('1.7976931348623157e+308');

    //Adding float key/value
    cy.get('[data-cy=addEntryButton]').click();
    cy.get('#cacheName').should('be.disabled');
    cy.get('#keyContentType').click();
    cy.get('#float').click();
    cy.get('#key-entry').click().type(3.402823466e38);
    cy.get('#valueContentType').click();
    cy.get('#float').click();
    cy.get('#value-entry').click().type(3.402823466e-38);
    cy.get('[data-cy=addButton]').click();
    cy.contains('Entry added to cache people.');
    cy.get('.pf-c-alert__action > .pf-c-button').click(); //Closing alert popup.
    //cy.contains('3.402823466e+38'); @TODO Uncomment when ISPN-14062 is fixed.
    //cy.contains('3.402823466e-38');

    //Adding boolean key/value
    cy.get('[data-cy=addEntryButton]').click();
    cy.get('#cacheName').should('be.disabled');
    cy.get('#keyContentType').click();
    cy.get('#bool').click();
    cy.get('#key-entry').click().type('true');
    cy.get('#valueContentType').click();
    cy.get('#bool').click();
    cy.get('#value-entry').click().type('ahoj');
    cy.get('[data-cy=addButton]').click();
    cy.contains('Entry added to cache people.');
    cy.get('.pf-c-alert__action > .pf-c-button').click(); //Closing alert popup.
    cy.contains('true');
    cy.contains('false');

    //Adding bytes key/value
    cy.get('[data-cy=addEntryButton]').click();
    cy.get('#cacheName').should('be.disabled');
    cy.get('#keyContentType').click();
    cy.get('#bytes').click();
    cy.get('#key-entry').click().type('00110010101001011001101110010101');
    cy.get('#valueContentType').click();
    cy.get('#bytes').click();
    cy.get('#value-entry').click().type('10110010101001011001101110010101');
    cy.get('[data-cy=addButton]').click();
    cy.contains('Entry added to cache people.');
    cy.get('.pf-c-alert__action > .pf-c-button').click(); //Closing alert popup.
    cy.contains('00110010101001011001101110010101');
    cy.contains('00110010101001011001101110010101');

    //Adding uint32 key/value @TODO uncomment when ISPN-14093 is fixed.
    //  cy.get('[data-cy=addEntryButton]').click();
    //  cy.get('#cacheName').should('be.disabled');
    //  cy.get('#keyContentType').click();
    //  cy.get('#uint32').click();
    //  cy.get('#key-entry').click().type('4294967295');
    //  cy.get('#valueContentType').click();
    //  cy.get('#uint32').click();
    //  cy.get('#value-entry').click().type('4294967295');
    //  cy.get('[data-cy=addButton]').click();
    //  cy.contains('Entry added to cache people.');
    //  cy.contains('4294967295');
    //  cy.contains('4294967295');

    //Adding uint64 key/value @TODO uncomment when ISPN-14093 is fixed.
    //  cy.get('[data-cy=addEntryButton]').click();
    //  cy.get('#cacheName').should('be.disabled');
    //  cy.get('#keyContentType').click();
    //  cy.get('#uint64').click();
    //  cy.get('#key-entry').click().type('9223372036854775807');
    //  cy.get('#valueContentType').click();
    //  cy.get('#uint364').click();
    //  cy.get('#value-entry').click().type('9223372036854775807');
    //  cy.get('[data-cy=addButton]').click();
    //  cy.contains('Entry added to cache people.');
    //  cy.contains('9223372036854775807');
    //  cy.contains('9223372036854775807');

    //Adding sint32 key/value
    cy.get('[data-cy=addEntryButton]').click();
    cy.get('#keyContentType').click();
    cy.get('#sint32').click();
    cy.get('#key-entry').click().clear().type(2147483647);
    cy.get('#valueContentType').click();
    cy.get('#sint32').click();
    cy.get('#value-entry').click().clear().type(-2147483647);
    cy.get('[data-cy=addButton]').click();
    cy.contains('Entry added to cache people.');
    cy.get('.pf-c-alert__action > .pf-c-button').click(); //Closing alert popup.
    cy.contains('2147483647');
    cy.contains('-2147483647');

    //Adding int64 key/value
    cy.get('[data-cy=addEntryButton]').click();
    cy.get('#keyContentType').click();
    cy.get('#sint64').click();
    cy.get('#key-entry').click().clear().type('9223372036854775807');
    cy.get('#valueContentType').click();
    cy.get('#sint64').click();
    cy.get('#value-entry').click().clear().type('-9223372036854775807');
    cy.get('[data-cy=addButton]').click();
    cy.contains('Entry added to cache people.');
    cy.get('.pf-c-alert__action > .pf-c-button').click(); //Closing alert popup.
    //cy.contains('9223372036854775807'); //@TODO Uncomment when ISPN-14062 is fixed.
    //cy.contains('-9223372036854775807');
  });

  it('successfully searches entries by key', () => {
    cy.get('#textSearchByKey').click().type('stringKey');
    cy.get('[data-cy=search-by-key]').click();
    cy.contains('true').should('not.exist');
    cy.contains('stringKey');
    cy.contains('1 - 1 of 1');

    cy.get('#textSearchByKey').click().clear();
    cy.get('#keyType').click();
    cy.get('#bytes').click();
    cy.get('#textSearchByKey').click().type('00110010101001011001101110010101');
    cy.get('[data-cy=search-by-key]').click();
    cy.contains('stringKey').should('not.exist');
    cy.contains('00110010101001011001101110010101');
    cy.contains('1 - 1 of 1');

    cy.get('#textSearchByKey').click().clear();
    cy.get('#keyType').click();
    cy.get('#sint32').click();
    cy.get('#textSearchByKey').click().type('2147483647');
    cy.get('[data-cy=search-by-key]').click();
    cy.contains('stringKey').should('not.exist');
    cy.contains('2147483647');
    cy.contains('1 - 1 of 1');

    cy.get('#textSearchByKey').click().clear();
    cy.get('#keyType').click();
    cy.get('#int32').click();
    cy.get('#textSearchByKey').click().type('2147483647');
    cy.get('[data-cy=search-by-key]').click();
    cy.contains('stringKey').should('not.exist');
    cy.contains('2147483647');
    cy.contains('1 - 1 of 1');

    cy.get('#textSearchByKey').click().clear();
    cy.get('#keyType').click();
    cy.get('#bool').click();
    cy.get('#textSearchByKey').click().type('true');
    cy.get('[data-cy=search-by-key]').click();
    cy.contains('stringKey').should('not.exist');
    cy.contains('true');
    cy.contains('1 - 1 of 1');

    cy.get('#textSearchByKey').click().clear();
    cy.get('#keyType').click();
    cy.get("[id='Custom Type']").click();
    cy.get('#textSearchByKey')
      .click()
      .type('{"_type": "org.infinispan.Person","name": "Elaia","age" : 12}', { parseSpecialCharSequences: false });
    cy.get('[data-cy=search-by-key]').click();
    cy.contains('true').should('not.exist');
    cy.contains('Elaia');
    cy.contains('1 - 1 of 1');
  });

  it('successfully edits existing entry', () => {
    //Editing boolean entry
    cy.get('[data-cy=actions-true]').click();
    cy.get('[data-cy=editEntryAction]').click();
    cy.get('#valueContentType').click();
    cy.get('#string').click();
    cy.get('#value-entry').click().type('changedValue');
    cy.get('[data-cy=addButton]').click();
    cy.contains('Entry updated in cache people.');
    cy.contains('changedValue');
  });

  it('successfully deletes existing entry', () => {
    //Deleting boolean entry
    cy.get('[data-cy=actions-true]').click();
    cy.get('[data-cy=deleteEntryAction]').click();

    //Cancelling action
    cy.get('[data-cy=cancelDeleteEntry]').click();
    cy.contains('changedValue');

    //Deleting action
    cy.get('[data-cy=actions-true]').click();
    cy.get('[data-cy=deleteEntryAction]').click();
    cy.get('[data-cy=deleteEntryButton]').click();
    cy.contains('Entry true deleted.');
    cy.contains('changedValue').should('not.exist');
  });

  it('successfully clears all entries', () => {
    //Deleting all entries
    cy.get('[data-cy=clearAllButton]').click();
    cy.get('[data-cy=deleteButton]').click();
    cy.contains('The cache is empty');
  });

  it('successfully searches by values', () => {
    //Opening indexed-cache cache page.
    cy.login(Cypress.env('username'), Cypress.env('password'), '/cache/indexed-cache');

    cy.get('[data-cy=queriesTab]').click();
    cy.get('#textSearchByQuery').click().type('from org.infinispan.Person where age>2');
    cy.get('[data-cy=searchButton]').click();
    cy.contains('1 - 1 of 1');
    cy.contains('Elaia');

    cy.get('#textSearchByQuery').click().clear().type("from org.infinispan.Person where name = 'Elaia'");
    cy.get('[data-cy=searchButton]').click();
    cy.contains('1 - 1 of 1');
    cy.contains('Elaia');

    cy.get('#textSearchByQuery').click().clear().type('from org.infinispan.Person where age=2');
    cy.get('[data-cy=searchButton]').click();
    cy.contains('Values not found.');

    cy.get('[data-cy=manageEntriesTab]').click();
    cy.contains('key-9');
  });

  //@TODO uncomment when ISPN-14189 is fixed.
  //  it('successfully manages indexes', () => {
  //   //Opening indexed-cache cache page.
  //   cy.login(Cypress.env("username"), Cypress.env("password"), '/cache/indexed-cache');

  //   cy.get("[data-cy=manageIndexesLink]").click();
  //   cy.contains("org.infinispan.Person");
  //   cy.contains("3 k");
  //   cy.get("[data-cy=backButton]").click();
  //   cy.contains("Elaia");

  //   cy.get("[data-cy=manageIndexesLink]").click();
  //   cy.get("[data-cy=clearIndexButton]").click();
  //   cy.contains("Permanently clear index?");
  //   cy.get("[data-cy=cancelButton]").click();
  //   cy.contains("Permanently clear index?").should("not.exist");

  //   cy.get("[data-cy=clearIndexButton]").click();
  //   cy.get("[data-cy=clearIndex]").click();
  //   cy.contains("Index of cache indexed-cache cleared.");
  //   cy.contains("0");

  //   cy.get("[data-cy=rebuildIndexButton]").click();
  //   cy.contains("Rebuild index?");
  //   cy.get("[data-cy=cancelReindexButton]").click();

  //   cy.get("[data-cy=rebuildIndexButton]").click();
  //   cy.get("[data-cy=reindexButton]").click();
  //   cy.contains("1").should("not.exist");

  //   cy.get("[data-cy=backButton]").click();
  //   cy.contains("Elaia");
  //   cy.get("[data-cy=manageIndexesLink]").click();
  //   cy.contains("3 k");
  //  })

  it('successfully adds new entry with expiration and waits till entry is expired', () => {
    //Adding sint32 key/value
    cy.get('[data-cy=addEntryButton]').click();
    cy.get('#keyContentType').click();
    cy.get('#sint32').click();
    cy.get('#key-entry').click().clear().type(2147483647);
    cy.get('#valueContentType').click();
    cy.get('#sint32').click();
    cy.get('#value-entry').click().clear().type(-2147483647);
    cy.get('#timeToLive').click().type(2);
    cy.get('[data-cy=addButton]').click();
    cy.contains('Entry added to cache people.');
    cy.contains('2147483647');
    cy.contains('-2147483647');

    cy.wait(2000);
    cy.reload();
    cy.contains('2147483647').should('not.exist');
    cy.contains('-2147483647').should('not.exist');
  });
});
