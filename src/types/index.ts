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
}

export interface SummaryStats {
  totalItems: number;
  totalValue: number;
  totalCBM: number;
}

export interface FilterOptions {
  searchTerm: string;
  shopFilter: string;
  photoNoFilter: string;
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
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}
