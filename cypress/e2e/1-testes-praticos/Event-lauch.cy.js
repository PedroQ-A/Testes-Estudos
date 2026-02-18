/// <reference types="cypress"/>

import { generate as generateCpf } from 'gerador-validador-cpf'
import { faker } from '@faker-js/faker'

describe('Deve lançar evento sem erro', () => {

    it('Fluxo de lançamento de evento', () => {
        const CPF = generateCpf({ format: true })
        const nomeCompleto = faker.person.fullName()

        cy.visit('https://med.volan.app.br/admin/companies')
        cy.get('.v-snack__action').click()
        cy.get('[data-cy="txtFieldEmail"]').type('pedrolucas0130@admin.volan.app.br')
        cy.get('[data-cy="txtFieldPassword"]').type('Ped0118')
        cy.get('.Login_buttonBox__tK6r > .col > .v-btn').click()
        cy.get('.v-app-bar__nav-icon').click()
        cy.get('.no-gutters > .justify-center').should('exist')
        cy.get('.v-overlay__scrim').click()
        cy.get('.v-input__slot').type('T.A')
        cy.get('[data-cy="FcmList_SY9CCOYSz0VgertGaf7C"] > [data-fcm="30"]').click()
        cy.wait(1000)
        cy.get('.v-app-bar__nav-icon > .v-btn__content').click()
        cy.get('[href="/client/events?add=1&type=Honorario"]').click()
        cy.get('[data-cy="txtFieldPatientCPF"]', { timeout: 13000 }).should('be.visible').type(CPF)
        cy.get('.patient-name-col > .v-input').type(nomeCompleto)
        cy.get('[data-cy="dateBirthDate"] > .v-input').type('01011990')
        cy.get('.ml-1 > .v-btn__content').should('be.visible').click()
        cy.get('.health-insurances-col').click()
        cy.get('[data-cy="FcmList_u7rDjyhZ9ysH974iYrjT"] > :nth-child(2)').click()
        cy.get('[data-cy="anesthetist"] > .FcmListDialog_bodyExternal_P8Vx8 > .FcmListDialog_listExternal_D4lMu > .v-input').click()
        cy.get('[data-cy="FcmList_bnHXjnywAW2hoPLUKrWV"] > :nth-child(1)').click()
        cy.get('[data-cy="hospital"] > .FcmListDialog_bodyExternal_P8Vx8 > .FcmListDialog_listExternal_D4lMu > .v-input').click()
        cy.get('[data-cy="FcmList_6LA9cECM7mD75SizAYMR"] > :nth-child(2)').click()
        cy.get('[data-cy="surgeon"] > .FcmListDialog_bodyExternal_P8Vx8 > .FcmListDialog_listExternal_D4lMu > .v-input').click()
        cy.get('[data-cy="FcmList_Nvs9hdSJmyEvYjxVGp9a"] > :nth-child(2)').click()
        cy.get('[data-cy="itemFooterAddProceduresAction"] > .v-icon').click()
        cy.get('[data-cy="procedureItem_10101012"] > :nth-child(1)').click()
        cy.get('[data-cy="buttonSave"]').click()
        cy.get('.swal2-header').should('contain', 'Sucesso')
    })
})