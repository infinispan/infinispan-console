import { RoleFilterOption } from '@services/infinispanRefData';

/**
 * Utility function to help filters the list of items based on the search value
 * @param value - value to search
 * @param listItem - item to search from
 */
export const onSearch = (value: string, listItem: string) => {
  let searchValueInput: RegExp;
  try {
    searchValueInput = new RegExp(value, 'i');
  } catch (err) {
    searchValueInput = new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  }
  const matchesSearchValue = listItem.search(searchValueInput) >= 0;

  return value === '' || matchesSearchValue;
};

/**
 * Utility function to help filters the list of items based on the search value
 * @param value - value to search
 * @param listItem - list of items to search
 */
export const onFilter = (value: string, listItem: string) => {
  let searchValueInput: RegExp;
  try {
    searchValueInput = new RegExp(value, 'i');
  } catch (err) {
    searchValueInput = new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  }
  const matchesSearchValue = listItem.search(searchValueInput) >= 0;

  return value === '' || matchesSearchValue;
};

/**
 * Utility function to help filters the list of roles based on the search value
 * @param value - value to search
 * @param roles - list of roles to search
 * @param filterOption - filter option to search
 * @returns list of roles that match the search value
 */
export const filterRoles = (value: string, roles: Role[], filterOption: string): Role[] => {
  if (filterOption === RoleFilterOption.name) {
    return roles.filter((role) => role.name.toLowerCase().includes(value.toLowerCase()));
  } else if (filterOption === RoleFilterOption.cacheManagerPermissions) {
    return roles.filter((role) =>
      role.cacheManagerPermissions.some((permission) => permission.toLowerCase().includes(value.toLowerCase()))
    );
  } else if (filterOption === RoleFilterOption.cachePermissions) {
    return roles.filter((role) =>
      role.cachePermissions.some((permission) => permission.toLowerCase().includes(value.toLowerCase()))
    );
  }
  return [];
};

