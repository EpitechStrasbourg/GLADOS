import { roles } from '@/types/userSauronInfo';

const adminRoles: roles[] = ['admin'];

export default (rolesArray: roles[]) => rolesArray.some((role) => adminRoles.includes(role));
