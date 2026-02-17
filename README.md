# Testes-Estudos

Estudos de Testes para Automação com Cypress - Projeto de aprendizado em QA Automation

## 🚀 Começando

### Pré-requisitos
- Node.js (v18+)
- npm ou yarn

### Instalação
```bash
npm install
```

### Configuração do Ambiente

1. **Copie o arquivo `.env.example` para `.env`:**
```bash
cp .env.example .env
```

## 🧪 Rodando os Testes

### Abrir Cypress Interativo
```bash
npm run cyInit
```

### Rodar Testes em Headless (CLI)
```bash
npm run cyRun
```

---

## 📚 Guia de Boas Práticas

### 1️⃣ **Seletores Robustos**

❌ **Evite:**
```javascript
cy.get('.v-input__slot')          // Classe genérica
cy.get('button')                  // Seletor muito amplo
cy.get(':nth-child')             // Frágil a mudanças
```

✅ **Use:**
```javascript
cy.get('[data-cy="txtFieldEmail"]')         // Atributo específico
cy.get('[data-cy="buttonSave"]')            // ID semântico
cy.get('[type="submit"]')                   // Atributo HTML
```

**Por quê?** Seletores genéricos quebram facilmente quando a UI muda. Use `data-cy` atributos que você controla.

---

### 2️⃣ **Credenciais e Dados Sensíveis**

❌ **Evite hardcoding:**
```javascript
cy.get('[data-cy="txtFieldEmail"]').type('...')
cy.get('[data-cy="txtFieldPassword"]').type('...')
```

✅ **Use variáveis de ambiente:**
```javascript
cy.get('[data-cy="txtFieldEmail"]').type(Cypress.env('ADMIN_EMAIL'))
cy.get('[data-cy="txtFieldPassword"]').type(Cypress.env('ADMIN_PASSWORD'))
```

**Por quê?** Evita expor dados sensíveis no repositório.

---

### 3️⃣ **Reutilize Código**

✅ **Crie Custom Commands (`cypress/support/commands.js`):**
```javascript
Cypress.Commands.add('loginAsAdmin', () => {
  cy.visit(Cypress.env('BASE_URL') + '/client/login')
  cy.get('[data-cy="acceptCookies"]').click()
  cy.get('[data-cy="txtFieldEmail"]').type(Cypress.env('ADMIN_EMAIL'))
  cy.get('[data-cy="txtFieldPassword"]').type(Cypress.env('ADMIN_PASSWORD'))
  cy.get('[data-cy="buttonLogin"]').click()
})

Cypress.Commands.add('selectCorporative', (name) => {
  cy.get('[data-cy="searchCorporative"]').type(name)
  cy.get('[data-fcm="30"]').click()
})
```

### 4️⃣ **Testes Pequenos e Focados**

❌ **Evite testes longos:**
```javascript

it('Fluxo completo de lançamento de evento', () => {
  // 50 linhas de código
  // Difícil de debugar
  // Quebra em qualquer pequena mudança
})
```

✅ **Divida em testes menores:**
```javascript
describe('Lançamento', () => {
  
  beforeEach(() => {
    cy.loginAsAdmin()
  })

  it('Deve validar campos obrigatórios', () => {
    cy.get('[data-cy="buttonSave"]').click()
    cy.get('[data-cy="errorCPF"]').should('be.visible')
  })

  it('Deve preencher formulário e salvar com sucesso', () => {
    cy.fillEventForm({
      cpf: '12345678901',
      name: 'João Silva'
    })
    cy.get('[data-cy="buttonSave"]').click()
    cy.get('.swal2-header').should('contain', 'Sucesso')
  })
})
```

**Por quê?** Testes pequenos são mais rápidos de executar, fáceis de debugar e mantêm a confiabilidade.

---

### 5️⃣ **Esperas Inteligentes (Não use `cy.wait(2000)`)**

❌ **Evite hard wait:**
```javascript
cy.wait(2000)  // Espera cega
cy.wait(5000)  // Muito tempo
```

✅ **Use esperas inteligentes:**
```javascript
// Esperar elemento ficar visível
cy.get('[data-cy="dialogForm"]', { timeout: 15000 }).should('be.visible')

// Esperar elemento desaparecer
cy.get('[data-cy="loader"]').should('not.exist')

// Esperar URL mudar
cy.url().should('include', '/events')

// Esperar request completar (melhor prática)
cy.intercept('POST', '/api/events').as('createEvent')
cy.get('[data-cy="buttonSave"]').click()
cy.wait('@createEvent')
```

**Por quê?** `cy.wait()` é não-determinístico. Testes ficam lentos e flaky.

---

### 6️⃣ **Dados de Teste com Faker.js**

Seu projeto tem `@faker-js/faker`! Use para dados dinâmicos:
```javascript
import { faker } from '@faker-js/faker'

it('Deve criar evento com dados fake', () => {
  const patientName = faker.person.fullName()
  const email = faker.internet.email()
  
  cy.get('[data-cy="patientName"]').type(patientName)
  cy.get('[data-cy="patientEmail"]').type(email)
})
```

**Por quê?** Evita conflitos de dados em execuções repetidas.

---

### 7️⃣ **Estrutura de Pastas Recomendada**
```
cypress/
├── e2e/
│   ├── 1-testes-praticos/
│   │   ├── event-launch.cy.js
│   │   ├── protocol-launch.cy.js
│   │   └── login.cy.js
│   └── 2-api/ (futuro)
├── fixtures/
│   ├── users.json
│   ├── events.json
│   └── example.json
├── support/
│   ├── commands.js       ← Custom commands (login, fill forms, etc)
│   ├── helpers.js        ← Funções auxiliares
│   └── e2e.js
├── cypress.config.js
└── .env                  ← Nunca commitar!
```

---

### 8️⃣ **Checklist Antes de Fazer Commit**

- [ ] Removi credenciais do código? (use `Cypress.env()`)
- [ ] Usei `data-cy` atributos nos seletores?
- [ ] Criei Custom Commands para ações repetidas?
- [ ] Meus testes são pequenos e focados?
- [ ] Testes passam executando múltiplas vezes?

---

## 📖 Recursos Úteis

- [Documentação Cypress](https://docs.cypress.io)
- [Best Practices Cypress](https://docs.cypress.io/guides/references/best-practices)
- [Cypress Testing Library](https://testing-library.com/docs/cypress-testing-library/intro/)
- [Faker.js Docs](https://fakerjs.dev)

---

**Bom estudo em QA Automation! 🎯**