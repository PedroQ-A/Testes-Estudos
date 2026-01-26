/// <reference types="cypress"/>

describe('Teste de lançamento de evento', () => {

    before(() => {
        cy.visit('https://med.volan.app.br/client/login')
    });

    it('Lançamento de evento em Prod', () => {
        cy.get('[data-cy="acceptCookies"]').click()
        cy.get('[data-cy="txtFieldEmail"]').type('pedrolucas0130@admin.volan.app.br')
        cy.get('[data-cy="txtFieldPassword"]').type('Ped0118')
        cy.get('.Login_buttonBox__tK6r').click()
        cy.get('.v-app-bar__nav-icon').click()
        cy.get('.majorBtn > .v-btn__content').click()
        cy.get('.MainLayoutBase_imgAppbar_v6gUn').should('exist')
        cy.get('[data-cy="FcmSearchTextField"] input').type('t.a') 
        cy.get('[data-cy="FcmList_SY9CCOYSz0VgertGaf7C"] > [data-fcm="30"]').click()
    });
});