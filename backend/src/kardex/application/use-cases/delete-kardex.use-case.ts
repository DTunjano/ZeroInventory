import { Injectable } from '@nestjs/common';
import { KardexRepository } from '../../domain/repository/kardex.repository';

@Injectable()
export class DeleteKardexUseCase {
  constructor(private readonly kardexRepository: KardexRepository) {}

  async execute(id: number): Promise<boolean> {
    return await this.kardexRepository.delete(id);
  }
}
