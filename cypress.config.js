const { defineConfig } = require("cypress");

module.exports = defineConfig({
  projectId: '817tb1',
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
