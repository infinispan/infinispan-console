describe('Data Container Overview', () => {
 it('successfully loads Data Container Overview', () => {
   cy.visit('http://localhost:11222/console/')
   cy.get('h2').should('contain', 'Server Management Console')
   //cy.get('pf-c-content').find('h1').should('contain','Default')
   /*cy.get('pf-c-nav__list')
     .find('a')
     .should('contain',' Caches')*/
 })
});
