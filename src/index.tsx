import React from 'react';
import ReactDOM from 'react-dom';
import { App } from '@app/index';
import authenticationService from "./services/authService";
import Keycloak from "keycloak-js";
import {KeycloakService} from "./services/keycloakService";

if (process.env.NODE_ENV !== 'production') {
  // tslint:disable-next-line
  const axe = require('react-axe');
  // TODO: deal with react axe errors
  // axe(React, ReactDOM, 1000);
}

authenticationService.config().then(eitherAuth => {
  if(eitherAuth.isRight()) {
    if(!eitherAuth.value.keycloakConfig) {
      ReactDOM.render(<App />, document.getElementById('root') as HTMLElement);
    } else {
      KeycloakService.init(eitherAuth.value.keycloakConfig).then(result => {
        if(KeycloakService.Instance.authenticated()) {
        } else {
          KeycloakService.Instance.login();
        }
        localStorage.setItem("react-token", KeycloakService.keycloakAuth.token);
        localStorage.setItem("react-refresh-token", KeycloakService.keycloakAuth.refreshToken);
        ReactDOM.render(<App />, document.getElementById('root') as HTMLElement);
        setTimeout(() => {
          KeycloakService.Instance.getToken().then(token => {
            localStorage.setItem("react-token", token);
          })
        }, 60000)
      });
    }
  }
});
