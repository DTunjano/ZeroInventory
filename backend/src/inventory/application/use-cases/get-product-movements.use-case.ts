import { Inject, Injectable } from '@nestjs/common';
import type { IKardexRepository } from '../../domain/kardex.repository';
@Injectable()
export class GetProductMovementsUseCase {
  constructor(
    @Inject('IKardexRepository') private readonly repository: IKardexRepository,
  ) {}
  execute(id: number, page: number, limit: number) {
    return this.repository.getMovementsPage(id, page, limit);
  }
}
