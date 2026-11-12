import { ApiProperty, OmitType } from '@nestjs/swagger';
import { CreateUsuarioDTO } from './create-usuario-dto';

/** Contrato público: nunca incluye contraseña ni su hash. */
export class UsuarioResponseDTO extends OmitType(CreateUsuarioDTO, ['password', 'documento'] as const) {
  @ApiProperty() usuarioId!: number;
  @ApiProperty() isActive!: boolean;
  @ApiProperty() theme!: string;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
}

export class UsuarioPageDTO {
  @ApiProperty({ type: [UsuarioResponseDTO] }) data!: UsuarioResponseDTO[];
  @ApiProperty() total!: number;
  @ApiProperty() page!: number;
  @ApiProperty() limit!: number;
  @ApiProperty() totalPages!: number;
}
