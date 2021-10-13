
describe('Proto Schema CRUD', () => {

  it('successfully creates, edits and deletes a proto schema', () => {
    cy.visit('http://localhost:11222/console/', {
      headers: {
        "Accept-Encoding": "gzip, deflate, br"
      }
    });
    cy.get('a[aria-label="nav-item-Schemas"]').click();
    cy.get('button[aria-label="create-schema-button"]').click();
    cy.get('#schema-name').click().type('people');
    cy.get('#schema').click().type('schemaValue');
    cy.get('button[aria-label="add-schema-button"]').click();
    cy.contains('people.proto');
    cy.contains('Schema people.proto has errors');
    cy.get('button[aria-label="expand-schema-people.proto"]').click({force: true});
    cy.contains('schemaValue');
    cy.contains('Edit');
    cy.get('button[aria-label="edit-button-schema-people.proto"]').click({force: true});
    cy.contains('Save');
    cy.get('textarea').contains('schemaValue').type('schemaNewValue');
    cy.get('button[aria-label="edit-button-schema-people.proto"]').click({force: true});
    cy.contains('schemaNewValue');
    cy.get('button[aria-label="delete-button-schema-people.proto"]').click({force: true});
    cy.contains('Permanently delete schema?');
    cy.get('button[aria-label="confirm-delete-schema-button"]').click();
    cy.contains('No schemas yet');
  });

});

