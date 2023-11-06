import { useEffect, useState } from 'react';
import { ConsoleServices } from '@services/ConsoleServices';
import { useApiAlert } from '@utils/useApiAlert';
import { useTranslation } from 'react-i18next';

export function useFetchAvailableRolesNames() {
  const [availableRoleNames, setAvailableRoleNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    if (loading) {
      ConsoleServices.security()
        .getSecurityRolesNames()
        .then((either) => {
          if (either.isRight()) {
            setAvailableRoleNames(either.value);
          } else {
            setError(either.value.message);
          }
        })
        .then(() => setLoading(false));
    }
  }, [loading]);

  return {
    availableRoleNames,
    loading,
    error
  };
}

export function useFetchAvailableRoles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (loading) {
      ConsoleServices.security()
        .getSecurityRoles()
        .then((either) => {
          if (either.isRight()) {
            either.value.sort((r1, r2) => {
              if (r1.implicit && !r2.implicit) {
                return -1;
              }

              if (!r1.implicit && r2.implicit) {
                return 1;
              }

              return r1.name < r2.name ? -1 : 1;
            });
            setRoles(either.value);
          } else {
            setError(either.value.message);
          }
        })
        .then(() => setLoading(false));
    }
  }, [loading]);

  return {
    roles,
    loading,
    setLoading,
    error
  };
}

export function useCreateRole(roleName: string, roleDescription: string, permissions: string[], call: () => void) {
  const { addAlert } = useApiAlert();

  const onCreateRole = () => {
    ConsoleServices.security()
      .createRole(roleName, roleDescription, permissions)
      .then((actionResponse) => {
        addAlert(actionResponse);
      })
      .finally(() => call());
  };
  return {
    onCreateRole
  };
}

export function useDeleteRole(roleName: string, call: () => void) {
  const { addAlert } = useApiAlert();
  const { t } = useTranslation();
  const onDeleteRole = () => {
    ConsoleServices.security()
      .deleteRole(
        roleName,
        t('access-management.roles.delete-success', { name: roleName }),
        t('access-management.roles.delete-error', { name: roleName })
      )
      .then((actionResponse) => {
        addAlert(actionResponse);
      })
      .finally(() => call());
  };
  return {
    onDeleteRole
  };
}

export function useFlushCache(call: () => void) {
  const { addAlert } = useApiAlert();
  const { t } = useTranslation();
  const onFlushCache = () => {
    ConsoleServices.security()
      .flushCache(t('access-management.flush-cache-success'), t('access-management.flush-cache-error'))
      .then((actionResponse) => {
        addAlert(actionResponse);
      })
      .finally(() => call());
  };
  return {
    onFlushCache
  };
}
