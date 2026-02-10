/// <reference types="cypress"/>

import { generate } from 'cpf'

describe('Lançamento de protocolo', () => {

    beforeEach(() => {
        cy.visit('https://volandevjw--victor-deserto-issues-vdesertov-volan-719-ud3njbgd.web.app/client/login')
        cy.get('.v-snack__action').click()
        cy.get('[data-cy="txtFieldEmail"]').type('pedro@admin.volan.app.br')
        cy.get('[data-cy="txtFieldPassword"]').type('Ped0118')
        cy.get('.Login_buttonBox__tK6r > .col > .v-btn').click()
        cy.get('.v-app-bar__nav-icon').click()
    });

    it('Fluxo de lançamento de protocolo', () => {
        const numeroAleatorio = Cypress._.random(100, 9999)

        cy.get('.majorBtn').click()
        cy.get('.v-input__slot', { timeout: 5000 }).type('teste de cooperativa')
        cy.get(':nth-child(2) > [data-fcm="30"] > div > .volanGreenColor > .v-btn__content > .v-icon').click()
        cy.get('.v-app-bar__nav-icon > .v-btn__content').click()
        cy.get('[href="/client/Protocols"]').click()
        cy.get('.FcmSearchTextField_firstLine_m2rah > .v-btn > .v-btn__content').click()
        cy.get('.col-md-10 > .v-input', { timeout: 3000 }).type('Teste')
        cy.get(':nth-child(4) > [data-cy] > .FcmListDialog_bodyExternal_P8Vx8').click()
        cy.get(':nth-child(3) > td').click()
        cy.get(':nth-child(5) > [data-cy] > .FcmListDialog_bodyExternal_P8Vx8').click()
        cy.get('tbody > :nth-child(2) > :nth-child(2)').click()
        cy.get(':nth-child(6) > [data-cy] > .FcmListDialog_bodyExternal_P8Vx8').click()
        cy.get('tbody > :nth-child(4) > :nth-child(2)').click()
        cy.get(':nth-child(7) > .v-input').type(numeroAleatorio)
        cy.get('.v-btn.ml-2 > .v-btn__content > .text-button').click()
    });

it('Validação de protocolo criado', () => {
    const cpfValido = generate()

    cy.get('.majorBtn').click()
    cy.get('.v-input__slot', {timeout: 5000}).type('teste de cooperativa')
    cy.get(':nth-child(2) > [data-fcm="30"] > div > .volanGreenColor > .v-btn__content > .v-icon').click()
    cy.get('.v-app-bar__nav-icon > .v-btn__content').click()
    cy.get('[href="/client/events?add=1&type=Honorario"]').click()
    cy.wait(6000)
    cy.get('#buttonPreEvent', {timeout: 10000}).should('exist')
    cy.get('#buttonPreEvent > .v-btn__content > .v-icon').click({force: true})
    cy.get('.align-center > .v-input').type('36')
    cy.get(':nth-child(2) > .align-center > .v-btn').click()
    cy.get('.jwCursorPointer > :nth-child(7)').click()
    cy.get('#txtFieldPatientCPF').type(cpfValido)
    cy.get(':nth-child(6) > form > .v-input').type('01012000')
    cy.get('.ml-1 > .v-btn__content > .v-icon').click()
    cy.get('[data-cy="surgeon"] > .FcmListDialog_bodyExternal_P8Vx8 > .FcmListDialog_listExternal_D4lMu > .v-input').scrollIntoView().click()
    cy.get('.v-data-table__wrapper > table > tbody > :nth-child(3)').click()
    cy.get('#itemFooterAddProceduresAction > .v-icon').click()
    cy.get('#procedureItemHV4w3ig7ly5a8nt5oXgU').click()
    })
})