export type ElementCategory =
  | "alkali-metal"
  | "alkaline-earth"
  | "transition-metal"
  | "post-transition"
  | "metalloid"
  | "reactive-nonmetal"
  | "halogen"
  | "noble-gas"
  | "lanthanide"
  | "actinide"
  | "unknown";

export interface ChemElement {
  Z: number;
  symbol: string;
  name: string;
  mass: number;
  category: ElementCategory;
  group: number;
  period: number;
  electronegativity?: number;
  state: "solid" | "liquid" | "gas" | "unknown";
  electrons: string;
  discovery?: number;
}

// Tuple: [Z, sym, name, mass, category, group, period, electronegativity|0, state, electrons, discovery|0]
type ETuple = [number, string, string, number, ElementCategory, number, number, number, "solid"|"liquid"|"gas"|"unknown", string, number];

const RAW: ETuple[] = [
  [1,  "H",  "Hydrogen",      1.008,   "reactive-nonmetal", 1,  1, 2.20, "gas",     "1",              1766],
  [2,  "He", "Helium",        4.003,   "noble-gas",         18, 1, 0,    "gas",     "2",              1895],
  [3,  "Li", "Lithium",       6.941,   "alkali-metal",      1,  2, 0.98, "solid",   "[He] 2s¹",       1817],
  [4,  "Be", "Beryllium",     9.012,   "alkaline-earth",    2,  2, 1.57, "solid",   "[He] 2s²",       1798],
  [5,  "B",  "Boron",         10.811,  "metalloid",         13, 2, 2.04, "solid",   "[He] 2s² 2p¹",   1808],
  [6,  "C",  "Carbon",        12.011,  "reactive-nonmetal", 14, 2, 2.55, "solid",   "[He] 2s² 2p²",   0],
  [7,  "N",  "Nitrogen",      14.007,  "reactive-nonmetal", 15, 2, 3.04, "gas",     "[He] 2s² 2p³",   1772],
  [8,  "O",  "Oxygen",        15.999,  "reactive-nonmetal", 16, 2, 3.44, "gas",     "[He] 2s² 2p⁴",   1774],
  [9,  "F",  "Fluorine",      18.998,  "halogen",           17, 2, 3.98, "gas",     "[He] 2s² 2p⁵",   1886],
  [10, "Ne", "Neon",          20.180,  "noble-gas",         18, 2, 0,    "gas",     "[He] 2s² 2p⁶",   1898],
  [11, "Na", "Sodium",        22.990,  "alkali-metal",      1,  3, 0.93, "solid",   "[Ne] 3s¹",       1807],
  [12, "Mg", "Magnesium",     24.305,  "alkaline-earth",    2,  3, 1.31, "solid",   "[Ne] 3s²",       1755],
  [13, "Al", "Aluminium",     26.982,  "post-transition",   13, 3, 1.61, "solid",   "[Ne] 3s² 3p¹",   1825],
  [14, "Si", "Silicon",       28.086,  "metalloid",         14, 3, 1.90, "solid",   "[Ne] 3s² 3p²",   1824],
  [15, "P",  "Phosphorus",    30.974,  "reactive-nonmetal", 15, 3, 2.19, "solid",   "[Ne] 3s² 3p³",   1669],
  [16, "S",  "Sulfur",        32.065,  "reactive-nonmetal", 16, 3, 2.58, "solid",   "[Ne] 3s² 3p⁴",   0],
  [17, "Cl", "Chlorine",      35.453,  "halogen",           17, 3, 3.16, "gas",     "[Ne] 3s² 3p⁵",   1774],
  [18, "Ar", "Argon",         39.948,  "noble-gas",         18, 3, 0,    "gas",     "[Ne] 3s² 3p⁶",   1894],
  [19, "K",  "Potassium",     39.098,  "alkali-metal",      1,  4, 0.82, "solid",   "[Ar] 4s¹",       1807],
  [20, "Ca", "Calcium",       40.078,  "alkaline-earth",    2,  4, 1.00, "solid",   "[Ar] 4s²",       1808],
  [21, "Sc", "Scandium",      44.956,  "transition-metal",  3,  4, 1.36, "solid",   "[Ar] 3d¹ 4s²",   1879],
  [22, "Ti", "Titanium",      47.867,  "transition-metal",  4,  4, 1.54, "solid",   "[Ar] 3d² 4s²",   1791],
  [23, "V",  "Vanadium",      50.942,  "transition-metal",  5,  4, 1.63, "solid",   "[Ar] 3d³ 4s²",   1801],
  [24, "Cr", "Chromium",      51.996,  "transition-metal",  6,  4, 1.66, "solid",   "[Ar] 3d⁵ 4s¹",   1797],
  [25, "Mn", "Manganese",     54.938,  "transition-metal",  7,  4, 1.55, "solid",   "[Ar] 3d⁵ 4s²",   1774],
  [26, "Fe", "Iron",          55.845,  "transition-metal",  8,  4, 1.83, "solid",   "[Ar] 3d⁶ 4s²",   0],
  [27, "Co", "Cobalt",        58.933,  "transition-metal",  9,  4, 1.88, "solid",   "[Ar] 3d⁷ 4s²",   1735],
  [28, "Ni", "Nickel",        58.693,  "transition-metal",  10, 4, 1.91, "solid",   "[Ar] 3d⁸ 4s²",   1751],
  [29, "Cu", "Copper",        63.546,  "transition-metal",  11, 4, 1.90, "solid",   "[Ar] 3d¹⁰ 4s¹",  0],
  [30, "Zn", "Zinc",          65.38,   "transition-metal",  12, 4, 1.65, "solid",   "[Ar] 3d¹⁰ 4s²",  1746],
  [31, "Ga", "Gallium",       69.723,  "post-transition",   13, 4, 1.81, "solid",   "[Ar] 3d¹⁰ 4s² 4p¹", 1875],
  [32, "Ge", "Germanium",     72.640,  "metalloid",         14, 4, 2.01, "solid",   "[Ar] 3d¹⁰ 4s² 4p²", 1886],
  [33, "As", "Arsenic",       74.922,  "metalloid",         15, 4, 2.18, "solid",   "[Ar] 3d¹⁰ 4s² 4p³", 0],
  [34, "Se", "Selenium",      78.971,  "reactive-nonmetal", 16, 4, 2.55, "solid",   "[Ar] 3d¹⁰ 4s² 4p⁴", 1817],
  [35, "Br", "Bromine",       79.904,  "halogen",           17, 4, 2.96, "liquid",  "[Ar] 3d¹⁰ 4s² 4p⁵", 1826],
  [36, "Kr", "Krypton",       83.798,  "noble-gas",         18, 4, 3.00, "gas",     "[Ar] 3d¹⁰ 4s² 4p⁶", 1898],
  [37, "Rb", "Rubidium",      85.468,  "alkali-metal",      1,  5, 0.82, "solid",   "[Kr] 5s¹",       1861],
  [38, "Sr", "Strontium",     87.620,  "alkaline-earth",    2,  5, 0.95, "solid",   "[Kr] 5s²",       1790],
  [39, "Y",  "Yttrium",       88.906,  "transition-metal",  3,  5, 1.22, "solid",   "[Kr] 4d¹ 5s²",   1794],
  [40, "Zr", "Zirconium",     91.224,  "transition-metal",  4,  5, 1.33, "solid",   "[Kr] 4d² 5s²",   1789],
  [41, "Nb", "Niobium",       92.906,  "transition-metal",  5,  5, 1.60, "solid",   "[Kr] 4d⁴ 5s¹",   1801],
  [42, "Mo", "Molybdenum",    95.960,  "transition-metal",  6,  5, 2.16, "solid",   "[Kr] 4d⁵ 5s¹",   1778],
  [43, "Tc", "Technetium",    98.000,  "transition-metal",  7,  5, 1.90, "solid",   "[Kr] 4d⁵ 5s²",   1937],
  [44, "Ru", "Ruthenium",     101.07,  "transition-metal",  8,  5, 2.20, "solid",   "[Kr] 4d⁷ 5s¹",   1844],
  [45, "Rh", "Rhodium",       102.906, "transition-metal",  9,  5, 2.28, "solid",   "[Kr] 4d⁸ 5s¹",   1803],
  [46, "Pd", "Palladium",     106.42,  "transition-metal",  10, 5, 2.20, "solid",   "[Kr] 4d¹⁰",      1803],
  [47, "Ag", "Silver",        107.868, "transition-metal",  11, 5, 1.93, "solid",   "[Kr] 4d¹⁰ 5s¹",  0],
  [48, "Cd", "Cadmium",       112.414, "transition-metal",  12, 5, 1.69, "solid",   "[Kr] 4d¹⁰ 5s²",  1817],
  [49, "In", "Indium",        114.818, "post-transition",   13, 5, 1.78, "solid",   "[Kr] 4d¹⁰ 5s² 5p¹", 1863],
  [50, "Sn", "Tin",           118.710, "post-transition",   14, 5, 1.96, "solid",   "[Kr] 4d¹⁰ 5s² 5p²", 0],
  [51, "Sb", "Antimony",      121.760, "metalloid",         15, 5, 2.05, "solid",   "[Kr] 4d¹⁰ 5s² 5p³", 0],
  [52, "Te", "Tellurium",     127.600, "metalloid",         16, 5, 2.10, "solid",   "[Kr] 4d¹⁰ 5s² 5p⁴", 1782],
  [53, "I",  "Iodine",        126.904, "halogen",           17, 5, 2.66, "solid",   "[Kr] 4d¹⁰ 5s² 5p⁵", 1811],
  [54, "Xe", "Xenon",         131.293, "noble-gas",         18, 5, 2.60, "gas",     "[Kr] 4d¹⁰ 5s² 5p⁶", 1898],
  [55, "Cs", "Caesium",       132.905, "alkali-metal",      1,  6, 0.79, "solid",   "[Xe] 6s¹",       1860],
  [56, "Ba", "Barium",        137.327, "alkaline-earth",    2,  6, 0.89, "solid",   "[Xe] 6s²",       1808],
  [57, "La", "Lanthanum",     138.905, "lanthanide",        3,  6, 1.10, "solid",   "[Xe] 5d¹ 6s²",   1839],
  [58, "Ce", "Cerium",        140.116, "lanthanide",        0,  6, 1.12, "solid",   "[Xe] 4f¹ 5d¹ 6s²", 1803],
  [59, "Pr", "Praseodymium",  140.908, "lanthanide",        0,  6, 1.13, "solid",   "[Xe] 4f³ 6s²",   1885],
  [60, "Nd", "Neodymium",     144.242, "lanthanide",        0,  6, 1.14, "solid",   "[Xe] 4f⁴ 6s²",   1885],
  [61, "Pm", "Promethium",    145.000, "lanthanide",        0,  6, 1.13, "solid",   "[Xe] 4f⁵ 6s²",   1945],
  [62, "Sm", "Samarium",      150.360, "lanthanide",        0,  6, 1.17, "solid",   "[Xe] 4f⁶ 6s²",   1879],
  [63, "Eu", "Europium",      151.964, "lanthanide",        0,  6, 1.20, "solid",   "[Xe] 4f⁷ 6s²",   1901],
  [64, "Gd", "Gadolinium",    157.250, "lanthanide",        0,  6, 1.20, "solid",   "[Xe] 4f⁷ 5d¹ 6s²", 1880],
  [65, "Tb", "Terbium",       158.925, "lanthanide",        0,  6, 1.10, "solid",   "[Xe] 4f⁹ 6s²",   1843],
  [66, "Dy", "Dysprosium",    162.500, "lanthanide",        0,  6, 1.22, "solid",   "[Xe] 4f¹⁰ 6s²",  1886],
  [67, "Ho", "Holmium",       164.930, "lanthanide",        0,  6, 1.23, "solid",   "[Xe] 4f¹¹ 6s²",  1878],
  [68, "Er", "Erbium",        167.259, "lanthanide",        0,  6, 1.24, "solid",   "[Xe] 4f¹² 6s²",  1843],
  [69, "Tm", "Thulium",       168.934, "lanthanide",        0,  6, 1.25, "solid",   "[Xe] 4f¹³ 6s²",  1879],
  [70, "Yb", "Ytterbium",     173.045, "lanthanide",        0,  6, 1.10, "solid",   "[Xe] 4f¹⁴ 6s²",  1878],
  [71, "Lu", "Lutetium",      174.967, "lanthanide",        3,  6, 1.27, "solid",   "[Xe] 4f¹⁴ 5d¹ 6s²", 1907],
  [72, "Hf", "Hafnium",       178.490, "transition-metal",  4,  6, 1.30, "solid",   "[Xe] 4f¹⁴ 5d² 6s²", 1923],
  [73, "Ta", "Tantalum",      180.948, "transition-metal",  5,  6, 1.50, "solid",   "[Xe] 4f¹⁴ 5d³ 6s²", 1802],
  [74, "W",  "Tungsten",      183.840, "transition-metal",  6,  6, 2.36, "solid",   "[Xe] 4f¹⁴ 5d⁴ 6s²", 1783],
  [75, "Re", "Rhenium",       186.207, "transition-metal",  7,  6, 1.90, "solid",   "[Xe] 4f¹⁴ 5d⁵ 6s²", 1925],
  [76, "Os", "Osmium",        190.230, "transition-metal",  8,  6, 2.20, "solid",   "[Xe] 4f¹⁴ 5d⁶ 6s²", 1803],
  [77, "Ir", "Iridium",       192.217, "transition-metal",  9,  6, 2.20, "solid",   "[Xe] 4f¹⁴ 5d⁷ 6s²", 1803],
  [78, "Pt", "Platinum",      195.084, "transition-metal",  10, 6, 2.28, "solid",   "[Xe] 4f¹⁴ 5d⁹ 6s¹", 1735],
  [79, "Au", "Gold",          196.967, "transition-metal",  11, 6, 2.54, "solid",   "[Xe] 4f¹⁴ 5d¹⁰ 6s¹", 0],
  [80, "Hg", "Mercury",       200.592, "transition-metal",  12, 6, 2.00, "liquid",  "[Xe] 4f¹⁴ 5d¹⁰ 6s²", 0],
  [81, "Tl", "Thallium",      204.383, "post-transition",   13, 6, 1.62, "solid",   "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p¹", 1861],
  [82, "Pb", "Lead",          207.200, "post-transition",   14, 6, 2.33, "solid",   "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p²", 0],
  [83, "Bi", "Bismuth",       208.980, "post-transition",   15, 6, 2.02, "solid",   "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p³", 0],
  [84, "Po", "Polonium",      209.000, "post-transition",   16, 6, 2.00, "solid",   "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁴", 1898],
  [85, "At", "Astatine",      210.000, "halogen",           17, 6, 2.20, "solid",   "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁵", 1940],
  [86, "Rn", "Radon",         222.000, "noble-gas",         18, 6, 0,    "gas",     "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁶", 1900],
  [87, "Fr", "Francium",      223.000, "alkali-metal",      1,  7, 0.70, "solid",   "[Rn] 7s¹",       1939],
  [88, "Ra", "Radium",        226.000, "alkaline-earth",    2,  7, 0.90, "solid",   "[Rn] 7s²",       1898],
  [89, "Ac", "Actinium",      227.000, "actinide",          3,  7, 1.10, "solid",   "[Rn] 6d¹ 7s²",   1899],
  [90, "Th", "Thorium",       232.038, "actinide",          0,  7, 1.30, "solid",   "[Rn] 6d² 7s²",   1829],
  [91, "Pa", "Protactinium",  231.036, "actinide",          0,  7, 1.50, "solid",   "[Rn] 5f² 6d¹ 7s²", 1913],
  [92, "U",  "Uranium",       238.029, "actinide",          0,  7, 1.38, "solid",   "[Rn] 5f³ 6d¹ 7s²", 1789],
  [93, "Np", "Neptunium",     237.000, "actinide",          0,  7, 1.36, "solid",   "[Rn] 5f⁴ 6d¹ 7s²", 1940],
  [94, "Pu", "Plutonium",     244.000, "actinide",          0,  7, 1.28, "solid",   "[Rn] 5f⁶ 7s²",   1940],
  [95, "Am", "Americium",     243.000, "actinide",          0,  7, 1.30, "solid",   "[Rn] 5f⁷ 7s²",   1944],
  [96, "Cm", "Curium",        247.000, "actinide",          0,  7, 1.30, "solid",   "[Rn] 5f⁷ 6d¹ 7s²", 1944],
  [97, "Bk", "Berkelium",     247.000, "actinide",          0,  7, 1.30, "solid",   "[Rn] 5f⁹ 7s²",   1949],
  [98, "Cf", "Californium",   251.000, "actinide",          0,  7, 1.30, "solid",   "[Rn] 5f¹⁰ 7s²",  1950],
  [99, "Es", "Einsteinium",   252.000, "actinide",          0,  7, 1.30, "solid",   "[Rn] 5f¹¹ 7s²",  1952],
  [100,"Fm", "Fermium",       257.000, "actinide",          0,  7, 1.30, "unknown", "[Rn] 5f¹² 7s²",  1952],
  [101,"Md", "Mendelevium",   258.000, "actinide",          0,  7, 1.30, "unknown", "[Rn] 5f¹³ 7s²",  1955],
  [102,"No", "Nobelium",      259.000, "actinide",          0,  7, 1.30, "unknown", "[Rn] 5f¹⁴ 7s²",  1958],
  [103,"Lr", "Lawrencium",    262.000, "actinide",          3,  7, 1.30, "unknown", "[Rn] 5f¹⁴ 7p¹",  1961],
  [104,"Rf", "Rutherfordium", 267.000, "transition-metal",  4,  7, 0,    "unknown", "[Rn] 5f¹⁴ 6d² 7s²", 1964],
  [105,"Db", "Dubnium",       268.000, "transition-metal",  5,  7, 0,    "unknown", "[Rn] 5f¹⁴ 6d³ 7s²", 1970],
  [106,"Sg", "Seaborgium",    271.000, "transition-metal",  6,  7, 0,    "unknown", "[Rn] 5f¹⁴ 6d⁴ 7s²", 1974],
  [107,"Bh", "Bohrium",       272.000, "transition-metal",  7,  7, 0,    "unknown", "[Rn] 5f¹⁴ 6d⁵ 7s²", 1981],
  [108,"Hs", "Hassium",       270.000, "transition-metal",  8,  7, 0,    "unknown", "[Rn] 5f¹⁴ 6d⁶ 7s²", 1984],
  [109,"Mt", "Meitnerium",    276.000, "unknown",           9,  7, 0,    "unknown", "[Rn] 5f¹⁴ 6d⁷ 7s²", 1982],
  [110,"Ds", "Darmstadtium",  281.000, "unknown",           10, 7, 0,    "unknown", "[Rn] 5f¹⁴ 6d⁸ 7s²", 1994],
  [111,"Rg", "Roentgenium",   280.000, "unknown",           11, 7, 0,    "unknown", "[Rn] 5f¹⁴ 6d⁹ 7s²", 1994],
  [112,"Cn", "Copernicium",   285.000, "transition-metal",  12, 7, 0,    "unknown", "[Rn] 5f¹⁴ 6d¹⁰ 7s²", 1996],
  [113,"Nh", "Nihonium",      284.000, "post-transition",   13, 7, 0,    "unknown", "[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p¹", 2004],
  [114,"Fl", "Flerovium",     289.000, "post-transition",   14, 7, 0,    "unknown", "[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p²", 1999],
  [115,"Mc", "Moscovium",     288.000, "post-transition",   15, 7, 0,    "unknown", "[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p³", 2003],
  [116,"Lv", "Livermorium",   293.000, "post-transition",   16, 7, 0,    "unknown", "[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁴", 2000],
  [117,"Ts", "Tennessine",    294.000, "halogen",           17, 7, 0,    "unknown", "[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁵", 2010],
  [118,"Og", "Oganesson",     294.000, "noble-gas",         18, 7, 0,    "unknown", "[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁶", 2002],
];

export const ELEMENTS: ChemElement[] = RAW.map(([Z, symbol, name, mass, category, group, period, en, state, electrons, discovery]) => ({
  Z, symbol, name, mass, category, group, period,
  electronegativity: en > 0 ? en : undefined,
  state, electrons,
  discovery: discovery > 0 ? discovery : undefined,
}));

export const ELEMENT_BY_SYMBOL: Record<string, ChemElement> = Object.fromEntries(ELEMENTS.map(e => [e.symbol, e]));
export const ELEMENT_BY_Z: Record<number, ChemElement> = Object.fromEntries(ELEMENTS.map(e => [e.Z, e]));

export const CATEGORY_COLORS: Record<ElementCategory, { bg: string; border: string; text: string; label: string }> = {
  "alkali-metal":      { bg: "rgba(239,68,68,0.18)",   border: "rgba(239,68,68,0.4)",   text: "#fca5a5", label: "Alkali Metal" },
  "alkaline-earth":    { bg: "rgba(249,115,22,0.18)",  border: "rgba(249,115,22,0.4)",  text: "#fdba74", label: "Alkaline Earth" },
  "transition-metal":  { bg: "rgba(234,179,8,0.18)",   border: "rgba(234,179,8,0.35)",  text: "#fde047", label: "Transition Metal" },
  "post-transition":   { bg: "rgba(132,204,22,0.18)",  border: "rgba(132,204,22,0.35)", text: "#bef264", label: "Post-Transition Metal" },
  "metalloid":         { bg: "rgba(20,184,166,0.18)",  border: "rgba(20,184,166,0.35)", text: "#5eead4", label: "Metalloid" },
  "reactive-nonmetal": { bg: "rgba(59,130,246,0.18)",  border: "rgba(59,130,246,0.35)", text: "#93c5fd", label: "Reactive Nonmetal" },
  "halogen":           { bg: "rgba(168,85,247,0.18)",  border: "rgba(168,85,247,0.35)", text: "#d8b4fe", label: "Halogen" },
  "noble-gas":         { bg: "rgba(236,72,153,0.18)",  border: "rgba(236,72,153,0.35)", text: "#f9a8d4", label: "Noble Gas" },
  "lanthanide":        { bg: "rgba(14,165,233,0.18)",  border: "rgba(14,165,233,0.35)", text: "#7dd3fc", label: "Lanthanide" },
  "actinide":          { bg: "rgba(99,102,241,0.18)",  border: "rgba(99,102,241,0.35)", text: "#a5b4fc", label: "Actinide" },
  "unknown":           { bg: "rgba(100,116,139,0.18)", border: "rgba(100,116,139,0.35)", text: "#94a3b8", label: "Unknown" },
};
