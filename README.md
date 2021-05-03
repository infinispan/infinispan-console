![Version](https://maven-badges.herokuapp.com/maven-central/org.infinispan/infinispan-console/badge.svg "Version")

# Infinispan Console

This is the front end application for the web console of the new Infinispan Server 12.x

This application is built using [Patternfly 4 and React](https://www.patternfly.org/v4/get-started/developers)

## Before you start
This project needs a standalone infinispan server running locally.
The Infinispan server exposes the [REST API](https://infinispan.org/docs/dev/titles/rest/rest.html)
that is used in this console.

In production, this console is built as a dependency using maven. This dependency is added to the infinispan
server bundle, so the console is served from the server in production.

### Use Docker

To run the latest development release version, run 12.0

```bash
 docker run -it --rm -p 11222:11222 -e USER="admin" -e PASS="pass" infinispan/server:12.1
```

### Direct download
You can always download the server from the [Infinispan website](https://infinispan.org/download/)

## Quick-start
```bash
git clone https://github.com/infinispan/infinispan-console # clone the project
cd infinispan-console # navigate into the project directory
npm install # install infinispan-consoledependencies
npm run start:dev # start the development server
```
## Development Scripts

Install development/build dependencies
`npm install`

By default, Console in development mode looking for the Infinispan Server REST URL at the `http:\\localhost:11222\v2\rest`

It's possible to replace host and port URL connection with `INFINISPAN_SERVER_URL` environment variable which will be added to the REST endpoint

Start the development server
`npm run start:dev`

Run a production build (outputs to "dist" dir)
`npm run build`

Run the test suite
`npm run test`

Run the linter
`npm run lint`

Run the code formatter
`npm run format`

Launch a tool to inspect the bundle size
`npm run bundle-profile:analyze`

## Build de maven dependency

This console is built and released as a maven dependency used in the infinispan server.

`mvn clean install`

#### Skip Unit tests
Unit test run by default. To skip them use 'skipTests' property.

`mvn clean install -DskipTests`

#### Run Cypress IT Tests
Integration tests don't run by default locally. They always run in CI.
To run integration tests locally:
You need to run first `./run-server-for-e2e.sh` that will download and run the infinispan server.
Then `mvn clean install -De2e=true`

## Configurations
* [TypeScript Config](./tsconfig.json)
* [Webpack Config](./webpack.common.js)
* [Jest Config](./jest.config.js)
* [Editor Config](./.editorconfig)

## Favicons

Generated with [Favicon generator](https://www.favicon-generator.org/)


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
