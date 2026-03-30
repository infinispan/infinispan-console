import { ConsoleServices } from '@services/ConsoleServices';
import { useApiAlert } from '@utils/useApiAlert';
import { useTranslation } from 'react-i18next';
import { useServiceCall } from '@app/hooks/useServiceCall';

export function useFetchAvailablePrincipals() {
  const {
    data: principals,
    loading,
    setLoading,
    error,
  } = useServiceCall<Principal[]>(
    () => ConsoleServices.security().getSecurityPrincipals(),
    [],
    {
      transform: (principals) =>
        [...principals].sort((r1, r2) => (r1.name < r2.name ? -1 : 1)),
    },
  );

  return { principals, loading, setLoading, error };
}

export function useGrantAccess(
  principal: string,
  roles: string[],
  call: () => void,
) {
  const { addAlert } = useApiAlert();
  const { t } = useTranslation();

  const onGrantAccess = () => {
    ConsoleServices.security()
      .grantAccess(
        principal,
        roles,
        t('access-management.principals.grant-success', {
          principalName: principal,
        }),
        t('access-management.principals.grant-error', {
          principalName: principal,
        }),
      )
      .then((actionResponse) => {
        addAlert(actionResponse);
      })
      .finally(() => call());
  };
  return {
    onGrantAccess,
  };
}

export function useDescribePrincipal(principalName: string) {
  const {
    data: roles,
    setLoading,
    loading,
    error,
  } = useServiceCall<string[] | undefined>(
    () => ConsoleServices.security().describePrincipal(principalName),
    undefined,
  );

  const principal = roles
    ? { name: principalName, roles: roles.sort() }
    : undefined;

  return { principal, setLoading, loading, error };
}

export function useGrantOrDenyRoles(principal: string, call: () => void) {
  const { addAlert } = useApiAlert();
  const { t } = useTranslation();

  const onGrantOrDenyRoles = (action: 'grant' | 'deny', roles: string[]) => {
    if (roles.length == 0) {
      return;
    }
    const roleStr = '[' + roles.map((p) => p).join(', ') + ']';

    ConsoleServices.security()
      .grantOrDenyRoles(
        principal,
        action,
        roles,
        t('access-management.principals.' + action + '-role-success', {
          roles: roleStr,
          principalName: principal,
        }),
        t('access-management.principals.' + action + '-role-error', {
          roles: roleStr,
          principalName: principal,
        }),
      )
      .then((actionResponse) => {
        addAlert(actionResponse);
      })
      .finally(() => call());
  };

  return {
    onGrantOrDenyRoles,
  };
}

export function useRemovePrincipal(principal: string, call: () => void) {
  const { addAlert } = useApiAlert();
  const { t } = useTranslation();

  const onRemove = () => {
    ConsoleServices.security()
      .removePrincipal(
        principal,
        t('access-management.principals.remove-success', {
          principalName: principal,
        }),
        t('access-management.principals.remove-error', {
          principalName: principal,
        }),
      )
      .then((actionResponse) => {
        addAlert(actionResponse);
      })
      .finally(() => call());
  };
  return {
    onRemove,
  };
}
