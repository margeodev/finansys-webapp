// Mesmas regras do app mobile (lib/constants/fixed_categories.dart).

// Ordem de exibição por id: as quatro de uso diário primeiro, depois as demais
// da mais usada para a menos usada (contagem de despesas em 02/11/2026).
export const CATEGORY_ORDER: number[] = [6, 13, 8, 2, 3, 11, 12, 7, 1, 5, 9, 4, 10];

// Descrição preenchida automaticamente ao escolher a categoria (id → texto)
export const DEFAULT_DESCRIPTIONS: Record<number, string> = {
  6: 'Mercado',
  13: 'Padaria',
  8: 'Gasolina',
  2: 'Farmácia',
};

// Categorias fora da lista vão para o fim, em ordem alfabética
export function sortCategories<T extends { id: number; description: string }>(categories: T[]): T[] {
  const rank = (id: number) => {
    const i = CATEGORY_ORDER.indexOf(id);
    return i === -1 ? CATEGORY_ORDER.length : i;
  };
  return [...categories].sort((a, b) =>
    rank(a.id) - rank(b.id) || a.description.localeCompare(b.description, 'pt-BR'));
}

// Ícone (Font Awesome) e cor de cada categoria, usados na tabela e no formulário
const CATEGORY_ICONS: Record<string, string> = {
  'moradia':        'house',
  'supermercado':   'cart-shopping',
  'conta serviços': 'bolt',
  'transporte':     'gas-pump',
  'lazer':          'gamepad',
  'saúde':          'heart-pulse',
  'bares e rest.':  'utensils',
  'manut. casa':    'screwdriver-wrench',
  'padaria':        'mug-hot',
  'farmácia':       'pills',
  'outros':         'list',
  'pets':           'paw',
  'manut. carro':   'car',
};

const CATEGORY_COLORS: Record<string, string> = {
  'moradia':        '#1565C0',
  'supermercado':   '#2E7D32',
  'conta serviços': '#E65100',
  'transporte':     '#6A1B9A',
  'lazer':          '#BF360C',
  'saúde':          '#00838F',
  'bares e rest.':  '#283593',
  'manut. casa':    '#AD1457',
  'padaria':        '#558B2F',
  'farmácia':       '#F9A825',
  'outros':         '#546E7A',
  'pets':           '#00695C',
  'manut. carro':   '#827717',
};

export function getCategoryIcon(description: string | null | undefined): string {
  return CATEGORY_ICONS[(description ?? '').toLowerCase()] || 'tag';
}

export function getCategoryColor(description: string | null | undefined): string {
  return CATEGORY_COLORS[(description ?? '').toLowerCase()] || '#546E7A';
}
