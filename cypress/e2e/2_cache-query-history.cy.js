describe('Query History', () => {
  const username = Cypress.env('username');
  const password = Cypress.env('password');

  before(() => {
    // Ensure test data exists
    cy.cleanupTest(username, password, '/caches/indexed-cache/query-history-test', 'DELETE');
    const payload = '{"_type": "org.infinispan.Person", "name": "HistoryTest", "age": "25", "city": "Madrid"}';
    cy.cleanupTest(username, password, '/caches/indexed-cache/query-history-test', 'POST', payload);
  });

  beforeEach(() => {
    cy.login(username, password, '/cache/indexed-cache');
    // Clear localStorage after login to ensure we're on the correct origin
    cy.window().then((win) => {
      win.localStorage.removeItem('cache-query-history');
    });
  });

  it('successfully records a search query in history', () => {
    // Navigate to queries tab and execute a search
    cy.get('[data-cy=manageEntriesTab]').click();
    cy.get('[data-cy=queriesTab]').click();
    cy.typeInMonacoEditor('#textSearchByQuery', 'from org.infinispan.Person where age > 2');
    cy.get('[data-cy=searchButton]').click();
    cy.contains('Elaia');

    // Navigate to query history tab
    cy.get('[data-cy=queryHistoryTab]').click();

    // Verify the query appears in the history table
    cy.get('[data-cy=queryHistoryTable]').should('exist');
    cy.contains('from org.infinispan.Person where age > 2');
    cy.contains('Search');
  });

  it('successfully records a delete query in history', () => {
    // Navigate to queries tab and execute a delete query
    cy.get('[data-cy=manageEntriesTab]').click();
    cy.get('[data-cy=queriesTab]').click();
    cy.typeInMonacoEditor('#textSearchByQuery', "delete from org.infinispan.Person where name = 'HistoryTest'");
    cy.get('[data-cy=deleteByQueryButton]').click();
    cy.get('[data-cy=deleteButton]').click();

    // Navigate to query history tab
    cy.get('[data-cy=queryHistoryTab]').click();

    // Verify the delete query appears in history with Delete type label
    cy.get('[data-cy=queryHistoryTable]').should('exist');
    cy.contains('delete from org.infinispan.Person');
    cy.contains('Delete');

    // Re-create test data for subsequent tests
    cy.cleanupTest(username, password, '/caches/indexed-cache/query-history-test', 'DELETE');
    const payload = '{"_type": "org.infinispan.Person", "name": "HistoryTest", "age": "25", "city": "Madrid"}';
    cy.cleanupTest(username, password, '/caches/indexed-cache/query-history-test', 'POST', payload);
  });

  it('successfully deletes a single history item', () => {
    // First, create a history entry by running a query
    cy.get('[data-cy=manageEntriesTab]').click();
    cy.get('[data-cy=queriesTab]').click();
    cy.typeInMonacoEditor('#textSearchByQuery', 'from org.infinispan.Person where age > 2');
    cy.get('[data-cy=searchButton]').click();
    cy.contains('Elaia');

    // Navigate to query history tab
    cy.get('[data-cy=queryHistoryTab]').click();
    cy.get('[data-cy=queryHistoryTable]').should('exist');
    cy.contains('from org.infinispan.Person where age > 2');

    // Open actions menu on the first row and click delete
    cy.get('[data-cy=actions-0]').find('button').click();
    cy.contains('button', 'Delete').click();

    // Verify the query is removed from history
    cy.contains('from org.infinispan.Person where age > 2').should('not.exist');
  });

  it('successfully clears all query history', () => {
    // Create history entries by running queries
    cy.get('[data-cy=manageEntriesTab]').click();
    cy.get('[data-cy=queriesTab]').click();
    cy.typeInMonacoEditor('#textSearchByQuery', 'from org.infinispan.Person where age > 2');
    cy.get('[data-cy=searchButton]').click();
    cy.contains('Elaia');

    cy.clearAndTypeInMonacoEditor('#textSearchByQuery', 'from org.infinispan.Person where age > 10');
    cy.get('[data-cy=searchButton]').click();

    // Navigate to query history tab
    cy.get('[data-cy=queryHistoryTab]').click();
    cy.get('[data-cy=queryHistoryTable]').should('exist');

    // Click clear all button
    cy.get('[data-cy=removeAllQueryHistory]').click();

    // Verify all history is cleared
    cy.contains('from org.infinispan.Person where age > 2').should('not.exist');
    cy.contains('from org.infinispan.Person where age > 10').should('not.exist');
  });

  it('successfully executes a query from history', () => {
    // Create a history entry
    cy.get('[data-cy=manageEntriesTab]').click();
    cy.get('[data-cy=queriesTab]').click();
    cy.typeInMonacoEditor('#textSearchByQuery', 'from org.infinispan.Person where age > 2');
    cy.get('[data-cy=searchButton]').click();
    cy.contains('Elaia');

    // Navigate to query history tab
    cy.get('[data-cy=queryHistoryTab]').click();
    cy.get('[data-cy=queryHistoryTable]').should('exist');

    // Execute the query from history
    cy.get('[data-cy=actions-0]').find('button').click();
    cy.contains('button', 'Execute').click();

    // Verify we are back on the queries tab
    cy.get('[data-cy=queriesTab]').should('have.attr', 'aria-selected', 'true');
  });

  it('successfully records an error query in history', () => {
    // Execute a query with an invalid type
    cy.get('[data-cy=manageEntriesTab]').click();
    cy.get('[data-cy=queriesTab]').click();
    cy.typeInMonacoEditor('#textSearchByQuery', 'from com.NonExistent');
    cy.get('[data-cy=searchButton]').click();

    // Wait for the error response
    cy.contains('Query error');

    // Navigate to query history tab
    cy.get('[data-cy=queryHistoryTab]').click();
    cy.get('[data-cy=queryHistoryTable]').should('exist');

    // Verify the error query is shown with Error label
    cy.contains('from com.NonExistent');
    cy.contains('Error');
  });

  after(() => {
    cy.cleanupTest(username, password, '/caches/indexed-cache/query-history-test', 'DELETE');
  });
});
