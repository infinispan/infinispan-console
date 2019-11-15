# Infinispan Console NG

This is the front end application for the web console of the new Infinispan Server 10.x

This application is built using Patternfly 4 and React

## Quick-start
```bash
npm install yarn -g # ensure you have yarn on your machine globally
git clone https://github.com/infinispan/infinispan-console-ng # clone the project
cd infinispan-console-ng # navigate into the project directory
yarn # install infinispan-console-ng dependencies
yarn build # build the project
yarn start # start the development server
```
## Development Scripts

Install development/build dependencies
`yarn`

Start the development server
`yarn start`

Run a production build
`yarn build`

Run the test suite
`yarn test`

Run the linter
`yarn lint`

Run the code formatter
`yarn format`

Launch a tool to inspect the bundle size
`yarn bundle-profile:analyze`

## Configurations
* [TypeScript Config](./tsconfig.json)
* [Webpack Config](./webpack.common.js)
* [Jest Config](./jest.config.js)
* [Editor Config](./.editorconfig)

## Code Quality Tools
* For accessibility compliance, we use [react-axe](https://github.com/dequelabs/react-axe)
* To keep our bundle size in check, we use [webpack-bundle-analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer)
* To keep our code formatting in check, we use [prettier](https://github.com/prettier/prettier)
* To keep our code logic and test coverage in check, we use [jest](https://github.com/facebook/jest)
