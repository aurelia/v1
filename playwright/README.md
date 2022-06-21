## Integration (e2e) tests

You may need to install playwright test browsers if have not.

   npx playwright install --with-deps

All e2e tests are in `e2e/`.

Run e2e tests with:

    npm run e2e

Note the playwright config automatically runs "npm start" to start the dev server before playwright.

For more information, visit https://playwright.dev/docs/test-cli
