import { roles } from '@/types/userSauronInfo';

const adminRoles: roles[] = ['dpr', 'admin'];

export default (rolesArray: roles[]) => rolesArray.some((role) => adminRoles.includes(role));
