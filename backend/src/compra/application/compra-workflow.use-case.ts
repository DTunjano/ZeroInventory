import { BadRequestException, Injectable } from '@nestjs/common';
import {
  CompraDraftInput,
  CompraFiltros,
} from '../domain/compra-workflow.types';
import { calculateDraft } from './calculate-draft';
import { CompraWorkflowRepository } from '../domain/repository/compra-workflow.repository';

@Injectable()
export class CompraWorkflowUseCase {
  constructor(private readonly repository: CompraWorkflowRepository) {}
  create(input: CompraDraftInput, actor: number) {
    return this.repository.createDraft(calculateDraft(input), actor);
  }
  update(id: number, version: number, input: CompraDraftInput, actor: number) {
    return this.repository.updateDraft(
      id,
      version,
      calculateDraft(input),
      actor,
    );
  }
  receive(id: number, version: number, actor: number) {
    return this.repository.receive(id, version, actor);
  }
  cancel(id: number, version: number, motivo: string, actor: number) {
    if (!motivo.trim())
      throw new BadRequestException('El motivo es obligatorio');
    return this.repository.cancel(id, version, motivo.trim(), actor);
  }
  get(id: number) {
    return this.repository.get(id);
  }
  list(filters: CompraFiltros) {
    return this.repository.list(filters);
  }
}
