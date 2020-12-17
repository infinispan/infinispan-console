
describe('Data Container Overview', () => {

//Data Container Overview
 it('successfully loads Data Container Overview', () => {
   cy.visit('http://localhost:11222/console/', {
            headers: {
                    "Accept-Encoding": "gzip, deflate, br"
                     }
   });
   cy.get('h2').should('contain', 'Server Management Console');
   cy.get('p').should('contain', 'Running');

   //configuration templates
   cy.get('.pf-c-toolbar__item .pf-m-link').click();
   cy.get('.pf-c-expandable-section__toggle').should('contain','org.infinispan.LOCAL');
 })

//Data Container create cache page
 it('successfully loads Data Container create cache page', () => {
    cy.visit('http://localhost:11222/console/', {
             headers: {
                     "Accept-Encoding": "gzip, deflate, br"
                      }
    });
    //create cache
    cy.get('a > .pf-m-primary').click();
    cy.get('#cache-name').click();
    cy.get('#cache-name').type('local');
    cy.get('.pf-c-select__toggle-arrow').click();
    cy.get('.pf-c-select__menu-item').should('contain','org.infinispan.LOCAL');
    cy.contains('org.infinispan.LOCAL').parent().find('button').click();
    cy.get('.pf-c-form__actions > .pf-c-button').click();
    //back to main page
    cy.visit('http://localhost:11222/console/', {
    headers: {
              "Accept-Encoding": "gzip, deflate, br"
             }
    });
 })

//Delete created cache
it('Delete created cache', () => {
    cy.visit('http://localhost:11222/console/', {
            headers: {
                    "Accept-Encoding": "gzip, deflate, br"
                     }
    });
   /*cy.get('.pf-dropdown-toggle-id-4916').click();
   cy.get('li:nth-child(2) > .pf-c-dropdown__menu-item').click();
   cy.get('#cache-to-delete').click();
   cy.get('#cache-to-delete').type('local');
   cy.get('.pf-m-danger').click();
 */
 })

// Displays 3 tabs: Caches, Counters, Tasks
 it('Displays 3 tabs: Caches, Counters, Tasks', () => {
    //make sure there are total 4 tabs (0,1,2,3)
    cy.get('.pf-c-nav__list').find('>li').eq(3);
    //counters
    cy.get('.pf-c-nav__list:nth-child(2) > .pf-c-nav__item:nth-child(2) > .pf-c-nav__link').click();
    cy.get('#filter-counter-menu-toggle').click();
    //Tasks
    cy.get('.pf-c-nav__list:nth-child(2) > .pf-c-nav__item:nth-child(3) > .pf-c-nav__link').click();
    //protobuf schemas
    cy.get('.pf-c-nav__list:nth-child(2) > .pf-c-nav__item:nth-child(4) > .pf-c-nav__link').click();
    cy.get('.pf-c-toolbar__item > .pf-c-button').click();
    cy.get('.pf-m-link').click();
 })

});

