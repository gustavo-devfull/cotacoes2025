export interface LojaFabrica {
  id: string;
  nome: string;
  nomeContato: string;
  telefone: string;
  segmento: string;
  dataCotacao: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CotacaoItem {
  SHOP_NO: string;
  NUM_COTACAO: string;
  referencia: string;
  PHOTO_NO: string;
  ITEM_NO: string;
  description: string;
  name: string;
  remark: string;
  obs: string;
  ncm: string;
  engdesciption: string;
  photo: string;
  MOQ: number;
  ctns: number;
  unitCtn: number;
  qty: number;
  unitPriceRmb: number;
  unit: string;
  amount: number;
  l: number;
  w: number;
  h: number;
  cbm: number;
  cbm_total: number;
  gw: number;
  tgw: number;
  nw: number;
  tnw: number;
  pesoUnitario: number;
  OBSERVATIONS_EXTRA: string;
  nomeContato: string;
  telefoneContato: string;
  dataCotacao: string;
  segmento: string;
  // Estados para exportação
  isSelected?: boolean;
  isExported?: boolean;
  // Estado para duplicatas
  isDuplicate?: boolean;
}

export interface SummaryStats {
  totalItems: number;
  totalValue: number;
  totalCBM: number;
}

export interface FilterOptions {
  searchTerm: string;
  shopFilter: string;
  segmentoFilter: string;
  dateRangeStart: string;
  dateRangeEnd: string;
}

export interface ImageData {
  photoNo: string;
  url: string;
  alt: string;
}

export interface Comment {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  message: string;
  images: string[]; // URLs das imagens no FTP
  timestamp: Date;
  mentionedUsers?: string[]; // IDs dos usuários marcados no comentário
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'user';
  createdAt: Date;
  lastLogin?: Date;
  isActive: boolean;
}

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  avatar?: string;
  createdAt: Date;
  lastLogin?: Date;
  isActive: boolean;
}

export interface Notification {
  id: string;
  type: 'comment';
  productId: string;
  productInfo: {
    shopNo: string;
    ref: string;
    description: string;
  };
  commentInfo: {
    userId: string;
    userName: string;
    message: string;
    timestamp: Date;
    mentionedUsers?: string[]; // IDs dos usuários marcados
  };
  isRead: boolean;
  createdAt: Date;
}

export interface SortOptions {
  field: keyof CotacaoItem | null;
  direction: 'asc' | 'desc' | null;
}
