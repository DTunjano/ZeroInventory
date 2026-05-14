export enum Theme {
  DARK = 'dark',
  LIGHT = 'light',
}

export interface UserProfile {
  username: string;
  email: string;
  telefono: string | null;
  primerNombre: string | null;
  segundoNombre: string | null;
  primerApellido: string | null;
  segundoApellido: string | null;
  theme: Theme;
}

export interface UserAddress {
  lineaDir: string;
  barrio: string;
  codigoPostal: string | null;
  infoAdicional: string | null;
}

export interface UserSettings {
  profile: UserProfile;
  address: UserAddress | null;
  theme: Theme;
}
