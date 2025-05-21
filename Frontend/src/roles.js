export const Roles = {
  ADMIN: 'admin',
  PHARMACIST: 'pharmacist',
  DOCTOR: 'doctor',
  RECEPTIONIST: 'receptionist',
};

//Role-based menu access
export const RoleMenus = {
  [Roles.ADMIN]: [
    'dashboard',
    'admin-panel',
    'inventory',
    'purchase-details',
    'sales',
    'patient',
    'expenses',
    'income',
    'pharmacy',
    'glasses',
    'branches',
  ],
  [Roles.DOCTOR]: ['doctor-finance'],
  [Roles.PHARMACIST]: ['pharmacy', 'sales'],
  [Roles.RECEPTIONIST]: [
    'branches',
    'patient',
    'sales',
    'pharmacy',
    'glasses',
    'purchase-details',
    'doctor-finance',
  ],
};
