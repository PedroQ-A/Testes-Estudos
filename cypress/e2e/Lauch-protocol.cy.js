/// <reference types="cypress"/>

describe('Lançamento de protooclo', () => {

    before(() => {
        cy.visit('https://volandevjw--victor-deserto-issues-vdesertov-volan-719-ud3njbgd.web.app/client/login')
    });

    it('Lançamento de protocolo', () => {
        cy.get('.v-snack__action').click()
        cy.get('[data-cy="txtFieldEmail"]').type('pedro@admin.volan.app.br')
        cy.get('[data-cy="txtFieldPassword"]').type('Ped0118')
        cy.get('.Login_buttonBox__tK6r > .col > .v-btn').click()
        cy.get('.v-app-bar__nav-icon').click()
        cy.get('.majorBtn').click()
        cy.get('.v-input__slot').type('coopera')
        cy.get(':nth-child(2) > [data-fcm="30"] > div > .volanGreenColor > .v-btn__content > .v-icon').click()
        cy.get('.v-app-bar__nav-icon > .v-btn__content').click()
        cy.get('[href="/client/Protocols"]').click()
        cy.get('.FcmSearchTextField_firstLine_m2rah > .v-btn > .v-btn__content').click()
        cy.get('.col-md-10 > .v-input').type('Teste')
        cy.get(':nth-child(4) > [data-cy] > .FcmListDialog_bodyExternal_P8Vx8').click()
        cy.get(':nth-child(3) > td').click()
        cy.get(':nth-child(5) > [data-cy] > .FcmListDialog_bodyExternal_P8Vx8').click()
        cy.get('tbody > :nth-child(2) > :nth-child(2)').click()
        cy.get(':nth-child(6) > [data-cy] > .FcmListDialog_bodyExternal_P8Vx8').click()
        cy.get('tbody > :nth-child(4) > :nth-child(2)').click()
        cy.get(':nth-child(7) > .v-input').type('100')
        cy.get('.v-btn.ml-2 > .v-btn__content > .text-button').click()
    });
});