import { useContext, useEffect, useState } from 'react';
import {UserContext, UserContextProvider} from "@app/providers/UserContextProvider";

export function useFetchUser() {
  const { userName, error, notSecuredModeOn, logUser, notSecured} = useContext(
    UserContext
  );

  return { userName, error, logUser, notSecuredModeOn,  notSecured };
}
