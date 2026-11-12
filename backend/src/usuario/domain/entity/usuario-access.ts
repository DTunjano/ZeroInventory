import { RolNombreEnum } from '../../../rol/domain/entity/rol.entity';

export interface UsuarioAccess {
  roles: RolNombreEnum[];
  /** Documento para crear el perfil CUSTOMER si todavía no existe. */
  documento?: string;
}
