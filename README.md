# Infinispan Console

[![Version](https://img.shields.io/maven-central/v/org.infinispan/infinispan-console?logo=apache-maven&style=for-the-badge)](https://search.maven.org/artifact/org.infinispan/infinispan-console)
[![License](https://img.shields.io/github/license/infinispan/infinispan-console?style=for-the-badge&logo=apache)](https://www.apache.org/licenses/LICENSE-2.0)


Welcome to the Infinispan Console, the front-end application for the web console of the new Infinispan Server 15.x. This web application is built using [Patternfly 5](https://www.patternfly.org/get-started/develop) and [React 18](https://react.dev/learn).

## Getting Started
Before you start using the Infinispan Console, please ensure you have a standalone Infinispan server running locally. The Infinispan server exposes the [REST API](https://infinispan.org/docs/dev/titles/rest/rest.html) that is utilized by this console.

In production environments, this console is bundled as a dependency using Maven. This dependency is then added to the Infinispan server bundle, making the console accessible from the server in production.

### Run with Docker

To run the latest release version using Docker, you can use the following commands:

```bash
 docker run -it --rm -p 11222:11222 -e USER="admin" -e PASS="pass" infinispan/server
```
Alternatively, you can use the ```identities.batch``` script running from the ```scripts``` folder:

```bash
docker run -v $(pwd):/user-config -e IDENTITIES_BATCH="/user-config/identities.batch" -p 11222:11222 infinispan/server
```

### Direct download
You can also download the Infinispan server directly from the [Infinispan website](https://infinispan.org/download/)

## Quick-start
To quickly get started with the Infinispan Console, follow these steps:
```bash
git clone https://github.com/infinispan/infinispan-console # clone the project
cd infinispan-console # navigate into the project directory
npm install # install infinispan-console dependencies
npm run start:dev # start the development server
```

## Development Scripts

Here are some useful development scripts for working with the Infinispan Console:

- Install development/build dependencies: `npm install`
- Start the development server: `npm run start:dev`
- Run a production build (outputs to "dist" directory): `npm run build`
- Run the test suite: `npm run test`
- Run the linter: `npm run lint`
- Run the code formatter: `npm run format`
- Launch a tool to inspect the bundle size: `npm run bundle-profile:analyze`

By default, Console in development mode looking for the Infinispan Server REST URL at the `http:\\localhost:11222\v2\rest`

It's possible to replace host and port URL connection with `INFINISPAN_SERVER_URL` environment variable which will be added to the REST endpoint

## Build the Maven dependency

This console is built and released as a Maven dependency used in the infinispan server.
```bash
mvn clean install
```

## Skip Unit tests
Unit test run by default. To skip them use 'skipTests' property.
```bash
mvn clean install -DskipTests
```

## Run Cypress IT Tests
Integration tests don't run by default locally. They always run in CI.

To run Cypress integration tests locally, follow these steps:

1. Run the Infinispan server using `./run-server-for-e2e.sh`, which will download and run the server.
2. Run the following command with the `-De2e=true` flag:
```bash
mvn clean install -De2e=true
```

## Configurations
* [TypeScript Config](./tsconfig.json)
* [Webpack Config](./webpack.common.js)
* [Jest Config](./jest.config.js)
* [Editor Config](./.editorconfig)

## Favicons

Generated with [Favicon generator](https://www.favicon-generator.org/)

## Translation

We are using Weblate for translating the Infinispan Console into different languages. Weblate is a web-based translation platform that streamlines the translation process and allows collaboration among contributors.

You can access the translation project for Infinispan Console on Weblate [here](https://hosted.weblate.org/projects/infinispan/infinispan-console/). If you're interested in contributing translations or improving existing ones, feel free to join the Weblate project and start translating.

### How to Contribute Translations

1. Visit the [Weblate project](https://hosted.weblate.org/projects/infinispan/infinispan-console/) for Infinispan Console.
2. Sign up or log in to your Weblate account.
3. Choose the language you want to work on from the available languages or add a new language for translation.
4. Start translating the strings directly on the Weblate interface.
5. Once you're satisfied with the translations, submit them, and they will be reviewed and integrated into the Infinispan Console.

Thank you for your contributions in making the Infinispan Console accessible to a broader audience!

## Code Quality Tools
* For accessibility compliance, we use [react-axe](https://github.com/dequelabs/react-axe)
* To keep our bundle size in check, we use [webpack-bundle-analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer)
* To keep our code formatting in check, we use [prettier](https://github.com/prettier/prettier)
* To keep our code logic and test coverage in check, we use [jest](https://github.com/facebook/jest)

## Securing the Console

### Disabling Security

You can disable security in the REST API in the `infinispan.xml` file of the server you are running.
Remove the `security-realm="default"` from the endpoints

```xml
  <endpoints socket-binding="default">
    <hotrod-connector name="hotrod"/>
    <rest-connector name="rest"/>
  </endpoints>
```

### Infinispan Authentication
Default security of the server uses credential authentication.

If you run a server without any user or password, the 'Support' popup should be displayed in the welcome page.

### Keycloak

1. `docker run -p 8080:8080 -e KEYCLOAK_USER=keycloak -e KEYCLOAK_PASSWORD=keycloak --name keycloak jboss/keycloak:12.0.2`
2. Connect to `http://localhost:8080` to access the Keycloak admin console.
3. Select `Add realm` and then upload `data/infinispan-keycloak-realm.json`.
4. Create an Infinispan server configuration with the following security realm:

```xml
  <security>
    <security-realms>
      <security-realm name="default">
        <token-realm name="infinispan" auth-server-url="http://localhost:8080/auth/" client-id="infinispan-console">
          <oauth2-introspection
            introspection-url="http://localhost:8080/auth/realms/infinispan/protocol/openid-connect/token/introspect"
            client-id="infinispan-server" client-secret="1fdca4ec-c416-47e0-867a-3d471af7050f"/>
        </token-realm>
      </security-realm>
    </security-realms>
  </security>
```

You can also copy the security realm from `data/infinispan-security-realm.xml`.

4. Run the console in dev mode. When you open the dev console in your browser, Keycloak prompts you for credentials.
5. Enter the `admin/adminPassword` credentials. Keycloak redirects you to the dev console.
