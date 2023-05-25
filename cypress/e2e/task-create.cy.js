const testTaskScript = `// mode=local,language=javascript,parameters=[greetee]
"Hello " + greetee`

const updatedScript = `// mode=local,language=javascript,parameters=[greetee]
"Good morning " + greetee`

describe('Tasks', () => {
    beforeEach(() => {
        cy.login(Cypress.env('username'), Cypress.env('password'));
    });

    it('successfully navigates through tasks', () => {
        cy.get('a[aria-label="nav-item-Tasks"]').click();
        cy.contains('hello');
    });
    
    it('successfully creates tasks', () => {
        cy.get('a[aria-label="nav-item-Tasks"]').click();
        cy.get('button[aria-label="create-task-button"]').click();
        cy.get('#task-name').click().type('testTask');
        cy.get('.pf-c-code-editor').click().type(testTaskScript)
        cy.get('[data-cy="add-task-button"]').click();
        cy.contains('Task testTask has been created');
        cy.get('.pf-c-alert__action > .pf-c-button').click(); //Closing alert popup.
        cy.contains('testTask');
    });

    it('successfully execute a task', () => {
        cy.get('a[aria-label="nav-item-Tasks"]').click();
        cy.contains('testTask').click();
        cy.get('button[aria-label="expand-task-testTask"]').click({ force: true });
        cy.get('button[aria-label="execute-button-testTask"]').click();
        cy.get('input[aria-label="input-parameter"]').click().type('world');
        cy.get('button[aria-label="Confirm"]').click();
        cy.contains('The script has been successfully executed');
        cy.get('.pf-c-alert__action > .pf-c-button').click(); //Closing alert popup.
    })

    it('successfully update a task', () => {
        cy.get('a[aria-label="nav-item-Tasks"]').click();
        cy.contains('testTask').click();
        cy.get('button[aria-label="expand-task-testTask"]').click({ force: true });
        cy.get('button[aria-label="edit-button-testTask"]').click();
        cy.get('.pf-c-code-editor').type('{selectall}', { timeout: 10000 });
        cy.get('.pf-c-code-editor').click().type(updatedScript);
        cy.get('button[aria-label="edit-button-testTask"]').click();
        cy.contains('Task testTask has been updated');
        cy.get('.pf-c-alert__action > .pf-c-button').click(); //Closing alert popup.
        cy.contains('testTask');
        cy.contains('"Good morning " + greetee');
    })
});
