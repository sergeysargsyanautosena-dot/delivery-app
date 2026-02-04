export type ProductGroupKey = "FLAMINGO" | "NIKEN" | "MONAER" | "TOBYS";

export type Product = {
  id: string;
  code: string;      // Կոդ
  specCode: string;  // Բնութագիր կոդ
  name: string;      // Անվանում
  stock: number;     // Մնացորդ
  price: number;     // Գին (AMD)
  group: ProductGroupKey;
};

export const GROUPS: { key: ProductGroupKey; title: string }[] = [
  { key: "FLAMINGO", title: "Flamingo" },
  { key: "NIKEN", title: "Niken" },
  { key: "MONAER", title: "Monaer" },
  { key: "TOBYS", title: "Tobys" },
];

// Default seed (կփոխվի Admin Update-ով)
export const PRODUCTS: Product[] = [
  {
    id: "p1",
    code: "4851234567890",
    specCode: "F012",
    name: "Ապրանք 1",
    stock: 50,
    price: 12000,
    group: "MONAER",
  },
  {
    id: "p2",
    code: "4850001112223",
    specCode: "F045",
    name: "Ապրանք 2",
    stock: 20,
    price: 7500,
    group: "MONAER",
  },
  {
    id: "p3",
    code: "4859998887776",
    specCode: "F099",
    name: "Ապրանք 3",
    stock: 15,
    price: 9900,
    group: "NIKEN",
  },
];
