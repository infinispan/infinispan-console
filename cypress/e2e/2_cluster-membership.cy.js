describe('Cluster Membership', () => {
  beforeEach(() => {
    cy.login(Cypress.env('username'), Cypress.env('password'), '/cluster-membership');
  });

  it('successfully loads Cluster Membership', () => {
    cy.get('h1').should('contain', 'Cluster membership');
    cy.contains('1 member in use');
    cy.contains('Running');
    cy.contains('Name');
    cy.contains('Status');
    cy.contains('Physical address');
    cy.contains('Version');
    cy.contains('16.0');
    cy.get('[data-cy="downloadReportLink"]').should('exist');
    //@TODO Uncomment and fix this part after ISPN-16672 is fixed
    // cy.get('[data-cy="downloadReportLink"]').click();
    // cy.wait(5000);
    // let downloadedFile = cy.readFile('./cypress/downloads/downloadedFileName');
    // downloadedFile.should('exist');
    // downloadedFile.its('distributed-cache.mode').should('eq', 'SYNC');
  });
});
