/// <reference types="cypress"/>

import { faker } from '@faker-js/faker';

describe('Login Fake em Prod', () => {

    beforeEach(() => {
        cy.visit('https://med.volan.app.br/client/login')
    });

    it('Deve cadastrar com Fake', () => {
        cy.get('[data-cy="acceptCookies"]').click()
        cy.get('[data-cy="txtFieldEmail"]').type(faker.internet.email())
        cy.get('[data-cy="txtFieldPassword"]').type('123mudar')
    });

});