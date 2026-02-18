/// <reference types="cypress"/>

import { generate } from 'cpf'

describe('Lançamento de protocolo', () => {

    beforeEach(() => {
        cy.visit('https://volandevjw--victor-deserto-issues-vdesertov-volan-719-ud3njbgd.web.app/client/login')
        cy.get('.v-snack__action').click()
        cy.get('[data-cy="txtFieldEmail"]').type('pedro@admin.volan.app.br')
        cy.get('[data-cy="txtFieldPassword"]').type('Ped0118')
        cy.get('.Login_buttonBox__tK6r > .col > .v-btn').click()
        cy.get('.v-app-bar__nav-icon',).click()
    });

    it('Fluxo de lançamento de protocolo', () => {
        const numeroAleatorio = Cypress._.random(100, 9999)

        cy.get('.majorBtn').click()
        cy.get('.v-input__slot', { timeout: 4000 }).type('teste de cooperativa')
        cy.wait(1000)
        cy.get(':nth-child(2) > [data-fcm="30"]').click()
        cy.get('.v-app-bar__nav-icon > .v-btn__content').click()
        cy.get('[href="/client/Protocols"]').click()
        cy.get('.FcmSearchTextField_firstLine_m2rah > .v-btn > .v-btn__content').click()
        cy.get('.col-md-10 > .v-input', { timeout: 4000 }).type('Teste')
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
        cy.get('.v-input__slot').type('teste de cooperativa')
        cy.wait(1000)
        cy.get(':nth-child(2) > [data-fcm="30"] > div > .volanGreenColor > .v-btn__content > .v-icon').click()
        cy.get('.v-app-bar__nav-icon > .v-btn__content').click()
        cy.get('[href="/client/events?add=1&type=Honorario"]').click()
        cy.get('#buttonPreEvent').click({ force: true })
        cy.get('.align-center > .v-input').type('55')
        cy.get(':nth-child(2) > .align-center > .v-btn').click()
        cy.wait(1000)
        cy.get('.jwCursorPointer > :nth-child(3)').click()
        cy.get('#txtFieldPatientCPF').type(cpfValido).should('exist')
        cy.get('#txtPatientName').type('Teste')
        cy.get(':nth-child(6) > form > .v-input').type('01011999')
        cy.get('.ml-1 > .v-btn__content').click()
        cy.get('[data-cy="surgeon"] > .FcmListDialog_bodyExternal_P8Vx8 > .FcmListDialog_listExternal_D4lMu > .v-input').click()
        cy.get(':nth-child(2) > [data-fcm="30"]').click()
        cy.get('#itemFooterAddProceduresAction').click()
        cy.get('#procedureItemHV4w3ig7ly5a8nt5oXgU').click({ force: true })
        cy.get('#buttonSave').should('exist').click()
        cy.get('#swal2-content').should('exist')
    })
})