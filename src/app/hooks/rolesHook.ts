import { useEffect, useState } from 'react';
import { ConsoleServices } from '@services/ConsoleServices';
import { useApiAlert } from '@utils/useApiAlert';
import { useTranslation } from 'react-i18next';
import { useServiceCall } from '@app/hooks/useServiceCall';

export function useFetchAvailableRolesNames() {
  const {
    data: availableRoleNames,
    loading,
    error,
  } = useServiceCall<string[]>(
    () => ConsoleServices.security().getSecurityRolesNames(),
    [],
  );

  return { availableRoleNames, loading, error };
}

export function useFetchAvailableRoles() {
  const {
    data: roles,
    loading,
    setLoading,
    error,
  } = useServiceCall<Role[]>(
    () => ConsoleServices.security().getSecurityRoles(),
    [],
    {
      transform: (roles) =>
        [...roles].sort((r1, r2) => {
          if (r1.implicit && !r2.implicit) return -1;
          if (!r1.implicit && r2.implicit) return 1;
          return r1.name < r2.name ? -1 : 1;
        }),
    },
  );

  return { roles, loading, setLoading, error };
}

export function useUpdateRole(
  roleName: string,
  roleDescription: string,
  permissions: string[],
  call: () => void,
) {
  const { addAlert } = useApiAlert();
  const { t } = useTranslation();

  const onUpdateRole = () => {
    ConsoleServices.security()
      .updateRole(
        roleName,
        roleDescription,
        permissions,
        t('access-management.role.update-success', { name: roleName }),
        t('access-management.role.update-error', { name: roleName }),
      )
      .then((actionResponse) => {
        addAlert(actionResponse);
      })
      .finally(() => call());
  };
  return {
    onUpdateRole,
  };
}

export function useRemovePermission(
  roleName: string,
  permission: string,
  permissions: string[],
  call: () => void,
) {
  const { addAlert } = useApiAlert();
  const { t } = useTranslation();

  const onRemovePermission = () => {
    const perms: string[] = [];
    permissions.forEach((perm) => {
      if (perm !== permission) {
        perms.push(perm);
      }
    });

    ConsoleServices.security()
      .updateRole(
        roleName,
        '',
        perms,
        t('access-management.role.update-success', { name: roleName }),
        t('access-management.role.update-error', { name: roleName }),
      )
      .then((actionResponse) => {
        addAlert(actionResponse);
      })
      .finally(() => call());
  };
  return {
    onRemovePermission,
  };
}

export function useCreateRole(
  roleName: string,
  roleDescription: string,
  permissions: string[],
  call: () => void,
) {
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
    onCreateRole,
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
        t('access-management.roles.delete-error', { name: roleName }),
      )
      .then((actionResponse) => {
        addAlert(actionResponse);
      })
      .finally(() => call());
  };
  return {
    onDeleteRole,
  };
}

export function useDescribeRole(roleName: string) {
  const {
    data: role,
    loading,
    error,
    setLoading,
  } = useServiceCall<Role | undefined>(
    () => ConsoleServices.security().describeRole(roleName),
    undefined,
  );

  return { role, loading, error, setLoading };
}

export function useFlushCache(call: () => void) {
  const { addAlert } = useApiAlert();
  const { t } = useTranslation();
  const onFlushCache = () => {
    ConsoleServices.security()
      .flushCache(
        t('access-management.flush-cache-success'),
        t('access-management.flush-cache-error'),
      )
      .then((actionResponse) => {
        addAlert(actionResponse);
      })
      .finally(() => call());
  };
  return {
    onFlushCache,
  };
}

export function useCachesForRole(roleName: string) {
  const { data, loading, error } = useServiceCall<Map<string, string[]>>(
    () => ConsoleServices.caches().getCachesForRole(roleName),
    new Map(),
  );

  const secured = (data.get('secured') as string[] | undefined)?.sort() ?? [];
  const nonSecured =
    (data.get('non-secured') as string[] | undefined)?.sort() ?? [];

  return { secured, nonSecured, loading, error };
}
