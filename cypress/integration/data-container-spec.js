
describe('Data Container Overview', () => {

//Data Container Overview
 it('successfully loads Data Container Overview', () => {
   cy.visit('http://localhost:11222/console/', {
     headers: {
       "Accept-Encoding": "gzip, deflate, br"
     }
   });
   cy.contains('Server Management Console'); // header
   cy.contains('Default'); // cluster name
   cy.contains('Running'); // cluster status
   cy.contains('Rebalancing is on'); // rebalancing status
   cy.contains('default'); // cache default
   cy.contains('people'); // cache people
 })

//Data Container create cache page
 it('successfully creates with a template', () => {
    cy.visit('http://localhost:11222/console/', {
             headers: {
                     "Accept-Encoding": "gzip, deflate, br"
                      }
    });
    //go to create cache page
    cy.get('button[aria-label="create-cache-button"]').click();
    cy.get('#cache-name').click();
    cy.get('#cache-name').type('a-cache');
    cy.get('.pf-c-select__toggle-arrow').click();
    cy.contains('e2e-test-template').parent().find('button').click();
    cy.get('.pf-c-form__actions > .pf-c-button').click();
    // Once the cache created, redirection to main page is done and the cache should be visible
    cy.contains('a-cache');

 })

//Delete created cache
// it('successfully deletes a cache', () => {
//     cy.visit('http://localhost:11222/console/', {
//             headers: {
//                     "Accept-Encoding": "gzip, deflate, br"
//                      }
//     });
//    // cy.get('.pf-dropdown-toggle-id-11').click();
//    // cy.get('li:nth-child(2) > .pf-c-dropdown__menu-item').click();
//    // cy.get('#cache-to-delete').click();
//    // cy.get('#cache-to-delete').type('local');
//    // cy.get('.pf-m-danger').click();
//  })

// Displays 3 tabs: Caches, Counters, Tasks
 it('Displays 4 tabs: Caches, Counters, Tasks, Schemas', () => {
   //make sure there are total 4 tabs (0,1,2,3)
   cy.get('a[aria-label="nav-item-Caches"]').click();
   cy.get('a[aria-label="nav-item-Tasks"]').click();
   cy.get('a[aria-label="nav-item-Counters"]').click();
   cy.get('a[aria-label="nav-item-Schemas"]').click();
 })

});

