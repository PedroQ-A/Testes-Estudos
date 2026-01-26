///reference types="cypress"/>
import  {  faker  }  from  '@faker-js/faker';

describe('Cadastro Fake', () => {

        beforeEach(() => {
           cy.visit('https://med.volan.app.br/client/login') 
        });

        it('Deve cadastrar com Fake', () => {

            cy.get('[data-cy="acceptCookies"]').click()
            cy.get('[data-cy="txtFieldEmail"]').type(faker.person.fullName())
            cy.get('[data-cy="txtFieldPassword"]').type('123mudar')


        });
    
});