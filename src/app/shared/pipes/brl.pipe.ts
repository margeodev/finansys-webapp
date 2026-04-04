import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'brl', standalone: true })
export class BrlPipe implements PipeTransform {
  transform(value: number | string | null | undefined): string {
    const num = Number(value ?? 0);
    return 'R$\u00A0' + num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}
