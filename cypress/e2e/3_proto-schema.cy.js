describe('Proto Schema CRUD', () => {
  const schemaName = 'aTestSchema';
  beforeEach(() => {
    // Make sure aTestSchema schema does not exist
    cy.cleanupTest(Cypress.env('username'), Cypress.env('password'),
      '/schemas/' + schemaName + '.proto');
    cy.wait(1000);
    cy.login(Cypress.env('username'), Cypress.env('password'));
  });

  function clickTabSchemas() {
    cy.get('[data-cy="tab-Schemas"]').click({multiple: true, force: true});
  }

  it('successfully navigates through schemas', () => {
    clickTabSchemas();
    cy.contains('people');
    cy.contains('test-6.proto');
    cy.contains('test-10.proto');
    cy.contains('test-7.proto').should('not.exist');
    //Going to the next page
    cy.get('[data-cy=paginationArea]').should('exist');
    cy.get('[data-action=previous]').should('be.disabled');
    cy.get('[data-action=next]').first().click();
    cy.contains('test-7.proto');
    cy.contains('test-6.proto').should('not.exist');
    cy.contains('test-10.proto').should('not.exist');

    //Going to the previous page
    cy.get('[data-cy=paginationArea]').should('exist');
    cy.get('[data-action=next]').should('be.disabled');
    cy.get('[data-action=previous]').first().click();
    cy.contains('test-9.proto').should('not.exist');
    cy.contains('test-6.proto');
    cy.contains('test-10.proto');

    //Changing the number of items on the page
    cy.get('[id^="pagination-schemas-top-toggle"]').first().click();
    cy.get('[data-action=per-page-20]').click();
    cy.get('#primary-app-container').scrollTo('bottom');
    cy.contains('test-8.proto');
    cy.contains('test-7.proto');
    cy.contains('test-10.proto');
    cy.get('[data-action=next]').should('be.disabled');

    //Changing the number of items on the page back to 10
    cy.get('#primary-app-container').scrollTo('bottom');
    cy.get('[id^="pagination-schemas-top-toggle"]').first().click();
    cy.get('[data-action=per-page-10]').click();
    cy.contains('test-7.proto').should('not.exist');
    cy.contains('test-6.proto');
    cy.contains('test-10.proto');
    cy.get('[data-action=next]').first().click();
    cy.contains('test-9.proto');
  });

  it('successfully creates, edits and deletes a proto schema', () => {
    cy.wait(2000); // wait for the delete to be done
    clickTabSchemas();

    //Creating new schema
    cy.get('button[aria-label="create-schema-button"]').click();
    cy.get('#schema-name').click().type(schemaName);
    cy.typeInMonacoEditor('#create-schema-modal', 'schemaValue');
    cy.get('[data-cy="addSchemaButton"]').click();
    cy.contains('Schema ' + schemaName + ' created.');
    cy.get('[name=close-alert-button]').click(); //Closing alert popup.
    cy.contains(schemaName + '.proto');
    cy.contains('Schema ' + schemaName + '.proto has errors');

    // Verify schema name is a link to the edit page
    cy.get('[data-cy=schemaTable]').contains(schemaName + '.proto').click();
    cy.url().should('include', '/schemas/' + schemaName + '.proto');
    // Verify the edit page loads with editor and buttons
    cy.get('#schema-editor .view-lines', {timeout: 15000}).should('exist');
    cy.get('#schema-editor').should('contain.text', 'schemaValue');
    cy.get('button[aria-label="save-schema-button"]').should('exist');
    cy.get('button[aria-label="cancel-edit-schema-button"]').should('exist');

    // Update schema via REST API
    cy.request({
      method: 'PUT',
      url: 'http://localhost:11222/rest/v2/schemas/' + schemaName + '.proto',
      auth: {
        username: Cypress.env('username'),
        password: Cypress.env('password')
      },
      body: 'package org.infinispan; message ExampleProto { optional int32 other_id = 1; }',
      headers: { 'Content-Type': 'text/plain' }
    });
    cy.wait(1000);

    // Navigate back to schemas list
    cy.get('button[aria-label="cancel-edit-schema-button"]').click();
    cy.url().should('include', '/schemas');
    cy.get('[data-cy=schemaTable]', {timeout: 10000}).should('exist');
    cy.contains(schemaName + '.proto');
    cy.contains('Schema ' + schemaName + '.proto has errors').should('not.exist');

    //Deleting schema
    cy.get('[data-cy="actions-' + schemaName + '.proto"]>button').click();
    cy.get('[aria-label="deleteSchemaAction"]').click();
    cy.contains('Delete schema?');
    cy.get('button[aria-label="confirm-delete-schema-button"]').click();
    cy.contains('Schema ' + schemaName + '.proto has been deleted.');
    cy.get('[name=close-alert-button]').click(); //Closing alert popup.
    cy.contains('people.proto');
    cy.get('button[aria-label="create-schema-button"]').scrollIntoView();
    cy.contains(schemaName + '.proto').should('not.exist');
  });

  it('gives error if duplicate name is used while creating new schema', () => {
    clickTabSchemas();
    cy.get('button[aria-label="create-schema-button"]').click();
    cy.get('#schema-name').click().type('people');
    cy.typeInMonacoEditor('#create-schema-modal', 'schemaValue');
    cy.get('[data-cy="addSchemaButton"]').click();
    cy.contains('Unexpected error creating schema people');
    cy.get('[data-cy="cancelAddSchemaButton"]').click();
  });

  it('gives error if special symbols are used in the name field', () => {
    clickTabSchemas();
    cy.get('button[aria-label="create-schema-button"]').click();
    cy.get('#schema-name').click().type('1234567890+-*/name!@#$with%^&*special()_+symbols{}|":isnot?><saved>');
    cy.typeInMonacoEditor('#create-schema-modal', '1234567890+-*/value!@#$with%^&*special()_+symbols{}|":is?><saved>');
    cy.get('[data-cy="addSchemaButton"]').click();
    cy.contains('1234567890+-');
    cy.contains('*/name!@#$with%^&*special()_+symbols{}|":isnot?');
    cy.contains('><saved>.proto')
    //Deleting schema
    cy.get('[data-cy^="actions-1234567890+-"]>button').click();
    cy.get('[aria-label="deleteSchemaAction"]').click();
    cy.contains('Delete schema?');
    cy.get('button[aria-label="confirm-delete-schema-button"]').click();
    cy.contains('has been deleted.');
  });
});
