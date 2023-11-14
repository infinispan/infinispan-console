import { useEffect, useState } from 'react';
import { ConsoleServices } from '@services/ConsoleServices';
import { useApiAlert } from '@utils/useApiAlert';
import { useTranslation } from 'react-i18next';

export function useFetchAvailablePrincipals() {
  const [principals, setPrincipals] = useState<Principal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (loading) {
      ConsoleServices.security()
        .getSecurityPrincipals()
        .then((either) => {
          if (either.isRight()) {
            either.value.sort((r1, r2) => {
              return r1.name < r2.name ? -1 : 1;
            });
            setPrincipals(either.value);
          } else {
            setError(either.value.message);
          }
        })
        .then(() => setLoading(false));
    }
  }, [loading]);

  return {
    principals,
    loading,
    setLoading,
    error
  };
}

export function useGrantAccess(principal: string, roles: string[], call: () => void) {
  const { addAlert } = useApiAlert();
  const { t } = useTranslation();

  const onGrantAccess = () => {
    ConsoleServices.security()
      .grantAccess(
        principal,
        roles,
        t('access-management.principals.grant-success', { principalName: principal }),
        t('access-management.principals.grant-error', { principalName: principal })
      )
      .then((actionResponse) => {
        addAlert(actionResponse);
      })
      .finally(() => call());
  };
  return {
    onGrantAccess
  };
}

export function useDescribePrincipal(principalName: string) {
  const { t } = useTranslation();
  const [principal, setPrincipal] = useState<Principal>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (loading) {
      ConsoleServices.security()
        .describePrincipal(principalName)
        .then((either) => {
          if (either.isRight()) {
            setPrincipal({ name: principalName, roles: either.value.sort() });
          } else {
            setError(either.value.message);
          }
        })
        .then(() => setLoading(false));
    }
  }, [loading]);

  return {
    principal,
    setLoading,
    loading,
    error
  };
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
        t('access-management.principals.' + action + '-role-success', { roles: roleStr, principalName: principal }),
        t('access-management.principals.' + action + '-role-error', { roles: roleStr, principalName: principal })
      )
      .then((actionResponse) => {
        addAlert(actionResponse);
      })
      .finally(() => call());
  };

  return {
    onGrantOrDenyRoles
  };
}

export function useRemovePrincipal(principal: string, call: () => void) {
  const { addAlert } = useApiAlert();
  const { t } = useTranslation();

  const onRemove = () => {
    ConsoleServices.security()
      .removePrincipal(
        principal,
        t('access-management.principals.remove-success', { principalName: principal }),
        t('access-management.principals.remove-error', { principalName: principal })
      )
      .then((actionResponse) => {
        addAlert(actionResponse);
      })
      .finally(() => call());
  };
  return {
    onRemove
  };
}
