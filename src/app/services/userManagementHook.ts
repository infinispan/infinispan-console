import { useContext } from 'react';
import { UserContext } from '@app/providers/UserContextProvider';

export function useConnectedUser() {
  const { connectedUser, error, notSecuredModeOn, logUser, notSecured, reloadAcl } = useContext(UserContext);

  return { connectedUser, error, logUser, notSecuredModeOn, notSecured, reloadAcl };
}

export function useAppInitState() {
  const { init } = useContext(UserContext);
  return { init };
}
