import {useContext} from 'react';
import {UserContext} from "@app/providers/UserContextProvider";

export function useConnectedUser() {
  const { connectedUser, error, notSecuredModeOn, logUser, logOut, notSecured, reloadAcl} = useContext(
    UserContext
  );

  return { connectedUser, reloadAcl, error, logUser, logOut, notSecuredModeOn,  notSecured };
}
