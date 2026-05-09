export enum RolNombreEnum {
  ADMIN = 'ADMIN',
  EMPLOYEE = 'EMPLOYEE',
  CUSTOMER = 'CUSTOMER',
}

export class Rol {
  constructor(
    readonly rolId: number,
    readonly nombre: RolNombreEnum,
  ) {}
}
