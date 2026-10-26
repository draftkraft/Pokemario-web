(() => {
"use strict";
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const W = 800, H = 480, DPR = Math.min(2, window.devicePixelRatio || 1); // scharfe Darstellung auf Retina
canvas.width = W * DPR; canvas.height = H * DPR; ctx.scale(DPR, DPR);
const TILE = 40;
const GRAVITY = 0.6, MOVE = 0.7, MAX_VX = 4.5, JUMP = -13, FRICTION = 0.82;

// =====================================================================
// Pokémon-Daten
// =====================================================================
const TYPE_COLOR = { elektro: "#f8d030", feuer: "#f08030", wasser: "#6890f0", pflanze: "#78c850", gift: "#a040a0", flug: "#a890f0", normal: "#a8a878", psycho: "#f85888", gestein: "#b8a038", boden: "#e0c068", eis: "#98d8d8", geist: "#705898" };
const EFFECT = {
  elektro: { wasser: 2, flug: 2, pflanze: .5, elektro: .5, boden: 0 },
  feuer:   { pflanze: 2, eis: 2, wasser: .5, feuer: .5, gestein: .5 },
  wasser:  { feuer: 2, gestein: 2, boden: 2, pflanze: .5, wasser: .5 },
  pflanze: { wasser: 2, gestein: 2, boden: 2, feuer: .5, flug: .5, gift: .5, pflanze: .5 },
  flug:    { pflanze: 2, elektro: .5, gestein: .5 },
  gift:    { pflanze: 2, gift: .5, gestein: .5, boden: .5 },
  psycho:  { gift: 2, psycho: .5 },
  gestein: { feuer: 2, flug: 2, eis: 2, boden: .5 },
  eis:     { pflanze: 2, flug: 2, boden: 2, wasser: .5, feuer: .5, eis: .5 },
  boden:   { feuer: 2, elektro: 2, gift: 2, gestein: 2, pflanze: .5, flug: 0 },
  geist:   { geist: 2, psycho: 2, normal: 0 },
  normal:  { gestein: .5, geist: 0 },
};
const MOVES = {
  tackle:       { name: "Tackle",        type: "normal",  power: 35 },
  biss:         { name: "Biss",          type: "normal",  power: 50 },
  donnerschock: { name: "Donnerschock",  type: "elektro", power: 40 },
  donner:       { name: "Donner",        type: "elektro", power: 75 },
  glut:         { name: "Glut",          type: "feuer",   power: 40 },
  flammenwurf:  { name: "Flammenwurf",   type: "feuer",   power: 75 },
  aquaknarre:   { name: "Aquaknarre",    type: "wasser",  power: 40 },
  hydropumpe:   { name: "Hydropumpe",    type: "wasser",  power: 75 },
  rankenhieb:   { name: "Rankenhieb",    type: "pflanze", power: 40 },
  solarstrahl:  { name: "Solarstrahl",   type: "pflanze", power: 75 },
  giftstachel:  { name: "Giftstachel",   type: "gift",    power: 35 },
  windstoss:    { name: "Windstoß",      type: "flug",    power: 40 },
  fluegelschlag:{ name: "Flügelschlag",  type: "flug",    power: 60 },
  pfund:        { name: "Pfund",         type: "normal",  power: 40 },
  psychokinese: { name: "Psychokinese",  type: "psycho",  power: 50 },
  kichern:      { name: "Kichern",       type: "normal",  power: 0, flavor: "Mew kichert und schwebt neugierig um dich herum!" },
  steinwurf:    { name: "Steinwurf",     type: "gestein", power: 50 },
  schaufler:    { name: "Schaufler",     type: "boden",   power: 55 },
  kratzer:      { name: "Kratzer",       type: "normal",  power: 40 },
  bodyslam:     { name: "Bodyslam",      type: "normal",  power: 70 },
  schnarcher:   { name: "Schnarcher",    type: "normal",  power: 40 },
  laubklinge:   { name: "Laubklinge",    type: "pflanze", power: 55 },
  faustschlag:  { name: "Faustschlag",   type: "normal",  power: 60 },
  spucke:       { name: "Spucke",        type: "wasser",  power: 45 },
  huftritt:     { name: "Huftritt",      type: "normal",  power: 50 },
  feuerpranke:  { name: "Feuerpranke",   type: "feuer",   power: 60 },
  koenigsbrueller:{ name: "Königsbrüller", type: "normal", power: 55 },
  platscher:    { name: "Platscher",     type: "normal",  power: 0, flavor: "Karpador platscht nur hilflos herum!" },
  wirbel:       { name: "Wasserwirbel",  type: "wasser",  power: 55 },
  eissturm:     { name: "Eissturm",      type: "eis",     power: 65 },
  nachtnebel:   { name: "Nachtnebel",    type: "geist",   power: 40 },
  schattenball: { name: "Schattenball",  type: "geist",   power: 70 },
  zungenschlag: { name: "Zungenschlag",  type: "normal",  power: 30 },
};
// look: Zeichenparameter für den generischen Sprite-Zeichner
const SPECIES = {
  pikachu:   { name: "Pikachu",   type: "elektro", hp: 35, atk: 55, def: 40, moves: ["donnerschock", "tackle"], evolve: { level: 10, to: "raichu" },
               look: { body: "#f5c518", dark: "#8b5a2b", feet: "#e0a800", size: 1, ears: "pika", tail: "pika", cheeks: "#e3350d", stripes: true } },
  raichu:    { name: "Raichu",    type: "elektro", hp: 60, atk: 90, def: 55, moves: ["donner", "biss"],
               look: { body: "#f0a030", belly: "#fde8b0", dark: "#7a4a1a", size: 1.25, ears: "raichu", tail: "bolt", cheeks: "#f8e030" } },
  glumanda:  { name: "Glumanda",  type: "feuer",   hp: 39, atk: 52, def: 43, moves: ["glut", "tackle"], evolve: { level: 8, to: "glutexo" },
               look: { body: "#f08030", belly: "#ffd98c", dark: "#c05020", size: 1, tail: "flame", eye: "#2060c0" } },
  glutexo:   { name: "Glutexo",   type: "feuer",   hp: 58, atk: 64, def: 58, moves: ["glut", "biss"], evolve: { level: 14, to: "glurak" },
               look: { body: "#d84838", belly: "#ffd98c", dark: "#902818", size: 1.25, tail: "flame", horns: 1, eye: "#2060c0" } },
  glurak:    { name: "Glurak",    type: "feuer",   hp: 78, atk: 84, def: 78, moves: ["flammenwurf", "fluegelschlag"],
               look: { body: "#f08030", belly: "#ffd98c", dark: "#b05020", size: 1.5, tail: "flame", horns: 2, wings: "#2a9d8f", eye: "#2060c0" } },
  zubat:     { name: "Zubat",     type: "gift",    hp: 40, atk: 45, def: 35, moves: ["giftstachel", "windstoss"], evolve: { level: 8, to: "golbat" },
               look: { kind: "bat", body: "#6a5acd", belly: "#c0b0e8", size: 1 } },
  golbat:    { name: "Golbat",    type: "gift",    hp: 75, atk: 80, def: 70, moves: ["biss", "fluegelschlag"],
               look: { kind: "bat", body: "#4a3aa8", belly: "#d0c0f0", size: 1.5, eyes: true } },
  schiggy:   { name: "Schiggy",   type: "wasser",  hp: 44, atk: 48, def: 65, moves: ["aquaknarre", "tackle"], evolve: { level: 8, to: "schillok" },
               look: { body: "#78c8f0", belly: "#fde8b0", dark: "#3878a0", size: 1, tail: "curl", back: "shell", shell: "#b07838", eye: "#602010" } },
  schillok:  { name: "Schillok",  type: "wasser",  hp: 59, atk: 63, def: 80, moves: ["aquaknarre", "biss"], evolve: { level: 14, to: "turtok" },
               look: { body: "#5898d8", belly: "#fde8b0", dark: "#305080", size: 1.25, tail: "fluff", ears: "fluff", back: "shell", shell: "#c09050", eye: "#602010" } },
  turtok:    { name: "Turtok",    type: "wasser",  hp: 79, atk: 83, def: 100, moves: ["hydropumpe", "biss"],
               look: { body: "#4878b8", belly: "#fde8b0", dark: "#284070", size: 1.5, tail: "curl", back: "shell", shell: "#a07840", cannons: true, eye: "#602010" } },
  bisasam:   { name: "Bisasam",   type: "pflanze", hp: 45, atk: 49, def: 49, moves: ["rankenhieb", "tackle"], evolve: { level: 8, to: "bisaknosp" },
               look: { body: "#78c8a0", dark: "#2a7050", size: 1, ears: "small", back: "bulb", bulb: "#3a9a5a", eye: "#c03030" } },
  bisaknosp: { name: "Bisaknosp", type: "pflanze", hp: 60, atk: 62, def: 63, moves: ["rankenhieb", "tackle"], evolve: { level: 14, to: "bisaflor" },
               look: { body: "#58b890", dark: "#205840", size: 1.25, ears: "small", back: "bud", bulb: "#f070a0", eye: "#c03030" } },
  bisaflor:  { name: "Bisaflor",  type: "pflanze", hp: 80, atk: 82, def: 83, moves: ["solarstrahl", "tackle"],
               look: { body: "#48a880", dark: "#184830", size: 1.5, ears: "small", back: "flower", bulb: "#f05080", eye: "#c03030" } },
  pummeluff: { name: "Pummeluff", type: "normal",  hp: 85, atk: 45, def: 20, moves: ["pfund", "tackle"], evolve: { level: 12, to: "knuddeluff" },
               look: { body: "#f9c6e0", dark: "#c0608f", size: 1, ears: "small", curl: true, eye: "#3aa0d8" } },
  knuddeluff:{ name: "Knuddeluff", type: "normal", hp: 110, atk: 70, def: 45, moves: ["pfund", "biss"],
               look: { body: "#f8a8cc", dark: "#b0507f", size: 1.3, ears: "fluff", belly: "#fde8f0", curl: true, eye: "#3aa0d8" } },
  mew:       { name: "Mew",       type: "psycho",  hp: 100, atk: 60, def: 90, moves: ["psychokinese", "kichern"], wildMove: 1,
               look: { body: "#f9bfe0", belly: "#fde6f3", dark: "#d890b8", size: 1.1, ears: "small", tail: "curl", sparkle: true, eye: "#3050c0" } },
  kleinstein:{ name: "Kleinstein", type: "gestein", hp: 40, atk: 60, def: 100, moves: ["steinwurf", "tackle"], evolve: { level: 12, to: "georok" },
               look: { kind: "rock", body: "#9a9a8a", dark: "#5a5a50", size: 1 } },
  georok:    { name: "Georok",    type: "gestein", hp: 55, atk: 85, def: 115, moves: ["steinwurf", "biss"],
               look: { kind: "rock", body: "#8a8a7a", dark: "#4a4a40", size: 1.4, arms: 2 } },
  sandan:    { name: "Sandan",    type: "boden",   hp: 50, atk: 60, def: 85, moves: ["schaufler", "kratzer"], evolve: { level: 12, to: "sandamer" },
               look: { body: "#e8c860", belly: "#f8f0c0", dark: "#a08030", size: 1, ears: "small", eye: "#222" } },
  sandamer:  { name: "Sandamer",  type: "boden",   hp: 75, atk: 90, def: 110, moves: ["schaufler", "biss"],
               look: { body: "#d8b040", belly: "#f8f0c0", dark: "#806020", size: 1.3, ears: "small", horns: 2, eye: "#222" } },
  onix:      { name: "Onix",      type: "gestein", hp: 35, atk: 45, def: 160, moves: ["steinwurf", "tackle"],
               look: { kind: "snake", body: "#a8a8a0", dark: "#60605a", size: 1.8 } },
  relaxo:    { name: "Relaxo",    type: "normal",  hp: 160, atk: 110, def: 65, moves: ["bodyslam", "schnarcher"],
               look: { kind: "relaxo", body: "#3f6f80", belly: "#f3e3c3", dark: "#2a4a58", size: 1.6 } },
  chimpex:   { name: "Chimpex",   type: "pflanze", hp: 90, atk: 80, def: 70, moves: ["laubklinge", "faustschlag"],
               look: { body: "#8a5a2b", belly: "#e8c9a0", dark: "#4a2e12", size: 1.5, ears: "fluff", leaf: true, eye: "#222" } },
  rattfratz: { name: "Rattfratz", type: "normal",  hp: 30, atk: 56, def: 35, moves: ["tackle", "biss"], evolve: { level: 12, to: "rattikarl" },
               look: { body: "#9b72b8", belly: "#e8d8f0", dark: "#5a3a78", size: 1, ears: "small", tail: "thin", teeth: true, eye: "#222" } },
  rattikarl: { name: "Rattikarl", type: "normal",  hp: 55, atk: 81, def: 60, moves: ["biss", "tackle"],
               look: { body: "#8a6a48", belly: "#e8dcc8", dark: "#4a3420", size: 1.3, ears: "small", tail: "thin", teeth: true, eye: "#222" } },
  taubsi:    { name: "Taubsi",    type: "flug",    hp: 40, atk: 45, def: 40, moves: ["windstoss", "tackle"], evolve: { level: 12, to: "tauboga" },
               look: { kind: "bird", body: "#c8a878", belly: "#f0e0c8", dark: "#806040", size: 1 } },
  tauboga:   { name: "Tauboga",   type: "flug",    hp: 63, atk: 60, def: 55, moves: ["fluegelschlag", "tackle"],
               look: { kind: "bird", body: "#b08858", belly: "#f0e0c8", dark: "#604020", size: 1.4, crest: true } },
  flegmon:   { name: "Flegmon",   type: "wasser",  type2: "psycho", hp: 90, atk: 65, def: 65, moves: ["aquaknarre", "tackle"], evolve: { level: 16, to: "lahmus" },
               look: { body: "#f2a0b8", belly: "#f8e8d0", dark: "#c06080", size: 1.1, ears: "small", tail: "thin", sleepyEyes: true, eye: "#222" } },
  lahmus:    { name: "Lahmus",    type: "wasser",  type2: "psycho", hp: 95, atk: 75, def: 110, moves: ["psychokinese", "aquaknarre"],
               look: { kind: "slowbro", body: "#f2a0b8", belly: "#f8e8d0", dark: "#c06080", size: 1.5 } },
  laschoking:{ name: "Laschoking", type: "wasser", type2: "psycho", hp: 95, atk: 75, def: 80, moves: ["psychokinese", "wirbel"],
               look: { kind: "slowking", body: "#f2a0b8", belly: "#f8e8d0", dark: "#c06080", size: 1.5 } },
  karpador:  { name: "Karpador",  type: "wasser",  hp: 20, atk: 10, def: 55, moves: ["tackle", "platscher"], wildMove: 1, evolve: { level: 14, to: "garados" },
               look: { kind: "fish", body: "#e8503a", belly: "#f8e0b0", dark: "#a03020", size: 1 } },
  garados:   { name: "Garados",   type: "wasser",  hp: 95, atk: 125, def: 79, moves: ["wirbel", "biss"],
               look: { kind: "snake", body: "#3a6fd8", dark: "#1a3a8a", size: 2 } },
  tentacha:  { name: "Tentacha",  type: "gift",    hp: 40, atk: 40, def: 35, moves: ["giftstachel", "aquaknarre"], evolve: { level: 14, to: "tentoxa" },
               look: { kind: "jelly", body: "#6aa8e8", dark: "#c03060", size: 1 } },
  tentoxa:   { name: "Tentoxa",   type: "gift",    hp: 80, atk: 70, def: 65, moves: ["giftstachel", "wirbel"],
               look: { kind: "jelly", body: "#4a78c8", dark: "#a02050", size: 1.5 } },
  lapras:    { name: "Lapras",    type: "wasser",  type2: "eis", hp: 130, atk: 85, def: 80, moves: ["wirbel", "eissturm"],
               look: { kind: "lapras", body: "#5a8fd6", belly: "#f0e6c8", dark: "#2f5aa8", shell: "#b8a888", size: 1.8 } },
  nebulak:   { name: "Nebulak",   type: "geist",   type2: "gift", hp: 30, atk: 35, def: 30, moves: ["nachtnebel", "zungenschlag"], evolve: { level: 14, to: "alpollo" },
               look: { kind: "ghost", body: "#6a4a9a", dark: "#3a2060", size: 1 } },
  alpollo:   { name: "Alpollo",   type: "geist",   type2: "gift", hp: 45, atk: 50, def: 45, moves: ["nachtnebel", "giftstachel"],
               look: { kind: "ghost", body: "#5a3a8a", dark: "#2a1050", size: 1.3, hands: true } },
  gengar:    { name: "Gengar",    type: "geist",   type2: "gift", hp: 60, atk: 65, def: 60, moves: ["schattenball", "nachtnebel"],
               look: { kind: "ghost", body: "#4a2a7a", dark: "#20103a", size: 1.5, hands: true, spiky: true, redEyes: true } },
  mewtu:     { name: "Mewtu",     type: "psycho",  hp: 106, atk: 110, def: 90, moves: ["psychokinese", "schattenball"],
               look: { kind: "mewtwo", body: "#cfc6e6", belly: "#8a60c0", dark: "#6a48a0", size: 1.7 } },
  arktos:    { name: "Arktos",    type: "eis",     type2: "flug", hp: 90, atk: 85, def: 100, moves: ["eissturm", "fluegelschlag"],
               look: { kind: "bird", body: "#8fd3ff", belly: "#e8f6ff", dark: "#4a90c8", size: 2.1, crest: true, crestColor: "#2f6fb0" } },
};
const DIFFS = {
  leichter: { key: "leichter", name: "Leichter", label: "leichter", color: "#2e8b57", mascot: "pikachu", lives: 5, balls: 5, lvl: -1, dmgTaken: 0.7, dmgDealt: 1.15, catchBonus: 0.15, pickupHeal: 0.5, enemySpeed: 1,
              info: ["5 Leben, 5 Pokébälle", "Gegner etwas schwächer", "Du machst mehr Schaden", "Fangen klappt leichter", "Pokébälle heilen 50 %"] },
  schwerer: { key: "schwerer", name: "Schwerer", label: "schwerer", color: "#c0392b", mascot: "glurak", lives: 3, balls: 2, lvl: 1, dmgTaken: 1.25, dmgDealt: 1, catchBonus: -0.1, pickupHeal: 0.1, enemySpeed: 1.35,
              info: ["3 Leben, 2 Pokébälle", "Gegner stärker & schneller", "Gegner machen mehr Schaden", "Fangen ist schwerer", "Pokébälle heilen nur 10 %"] },
};
let diff = DIFFS.leichter, titleSel = 0;
const WILD_TILES = { g: "glumanda", z: "zubat", w: "schiggy", b: "bisasam", j: "pummeluff", m: "mew", k: "kleinstein", d: "sandan", r: "rattfratz", u: "flegmon" };
const FLYER_TILES = { z: "zubat", a: "taubsi", n: "nebulak" };
const SWIMMER_TILES = { q: "karpador", e: "tentacha" };
const AIR_MAX = 14 * 60;
// Gemeinfreie Werke von Künstlerinnen (Wikimedia Commons), als Daten-URLs eingebettet
const ART = [
  { id: "hildegard", artist: "Hildegard von Bingen", title: "Hildegard empfängt eine Vision (Scivias)", year: "um 1151", epoch: "Mittelalter", source: "Hildegard von Bingen.jpg",
    data: "./assets/museum.2609aa40c19ec8b0.jpg" },
  { id: "anguissola", artist: "Sofonisba Anguissola", title: "Das Schachspiel", year: "1555", epoch: "Renaissance", source: "The Chess Game (Sofonisba Anguissola) 1555 (4096x3236px).jpg",
    data: "./assets/museum.5787909895489415.jpg" },
  { id: "fontana", artist: "Lavinia Fontana", title: "Selbstbildnis am Spinett", year: "1577", epoch: "Renaissance", source: "Lavinia Fontana - Self-Portrait at the Spinet - WGA07985.jpg",
    data: "./assets/museum.4e3bc847843f2e3c.jpg" },
  { id: "gentileschi", artist: "Artemisia Gentileschi", title: "Selbstbildnis als Allegorie der Malerei", year: "1638", epoch: "Barock", source: "Self-portrait as the Allegory of Painting (La Pittura) - Artemisia Gentileschi.jpg",
    data: "./assets/museum.c12dc2f37324a74d.jpg" },
  { id: "leyster", artist: "Judith Leyster", title: "Selbstbildnis", year: "um 1630", epoch: "Barock", source: "Judith Leyster - Self-Portrait - Google Art Project.jpg",
    data: "./assets/museum.7e76730f15485609.jpg" },
  { id: "peeters", artist: "Clara Peeters", title: "Stillleben mit Käse, Mandeln und Brezeln", year: "um 1615", epoch: "Barock", source: "Clara Peeters - Still Life with Cheeses, Almonds and Pretzels.jpg",
    data: "./assets/museum.5849366641246c2f.jpg" },
  { id: "ruysch", artist: "Rachel Ruysch", title: "Blumen in einer Vase", year: "um 1685", epoch: "Barock", source: "Rachel Ruysch - Flowers in a vase - NG 6425.jpg",
    data: "./assets/museum.89d2aa404b3740e8.jpg" },
  { id: "vigee", artist: "Élisabeth Vigée Le Brun", title: "Selbstbildnis mit Strohhut", year: "1782", epoch: "Rokoko", source: "Self-portrait in a Straw Hat by Elisabeth-Louise Vigée-Lebrun.jpg",
    data: "./assets/museum.8d0778c26e9ac944.jpg" },
  { id: "kauffmann", artist: "Angelika Kauffmann", title: "Selbstbildnis am Scheideweg zwischen Musik und Malerei", year: "1794", epoch: "Klassizismus", source: "Angelica Kauffmann (1741-1807) - Self Portrait of the Artist Hesitating between the Arts of Music and Painting - 960079 - National Trust.jpg",
    data: "./assets/museum.7c5ce0cbc5ef5a85.jpg" },
  { id: "bonheur", artist: "Rosa Bonheur", title: "Der Pferdemarkt", year: "1855", epoch: "Realismus", source: "Rosa Bonheur, The Horse Fair, 1852–55.jpg",
    data: "./assets/museum.d71fe940f1a7f559.jpg" },
  { id: "morisot", artist: "Berthe Morisot", title: "Die Wiege", year: "1872", epoch: "Impressionismus", source: "Berthe Morisot - The Cradle - Google Art Project.jpg",
    data: "./assets/museum.852781767baffdb6.jpg" },
  { id: "cassatt", artist: "Mary Cassatt", title: "Das Bad des Kindes", year: "1893", epoch: "Impressionismus", source: "Mary Cassatt - The Child's Bath - Google Art Project.jpg",
    data: "./assets/museum.9a55917669171cce.jpg" },
  { id: "bashkirtseff", artist: "Marie Bashkirtseff", title: "Im Atelier", year: "1881", epoch: "Realismus", source: "Bashkirtseff - In the Studio.jpg",
    data: "./assets/museum.b071145074702963.jpg" },
  { id: "modersohn", artist: "Paula Modersohn-Becker", title: "Selbstbildnis mit Hut und Schleier", year: "1906", epoch: "Expressionismus", source: "Paula Modersohn-Becker - Self-portrait with hat and veil - Google Art Project.jpg",
    data: "./assets/museum.a76ae90a91d75dcb.jpg" },
  { id: "kollwitz", artist: "Käthe Kollwitz", title: "Selbstbildnis (Lithografie)", year: "1924", epoch: "Expressionismus", source: "Käthe Kollwitz - Selbstbildnis (Self-portrait). Lithograph, 1924.jpg",
    data: "./assets/museum.98bfacd79849f160.jpg" },
  { id: "afklint", artist: "Hilma af Klint", title: "Die zehn Größten, Nr. 9, Das Alter", year: "1907", epoch: "Moderne (Abstraktion)", source: "Hilma af Klint - The Ten Largest No. 9 - 1907.jpg",
    data: "./assets/museum.c8115b667de4279b.jpg" },
  { id: "valadon", artist: "Suzanne Valadon", title: "Das blaue Zimmer", year: "1923", epoch: "Moderne", source: "(Barcelona) La chambre bleue - Suzanne Valadon.jpg",
    data: "./assets/museum.f04427e218abee82.jpg" }
];


const sp = m => SPECIES[m.key];
const monName = m => sp(m).name;
const calcMaxHp = m => Math.floor(sp(m).hp * m.level / 25) + m.level + 10;
const calcAtk = m => Math.floor(sp(m).atk * m.level / 25) + 5;
const calcDef = m => Math.floor(sp(m).def * m.level / 25) + 5;
const xpNeeded = m => m.level * 12;
function makeMon(key, level) { const m = { key, level, xp: 0 }; m.maxHp = calcMaxHp(m); m.hp = m.maxHp; return m; }
function typeEff(mt, mon) { const s = sp(mon), e1 = (EFFECT[mt] || {})[s.type] ?? 1, e2 = s.type2 ? ((EFFECT[mt] || {})[s.type2] ?? 1) : 1; return e1 * e2; }
function calcDamage(att, def, move, mult = 1) {
  const eff = typeEff(move.type, def);
  const stab = (sp(att).type === move.type || sp(att).type2 === move.type) ? 1.5 : 1;
  const base = ((2 * att.level / 5 + 2) * move.power * calcAtk(att) / calcDef(def)) / 30 + 2;
  const crit = Math.random() < 0.08;
  return { dmg: eff === 0 ? 0 : Math.max(1, Math.floor(base * mult * eff * stab * (crit ? 1.5 : 1) * (0.85 + Math.random() * 0.15))), eff, crit: crit && eff > 0 };
}

// =====================================================================
// Level
// =====================================================================
// Legende: # Boden/Wolke, B Ziegel (zerbrechlich), = Stein (fest), ? Fragezeichenblock, p Pokéball, M Meisterball, s Stachel, F Flagge, S Start
//          Wilde Pokémon: g Glumanda, z Zubat, w Schiggy, b Bisasam, j Pummeluff, m Mew (schwebt, nur fangen)
const LEVELS = [
  { name: "1-1 Wiese", theme: { ground: "grass", sky: ["#5c94fc", "#a8d8ff"], hills: true, levelBonus: 0,
      intro: ["Pikachu, ich wähle dich!", "X wirft einen Pokéball auf wilde Pokémon und startet einen Kampf.", "Im Kampf: Schwächen, dann Pokéball werfen und fangen!"] },
    map: [
"                                                                                                                         ",
"                                                                                                                         ",
"                                                                                                                         ",
"                                                                                                                         ",
"                          p p p                                                 p p                                      ",
"                    ?    =====          p                p         ?B?B?        ===                    z                 ",
"                              ==         z              BBB                               p                      p        ",
"         ?                        BB            p  ===                      ==         BBBBB      z                      ",
"    p                       g    B  B        BBBB        w              BB          z                        p      F     ",
"  S          g       g     BBB  B    B  w   B    B    g b      BBB    g   BB     b  w   ss    g   ppp        BBB   F     ",
"#################  ###########################  #####  #######  ###################################### ########  #########",
"#################  ###########################  #####  #######  ###################################### ########  #########"
    ] },
  { name: "1-2 Wolken", theme: { ground: "cloud", sky: ["#2d6fe0", "#c8e6ff"], hills: false, levelBonus: 3,
      intro: ["Wolkenlevel!", "Hol dir den lila MEISTERBALL und fang damit das MEW am Start.", "Im Kampf: POKÉBALL wählen, der Meisterball trifft immer!"] },
    map: [
"                                                                                                                         ",
"                                                                                                                         ",
"                                                                                                                         ",
"                                                                                                                         ",
"                          p p                                                                                            ",
"                          ====                                                      z                                    ",
"                ?                        B?B           p       p         ?        p       p  p          p                ",
"                               ===                   z        ==                 ==       B  B         ==z               ",
"                                                                                                                 p  F    ",
"  S  M  m                        ppp      j                    j        j                   j       ppp   j         F    ",
"###########  ########   #############  ########   ########   ######   ######   ######   ########   ##########  ##########",
"###########  ########   #############  ########   ########   ######   ######   ######   ########   ##########  ##########"
    ] },
  { name: "1-3 Tempel", theme: { ground: "stone", sky: ["#1b1008", "#5a3a1c"], hills: false, levelBonus: 4,
      intro: ["Tempelwelt!", "Vorsicht vor Stacheln und Lava. Elektro wirkt nicht gegen Boden-Pokémon!", "Am Ende wartet der Tempelwächter ONIX. Wasser und Pflanze sind sehr effektiv!"] },
    map: [
"#########################################################################################################################",
"#                                                                                                                       #",
"#     t           t           t           t           t           t           t           t           t           t     #",
"#                                                                                                                       #",
"#             ppp                                            ppp                                                        #",
"#             ===                                            ===                                                        #",
"#                     ?               p                              p         p p                                 =====#",
"#          ==                                    z        ==                    z                    z                  #",
"#   p                                                                                 p                                F#",
"# S             k          ss         d       d         k   d          d                   ss          ss      ppd   O F#",
"######  ##########  ##############  #####   ########  ###########  #########  #####  ############  ##########  ##########",
"######  ##########  ##############  #####   ########  ###########  #########  #####  ############  ##########  ##########"
    ] },
  { name: "1-4 Dschungel", theme: { ground: "jungle", sky: ["#0f3d2e", "#7fd07f"], hills: false, levelBonus: 5, sleepy: true, sticks: true,
      intro: ["Dschungelwelt!", "Viele Pokémon schlafen hier: leise vorbei oder im Schlaf fangen. Sammle Stöcke!", "5 Stöcke + Taste B = Stockhaus: Pause, volle Heilung und Checkpoint."] },
    map: [
"                                                                                                                         ",
"        v             v             v           v              v            v         v            v           v         ",
"                                                                                                                         ",
"                                                                                                                         ",
"                                 ppp                                                                                     ",
"                                 ~~~                                                                                     ",
"                i         ?                  ?                       p            ?        i          ?                  ",
"               ~~~           ~~~          z            ~~~~~        ~~~        z          ~~~            z        ~~~~~  ",
"                                                                                                                       F ",
"  S  i i          bi       i  ji   b        i        b i X  j         i b       i        j  i  b        i b         C  F ",
"##########  ##########  ##############  ########  #############  ##########  ########  ###########  ##########  #########",
"##########  ##########  ##############  ########  #############  ##########  ########  ###########  ##########  #########"
    ] },
  { name: "1-5 Stadt", theme: { ground: "city", sky: ["#1b1f4e", "#e07a5f"], hills: false, levelBonus: 6, secrets: true,
      intro: ["Stadtwelt!", "Türen mit ↓ betreten, unsichtbare Blöcke anspringen, manche Wände sind nur Fassade.", "In der Mitte wartet LAMUS, am Ende der Stadtkönig LASHU KING. Finde alle ★ Geheimnisse!"] },
    map: [
"                                                                                                                         ",
"                                         pp 2                                                                            ",
"                                        =======                                                                          ",
"                    =========           =     =     =========                             pp5pp                          ",
"                    =?      =           =     =     =       =                             =====                          ",
"                    =       =        a  =     =     =       =     a    =======            =====                          ",
"       h            = 1ppp 2=           =     =     =3 p pr4=          =  h  =      a     =====     ? a                  ",
"                    =========     ?hhh  =     =     =========       == =     =                                    =====  ",
"      p                                 f     f                        f     f                                         F ",
"  S l    r    l       1  u   l        l fpppprfl     3  L    l    4  l f ppp fl    5 ss l          l    u     lppp  K  F ",
"################  #############  ################  ############  ################################  ########  ############",
"################  #############  ################  ############  ################################  ########  ############"
    ] },
  { name: "1-6 Tauchsee & Gipfel", theme: { ground: "mixed", sky: ["#2d6fe0", "#bfe4ff"], hills: true, levelBonus: 7, sticks: true, pipes: true, secrets: true,
      zones: [{ until: 56 * 40, kind: "water" }, { until: 170 * 40, kind: "grass" }, { until: Infinity, kind: "sky" }], water: { c0: 9, c1: 55, r0: 29, r1: 39 },
      rooms: [{ c0: 28, c1: 36, r0: 33, r1: 36 }, { c0: 178, c1: 182, r0: 4, r1: 7 }, { c0: 161, c1: 165, r0: 34, r1: 36 }],
      signs: { "29,36": "Eine geheime Luftkammer! Vorsicht, Seeigel: Spring drüber, dahinter liegt der goldene Schlüssel.", "122,28": "Der Wald! Irgendwo hier führt ein Rohr in einen verborgenen Raum.", "171,27": "Der Ballon fliegt mit ↑ und ↓, links und rechts lenken, Space zum Abspringen.", "172,7": "Der Gipfelwächter bewacht das Tor. Dahinter wartet das Ziel, der Schlüssel liegt tief unter Wasser..." },
      intro: ["Tauchsee & Gipfel!", "Tauchen: Space schwimmt nach oben, achte auf die Luft. Rohre mit ↓ betreten.", "Garados bewacht den See, Arktos den Gipfel. Baue aus Stöcken ein Haus, klettere über bewegte Blöcke oder fliege mit dem Ballon zum Tor!"] },
    map: [
"                                                                                                                                                                                                                            ",
"                                                                                                                                                                                                                            ",
"                                                                                                                                                                                                                            ",
"                                                                                                                                                                           =============                                    ",
"                                                                                                                                                                           =======     =                          ppp  p    ",
"                                                                                                                                                                                 =     =                        =========== ",
"                                                                                                                                                                                 G   F =                                    ",
"                                                                                                                                                                            !  A G ppF =                                    ",
"                                                                                                                                                                           =============                  p                 ",
"                                                                                                                                                                                                        ===                 ",
"                                                                                                                                                                                                                            ",
"                                                                                                                                                                                                                            ",
"                                                                                                                                                                                                        z    ^              ",
"                                                                                                                                                                                                  p                         ",
"                                                                                                                                                                                                ===                         ",
"                                                                                                                                                                                                                            ",
"                                                                                                                                                                                                 a                          ",
"                                                                                                                                                                                                     ^                      ",
"                                                                                                                                                                                          p                                 ",
"                                                                                                                                                                                        ===                                 ",
"                                                                                                                                                                                         z                                  ",
"                                                                                                                                                                                                                            ",
"                                                                                                                                                                                             ^                              ",
"                                                                                                                                                                                 jp                                         ",
"                                                                                                                                                                                ===                                         ",
"                                                                  ?         p                            a       p                    p               ?              a                                                      ",
"                                                                           ===          a                       ===                  ~~~  z                                                                                 ",
"                                                                                                                                                                           ! @       ^                                      ",
"  S  i i                                                    2  i    i     b     i         i b  iss          b i     ppp   !  b     i              jssi        3        pp                     sssssssssssssssssssss         ",
"#########WWWWWWWWWWWWWWWWWWWWWWWWW=WWWWWWWWWWWWWWWWWWW=W##############  ############  ##############  ##########################  ###########  ############  ###############################################################",
"#########WWWWWWWWWWWWWWWWWWWWWWWWW=WWWWWWWWWWWWWWWWWWW=W##############  ############  ##############  ##########################  ###########  ############  ###############################################################",
"#########WWWWWWWWWWWWWWWWWWWeWWWWW=WWWWWppWWWWWWWWWWqW=W##############  ############  ##############  ##########################  ###########  ############  ###############################################################",
"#########WWWqWWWWWWWWWWWWWW===========WWWWWWWW=WWWWWWW=W##############  ############  ##############  ##########################  ###########  ############  ###############################################################",
"#########WWWWWWWWW=WWWWWWWW=         =qWWWWWWW=WWWWWWW=W##############  ############  ##############  ##########################  ###########  ############  ###=======#####################################################",
"#########WWWWWWWWW=WWWWWWWW=         =WWWWWWWW=WWWWWpp=W##############  ############  ##############  ##########################  ###########  ############  ###=     =#####################################################",
"#########WWWWWWWWW=WWWqWWWW=       y =WWWWWWWW=WWWWWWW=W##############  ############  ##############  ##########################  ###########  ############  ###=     =#####################################################",
"#########WWWWWWWeW=WWWWWWWW=1!  ss =p=WWWWWWWW=WWWWWWW=W##############  ############  ##############  ##########################  ###########  ############  ###=3pppp=#####################################################",
"#########WWWWWWWWW=WWWWWWWW===========ppWWWeWW=WWWWWWWWW##############  ############  ##############  ##########################  ###########  ############  ###=======#####################################################",
"#########WWWWWppWW=WWWWWWWWWWWWWWWWWWWWWWWWWWW=WWWWWWWWW##############  ############  ##############  ##########################  ###########  ############  ###############################################################",
"#########WWWWssWWW=W1WWWWWWWWWoWWWWWWWWWWsWWWW=WWW2oWWWY##############  ############  ##############  ##########################  ###########  ############  ###############################################################",
"######################################################################  ############  ##############  ##########################  ###########  ############  ###############################################################",
"######################################################################  ############  ##############  ##########################  ###########  ############  ###############################################################"
    ] },
  { name: "1-7 Gurkenburg", theme: { ground: "castle", sky: ["#120a24", "#3a1f5a"], hills: false, levelBonus: 8, sticks: true, secrets: true, cucumbers: true,
      signs: { "111,27": "Der geheime Eingang liegt hoch oben in der Luft. Nimm den Ballon und vergiss die Gurken nicht!" },
      intro: ["Gruselige Gurkenburg! Buh!", "Kürbisse versperren die Türen: Sammle Gurken und wirf sie mit G, dann flitzen die Kürbisse davon.", "Der geheime Eingang oben ist nur mit dem Heißluftballon zu erreichen."] },
    map: [
"                                                                                                                                                                ",
"                                                                                                                                                                ",
"                                                                                                                             =================================  ",
"                                                                                                                             =                      =====    =  ",
"                                                                                                                             =    t       h      t  =====    =  ",
"                                                                                                                             =         n                     =  ",
"                                                                                                                             =                             F =  ",
"                                                                                                                             = 4    c       pp        Q    F =  ",
"                                                                                                                             =================================  ",
"                                                                                                                  t P 4 P t                                     ",
"                                                                                                                  =========                                     ",
"                                                                                                                                                                ",
"                                                                                                                                                                ",
"                                                                                                                                                                ",
"                                                                                                                                                                ",
"                                                                                                                                                                ",
"                                                                                                                                                                ",
"                                                                                                      =========                                                 ",
"                                                                                                      = h pp  =                                                 ",
"                                        =================                                             =       =                                                 ",
"                                  ==    =               =                                             =       =                                                 ",
"                                  ==    =  t         t  =                                             =3 cccc =                                                 ",
"                                  ==    =       n       =                                    n        =========                                                 ",
"                      n           ==    =    h          =            p       z                                                              z                   ",
"               z                  ==    =               =           ~~~         ?                                            z                                  ",
"          t               t       ==    =               =                         t                                                    t                        ",
"                                  ==    =1  c  c  c P 2 =                                                                                                       ",
"  S   c  c   c      c   c    PP1 P==    =================   2i c  i   c i      c    i c i       cP3P           !@                 c                   c         ",
"####################################  ####################################  ##############  ####################################################################",
"####################################  ####################################  ##############  ####################################################################"
    ] },
  { name: "1-8 Kunstmuseum", theme: { ground: "museum", museum: true, sky: ["#f3efe6", "#e6e0d2"], hills: false, levelBonus: 8, secrets: true, stars: true,
      floors: [
        { r0: 24, r1: 33, epochs: [{ until: 53 * 40, name: "Mittelalter", wall: "#6b5544" }, { until: 127 * 40, name: "Renaissance", wall: "#7b2d2d" }, { until: Infinity, name: "Kabinett", wall: "#2a2a33" }] },
        { r0: 12, r1: 22, epochs: [{ until: 41 * 40, name: "Kabinett", wall: "#2a2a33" }, { until: 110 * 40, name: "Rokoko & Klassizismus", wall: "#b8c7d6" }, { until: Infinity, name: "Barock", wall: "#25483a" }] },
        { r0: 2, r1: 10, epochs: [{ until: 41 * 40, name: "Kabinett", wall: "#2a2a33" }, { until: 101 * 40, name: "19. Jahrhundert", wall: "#5b3f6b" }, { until: Infinity, name: "Moderne", wall: "#ececec" }] }],
      rooms: [{ c0: 128, c1: 158, r0: 24, r1: 33 }, { c0: 1, c1: 38, r0: 12, r1: 22 }, { c0: 1, c1: 38, r0: 2, r1: 10 }],
      art: {"12,33":0,"135,33":2,"70,33":1,"140,22":3,"128,22":4,"20,22":5,"75,22":7,"70,10":9,"95,22":8,"20,10":10,"90,10":11,"130,10":13,"145,10":16,"30,10":14,"150,22":6,"80,10":12,"120,10":15},
      signs: { "4,33": "Willkommen im Museum auf drei Stockwerken! Vor leuchtenden Gemälden ↓ drücken: Sie sind Portale, manche führen in verborgene Kabinette. Sammle 5 Sterne für die Krone!" },
      intro: ["Kunstmuseum auf drei Stockwerken!", "Originale von Künstlerinnen aus 900 Jahren. Leuchtende Gemälde sind Portale, einige führen in geheime Kabinette.", "Sammle 5 goldene Sterne: Dann bekommt deine Figur eine Krone und 5 Level dazu!"] },
    map: [
"                                                                                                                                                                ",
"================================================================================================================================================================",
"=                                      ==                                                                                                                      =",
"=                                      ==                                                                                                                      =",
"=                                      ==                                                                                                                      =",
"=                                      ==                                                                                                                      =",
"=                                      ==                                  n                                                 n                                 =",
"=                                      ==                   ?                                                                                         =======  =",
"=                                      ==                                                                                                                      =",
"=              p                       ==                        p                                  p                        p            p                  F =",
"=           *       5         7        ==         ~         r         4         &         6              *    r         &         6    j         7       T   F =",
"============================================      ==============================================================================================================",
"=                                      ==                                                                                                                      =",
"=                                      ========                                                                                                                =",
"=                                      =========                                                                                                               =",
"=                                      ==========                                                                                                              =",
"=                                      ===========                                                                                                             =",
"=                                      ============                                                 n                                            n             =",
"=                                      =============                                                                                                           =",
"=                                      ==============         ?                                                                         ?                      =",
"=                                      ===============                                                                                                         =",
"=              p                       ================               p                             p                                            p             =",
"=         *         3         *        =================         r    ~    4         j         5         *  ~                   3 r         2         &        =",
"=======================================================================================================================       ==================================",
"=                                                   =                                                                   ========                               =",
"=                                                   =                                                                  =========                               =",
"=                                                   =                                                                 ==========                               =",
"=                                                   =                                                                ===========                               =",
"=                                                   =                                                               ============                               =",
"=                                            n      =                                               n              =============                               =",
"=                        ?                          =                                                             ==============                               =",
"=                                                   =                                                            ===============                               =",
"=                 p                                                                                 p           ================            p           p      =",
"= S !   ~   1            r                                  j         2                        r               =================   *   1              *        =",
"##############################  ################################################  ##############################################################################",
"##############################  ################################################  ##############################################################################"
    ] },
];
let LEVEL, ROWS, COLS, LEVEL_W, LEVEL_H, THEME, levelIdx = 0, WATER = [];
function isWater(c, r) { return !!(WATER[r] && WATER[r][c]); }
function loadLevel(i) {
  levelIdx = i; const L = LEVELS[i]; THEME = L.theme;
  COLS = Math.max(...L.map.map(r => r.length)); ROWS = L.map.length; LEVEL_W = COLS * TILE;
  LEVEL = L.map.map(r => r.padEnd(COLS, " ")); LEVEL_H = ROWS * TILE;
  // Wasserkarte: W-Felder plus alle nicht festen Felder im Seebereich (Objekte, Blasen, Seeigel)
  WATER = LEVEL.map(row => row.split("").map(ch => ch === "W"));
  if (THEME.water) { // Flutfüllung: Wasser breitet sich von W-Feldern über nicht feste Felder aus, aber nicht durch Mauern (Luftkammer bleibt trocken)
    const w = THEME.water, queue = [];
    for (let r = w.r0; r <= w.r1; r++) for (let c = w.c0; c <= w.c1; c++) if (WATER[r][c]) queue.push([c, r]);
    const passable = ch => !SOLID.has(ch) && ch !== "=" && !(ch >= "1" && ch <= "9");
    while (queue.length) { const [c, r] = queue.pop(); for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nc = c + dc, nr = r + dr; if (nc < w.c0 || nc > w.c1 || nr < w.r0 || nr > w.r1 || WATER[nr][nc]) continue; if (passable(LEVEL[nr][nc])) { WATER[nr][nc] = true; queue.push([nc, nr]); } } }
  }
  // Geheimnisse zählen: versteckte Blöcke, Türpaare, Fassaden-Spalten
  const digits = new Set(), fcols = new Set(); let h = 0;
  for (const row of LEVEL) for (let c = 0; c < row.length; c++) { const t = row[c]; if (t === "h" || t === "y" || t === "Z") h++; else if (t >= "1" && t <= "9") digits.add(t); else if (t === "f") fcols.add(c); }
  THEME.secretTotal = h + digits.size + fcols.size;
  if (THEME.art) { THEME.signs = THEME.signs || {}; for (const k in THEME.art) { const a = ART[THEME.art[k]]; if (a) THEME.signs[k] = `${a.artist}: „${a.title}“ (${a.year}, ${a.epoch})`; } }
}

// =====================================================================
// Eingabe & Hilfsfunktionen
// =====================================================================
const keys = {}, pressed = {};
addEventListener("keydown", e => {
  if (!keys[e.code]) pressed[e.code] = true;
  keys[e.code] = true;
  if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) e.preventDefault();
  if (e.code === "KeyR") state = "title";
});
addEventListener("keyup", e => keys[e.code] = false);
canvas.addEventListener("click", e => {
  if (state !== "title") return;
  const r = canvas.getBoundingClientRect(), x = (e.clientX - r.left) * W / r.width;
  startGame(x < W / 2 ? 0 : 1);
});
const confirmPressed = () => pressed.Space || pressed.Enter || pressed.KeyX;
const backPressed = () => pressed.Escape || pressed.Backspace;

function tileAt(col, row) { if (col < 0 || col >= COLS) return "#"; if (row < 0 || row >= ROWS) return " "; return LEVEL[row][col]; }
const SOLID = new Set(["#", "B", "=", "~", "?", "U", "G"]);
let solidMap;
function isSolid(col, row) { if (col < 0 || col >= COLS) return true; if (row < 0 || row >= ROWS) return false; const t = solidMap[row][col]; return SOLID.has(t) || (THEME.pipes && t >= "1" && t <= "9"); }
function rectsOverlap(a, b) { return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

let audio;
function beep(freq, dur = 0.08, type = "square", vol = 0.05) {
  if (!freq) return;
  try {
    audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    const o = audio.createOscillator(), g = audio.createGain();
    o.type = type; o.frequency.value = freq; g.gain.value = vol;
    o.connect(g); g.connect(audio.destination);
    o.start(); g.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + dur); o.stop(audio.currentTime + dur);
  } catch (e) {}
}
function jingle(notes, step = 0.09) { notes.forEach((n, i) => setTimeout(() => beep(n, step * 1.2, "triangle", 0.06), i * step * 1000)); }

// =====================================================================
// Spielzustand
// =====================================================================
let player, enemies, items, particles, projectiles, camX, score, pokeballs, masterBalls, lives, state, time, flagX, toasts;
let sticks = 0, progress = null, restT = 0, restX = 0;
let roomFade = {}, activeSign = null, cucumbers = 0, pumpkins = [], pumpkinToast = 0, stars = 0, crowned = false;
let camY = 0, prevCamY, camDrawY = 0, air = AIR_MAX, movers = [], balloon = null, flagTop = 4, flagBase = 400, winSecret = false, signTimer = 0;
let team, leadIdx, battle, stats;
let renderAlpha = 1, prevCamX, camDraw = 0;
const lerpX = o => (o.px === undefined ? o.x : o.px + (o.x - o.px) * renderAlpha);
const lerpY = o => (o.py === undefined ? o.y : o.py + (o.y - o.py) * renderAlpha);

function init(keepProgress) {
  solidMap = LEVEL.map(r => r.split(""));
  enemies = []; items = []; particles = []; projectiles = []; toasts = [];
  activeSign = null; camX = 0; prevCamX = undefined; camY = 0; prevCamY = undefined; time = 0; flagX = 0; battle = null; state = "play";
  air = AIR_MAX; movers = []; balloon = null; winSecret = false; flagTop = 99; flagBase = 0; pumpkins = []; pumpkinToast = 0;
  if (!keepProgress) {
    score = 0; pokeballs = diff.balls; masterBalls = 0; lives = diff.lives; sticks = 0; cucumbers = 0; stars = 0; crowned = false;
    team = [makeMon("pikachu", 5)]; leadIdx = 0;
    stats = { battles: 0, caught: 0, evolutions: 0 };
  } else {
    for (const m of team) m.hp = m.maxHp;
  }
  if (!keepProgress || !progress || progress.level !== levelIdx) progress = { level: levelIdx, huts: [], checkpoint: null, bossesDone: [], secrets: [], roomsSeen: [] };
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const t = LEVEL[r][c], x = c * TILE, y = r * TILE;
    if (t === "S") player = { x, y: y - 4, w: 30, h: 36, vx: 0, vy: 0, onGround: false, facing: 1, inv: 0, anim: 0, cooldown: 0 };
    if (t === "^") movers.push({ x, y: y + 12, w: 80, h: 16, vy: -1.2, vx: 0, minY: y + 12 - 6 * TILE, maxY: y + 12, dx: 0, dy: 0 });
    if (t === "@") balloon = { x: x + 4, y: y - 30, cool: 0 };
    if (t === "y") items.push({ x: x + 8, y: y + 8, w: 24, h: 24, taken: false, secretKey: true });
    if (t === "c") items.push({ x: x + 6, y: y + 8, w: 28, h: 24, taken: false, cucumber: true });
    if (t === "*") items.push({ x: x + 6, y: y + 6, w: 28, h: 28, taken: false, star: true });
    if (t === "P") pumpkins.push({ x: x + 2, y: y + 6, w: 36, h: 34, fleeing: false, dir: -1, vx: 0, vy: 0, life: 80, seed: Math.random() * 6 });
    if (SWIMMER_TILES[t]) enemies.push({ key: SWIMMER_TILES[t], flyer: true, swimmer: true, x, y, w: 34, h: 26, vx: (Math.random() < 0.5 ? -1 : 1) * 1.0 * diff.enemySpeed, vy: 0, alive: true, baseY: y, t: Math.random() * 6, dir: -1 });
    if (FLYER_TILES[t]) enemies.push({ key: FLYER_TILES[t], flyer: true, x, y, w: 34, h: 26, vx: -1.6 * diff.enemySpeed, vy: 0, alive: true, baseY: y, t: Math.random() * 6, dir: -1, asleep: !!THEME.sleepy && Math.random() < 0.6 });
    else if (t === "m") { if (!team.some(m => m.key === "mew")) enemies.push({ key: "mew", flyer: true, hover: true, noStomp: true, fixedLevel: 8, x, y, w: 34, h: 34, vx: 0, vy: 0, alive: true, baseY: y, t: 0, dir: -1 }); }
    else if (t === "O" || t === "X" || t === "C" || t === "L" || t === "K" || t === "Y" || t === "A" || t === "Q" || t === "T") {
      const bossDef = { O: { key: "onix", lvl: 10, w: 40, h: 110, title: "Der Tempelwächter", tip: "Tipp: Wasser- und Pflanzen-Attacken sind sehr effektiv gegen Gestein. Elektro wirkt nur schwach." },
                        X: { key: "relaxo", lvl: 9, w: 60, h: 60, asleep: true, title: "Der schlafende Riese", tip: "Tipp: Relaxo schläft noch ein paar Runden. Schlafende Pokémon lassen sich leichter fangen!" },
                        C: { key: "chimpex", lvl: 13, w: 50, h: 70, title: "Der Dschungelkönig", tip: "Tipp: Feuer- und Flug-Attacken sind sehr effektiv gegen Pflanze!" },
                        L: { key: "lahmus", lvl: 11, w: 50, h: 70, title: "Der Stadtwächter", tip: "Tipp: Lahmus ist Wasser und Psycho, ein Muschas hängt an seinem Schwanz. Elektro und Pflanze treffen doppelt, oder finde den Geheimgang vorbei!" },
                        K: { key: "laschoking", lvl: 15, w: 50, h: 82, title: "Der Stadtkönig", tip: "Tipp: Laschoking trägt das Muschas als Krone und ist klug und zäh. Elektro- und Pflanzen-Attacken sind sehr effektiv!" },
                        Y: { key: "lapras", lvl: 12, w: 40, h: 120, title: "Der Seewächter", tip: "Tipp: Lapras ist Wasser und Eis. Elektro, Pflanze und Gestein treffen doppelt! Oder finde das Rohr, das am Wächter vorbeiführt." },
                        A: { key: "arktos", lvl: 16, w: 50, h: 80, title: "Der Gipfelwächter", tip: "Tipp: Arktos ist Eis und Flug. Feuer- und Gestein-Attacken sind sehr effektiv!" },
                        Q: { key: "gengar", lvl: 17, w: 50, h: 80, title: "Der Burggeist", tip: "Tipp: Gengar ist Geist und Gift. Normale Attacken wirken gar nicht, Psycho- und Geist-Attacken treffen doppelt!" },
                        T: { key: "mewtu", lvl: 18, w: 50, h: 80, title: "Der Museumswächter", tip: "Tipp: Mewtu ist ein Psycho-Pokémon. Geist-Attacken (zum Beispiel von Nebulak) treffen doppelt!" } }[t];
      const id = c + "," + r;
      if (!progress.bossesDone.includes(id)) enemies.push({ key: bossDef.key, id, boss: true, title: bossDef.title, tip: bossDef.tip, stationary: true, noStomp: true, asleep: !!bossDef.asleep, fixedLevel: bossDef.lvl, x, y: y + TILE - bossDef.h, w: bossDef.w, h: bossDef.h, vx: 0, vy: 0, alive: true, dir: -1 });
    }
    else if (WILD_TILES[t]) enemies.push({ key: WILD_TILES[t], x, y: y + 6, w: 32, h: 34, vx: -1.2 * diff.enemySpeed, vy: 0, alive: true, dir: -1, asleep: !!THEME.sleepy && Math.random() < 0.6 });
    if (t === "p") items.push({ x: x + 8, y: y + 8, w: 24, h: 24, taken: false });
    if (t === "i") items.push({ x: x + 6, y: y + 6, w: 28, h: 28, taken: false, stick: true });
    if (t === "M" && masterBalls === 0 && !team.some(m => m.key === "mew")) items.push({ x: x + 5, y: y + 5, w: 30, h: 30, taken: false, master: true });
    if (t === "F") { flagX = flagX || x; flagTop = Math.min(flagTop, r); flagBase = Math.max(flagBase, (r + 1) * TILE); }
  }
  if (flagTop === 99) { flagTop = 4; flagBase = (ROWS - 2) * TILE; }
  if (keepProgress && progress.checkpoint != null) { player.x = progress.checkpoint; if (progress.checkpointY != null) player.y = progress.checkpointY; camX = clamp(player.x - W * 0.4, 0, LEVEL_W - W); }
  camY = clamp(player.y - H * 0.55, 0, Math.max(0, LEVEL_H - H));
  toast("Level " + LEVELS[levelIdx].name + "  ·  Modus: " + diff.name, "#ffde00");
}
const aliveIdx = () => (team[leadIdx] && team[leadIdx].hp > 0) ? leadIdx : team.findIndex(m => m.hp > 0);
const avatarKey = () => team[leadIdx] ? team[leadIdx].key : "pikachu";
function toast(text, color = "#fff") { toasts.push({ text, color, life: 110 }); }

// =====================================================================
// Overworld-Update
// =====================================================================
function update() {
  time++;
  if (state === "battle") { updateBattle(); clearPressed(); return; }
  if (state === "title") {
    if (pressed.ArrowLeft || pressed.ArrowRight || pressed.KeyA || pressed.KeyD) { titleSel ^= 1; beep(600, 0.03); }
    if (pressed.Digit1) titleSel = 0; if (pressed.Digit2) titleSel = 1;
    if (pressed.Enter || pressed.Space) startGame(titleSel);
    clearPressed(); return;
  }
  if (state === "win" && (pressed.Enter || pressed.Space) && levelIdx < LEVELS.length - 1) { loadLevel(levelIdx + 1); init(true); clearPressed(); return; }
  if (state === "rest") { restT++; if (restT > 170) { state = "play"; player.inv = 60; } clearPressed(); return; }
  if (state !== "play") { clearPressed(); return; }
  if (pressed.KeyL) { loadLevel((levelIdx + 1) % LEVELS.length); init(true); clearPressed(); return; }

  const p = player;
  p.px = p.x; p.py = p.y; prevCamX = camX; prevCamY = camY;
  for (const e of enemies) { e.px = e.x; e.py = e.y; }
  for (const b of projectiles) { b.px = b.x; b.py = b.y; }
  for (const m of movers) { m.dx = m.vx; m.dy = m.vy; m.x += m.vx; m.y += m.vy; if (m.y <= m.minY) { m.y = m.minY; m.vy = Math.abs(m.vy); } if (m.y >= m.maxY) { m.y = m.maxY; m.vy = -Math.abs(m.vy); } }
  const cxTile = Math.floor((p.x + p.w / 2) / TILE), cyTile = Math.floor((p.y + p.h / 2) / TILE);
  const inWater = isWater(cxTile, cyTile);
  const riding = !!p.riding;
  const moveAcc = inWater ? 0.4 : MOVE, maxVx = riding ? 2.6 : inWater ? 2.8 : MAX_VX;
  if (keys.ArrowLeft || keys.KeyA) { p.vx -= moveAcc; p.facing = -1; }
  if (keys.ArrowRight || keys.KeyD) { p.vx += moveAcc; p.facing = 1; }
  if (!(keys.ArrowLeft || keys.KeyA || keys.ArrowRight || keys.KeyD)) p.vx *= FRICTION;
  p.vx = clamp(p.vx, -maxVx, maxVx);
  const jumpKey = keys.Space || keys.ArrowUp || keys.KeyW;
  if (riding) {
    // Luftballon: ↑/↓ steigen und sinken, Space springt ab
    p.vy = (keys.ArrowUp || keys.KeyW) ? -1.6 : (keys.ArrowDown || keys.KeyS) ? 1.6 : 0;
    if (p.y < 30 && p.vy < 0) p.vy = 0;
    if (pressed.Space) { p.riding = false; balloon.x = p.x - 2; balloon.y = p.y - 30; balloon.cool = 40; p.vy = -7; beep(520, 0.12); }
  } else if (inWater) {
    // Tauchen: langsam sinken, Space = Schwimmstoß, an der Oberfläche ein kräftiger Sprung
    p.vy = clamp(p.vy + 0.12, -4.5, 2.2);
    if (pressed.Space || pressed.ArrowUp || pressed.KeyW) { const surface = !isWater(cxTile, cyTile - 1); p.vy = surface ? -7.5 : -4.2; beep(300, 0.05, "triangle", 0.03); if (Math.random() < 0.5) particles.push({ x: p.x + 15, y: p.y, vx: 0, vy: -1.5, life: 40, color: "#cfefff" }); }
    air--; if (time % 20 === 0) particles.push({ x: p.x + 8 + Math.random() * 14, y: p.y + 6, vx: 0, vy: -1.2, life: 45, color: "#e0f4ff" });
    if (air <= 0) { air = AIR_MAX; toast("Keine Luft mehr!", "#f88"); die(); return; }
  } else {
    air = AIR_MAX;
    if (pressed.Space || pressed.ArrowUp || pressed.KeyW) p.jumpBuf = 8; // Druck kurz vor der Landung zählt noch
    p.coyote = p.onGround ? 6 : (p.coyote || 0) - 1;                      // kurz nach einer Kante darf man noch abspringen
    if (p.jumpBuf > 0 && p.coyote > 0) { p.vy = JUMP; p.onGround = false; p.coyote = 0; p.jumpBuf = 0; beep(520, 0.12); }
    if (p.jumpBuf > 0) p.jumpBuf--;
    if (!jumpKey && p.vy < -4) p.vy = -4;
  }
  for (const [cc, rr] of cellsUnder(p)) if (tileAt(cc, rr) === "o") air = AIR_MAX;
  if (pressed.KeyX && !p.cooldown) {
    p.cooldown = 30;
    projectiles.push({ x: p.x + p.w / 2 + 10 * p.facing, y: p.y + 8, vx: 7 * p.facing, vy: -4, w: 16, h: 16, life: 70, rot: 0 });
    beep(700, 0.08, "triangle");
  }
  if (pressed.KeyG && !p.cooldown) {
    if (cucumbers > 0) { cucumbers--; p.cooldown = 20; projectiles.push({ x: p.x + p.w / 2 + 10 * p.facing, y: p.y + 10, vx: 7.5 * p.facing, vy: -1.2, w: 22, h: 12, life: 80, rot: 0, cucumber: true }); beep(900, 0.06, "triangle"); }
    else toast("Keine Gurken! Sammle grüne Gurken im Level.", "#f88");
  }
  for (let i = 1; i <= 6; i++) if (pressed["Digit" + i] && team[i - 1]) {
    if (team[i - 1].hp > 0) { leadIdx = i - 1; toast(monName(team[leadIdx]) + " übernimmt die Führung!"); }
    else toast(monName(team[i - 1]) + " ist kampfunfähig!", "#f88");
  }
  if ((pressed.ArrowDown || pressed.KeyS) && (p.onGround || inWater)) { const d = doorAt(p); if (d) useDoor(d); }
  for (const [cc, rr] of cellsUnder(p)) if (tileAt(cc, rr) === "f") { foundSecret("f:" + cc, "Geheimgang durch die Fassade!"); break; }
  if (pressed.KeyB) {
    const hut = progress.huts.find(h => Math.abs(h.x - (p.x + p.w / 2)) < 70);
    if (hut) startRest(hut);
    else if (sticks >= 5 && p.onGround) { sticks -= 5; const h = { x: p.x + p.w / 2, y: p.y + p.h }; progress.huts.push(h); progress.checkpoint = p.x; progress.checkpointY = p.y; startRest(h); }
    else toast(sticks < 5 ? `Du brauchst 5 Stöcke für ein Stockhaus (${sticks}/5)` : "Zum Bauen auf dem Boden stehen", "#f88");
  }
  if (p.cooldown) p.cooldown--;
  if (p.inv) p.inv--;

  if (!inWater && !riding) p.vy += GRAVITY;
  moveWithCollision(p, true);
  // Auf bewegten Blöcken mitfahren
  for (const m of movers) {
    const feet = p.y + p.h;
    if (p.vy >= 0 && !riding && p.x + p.w > m.x + 4 && p.x < m.x + m.w - 4 && feet >= m.y - 3 && feet <= m.y + 14) { p.y = m.y - p.h; p.vy = 0; p.onGround = true; p.coyote = 6; p.x += m.dx; }
  }
  // Ballon einsteigen
  if (balloon && !riding && balloon.cool <= 0 && rectsOverlap(p, { x: balloon.x - 10, y: balloon.y - 30, w: 54, h: 112 })) { p.riding = true; p.vy = 0; toast("Du fliegst mit dem Ballon! ↑ ↓ lenken, Space abspringen"); beep(700, 0.1, "triangle"); }
  if (balloon && balloon.cool > 0) balloon.cool--;
  if (riding && p.riding) { balloon.x = p.x - 2; balloon.y = p.y - 30; }
  if (Math.abs(p.vx) > 0.3 && p.onGround) p.anim += Math.abs(p.vx) * 0.05;
  // Schilder, Tor mit Schlüssel, geheimes Ziel
  for (const k in roomFade) if (roomFade[k] > 0) roomFade[k]--;
  if (THEME.rooms) THEME.rooms.forEach((rm, i) => { if (!progress.roomsSeen.includes(i) && cxTile >= rm.c0 && cxTile <= rm.c1 && cyTile >= rm.r0 && cyTile <= rm.r1) { progress.roomsSeen.push(i); roomFade[i] = 40; toast("Ein verborgener Raum wird sichtbar!", "#ffde00"); jingle([523, 784], 0.1); } });
  activeSign = null;
  if (THEME.signs) for (const [cc, rr] of cellsUnder({ x: p.x - 40, y: p.y - 10, w: p.w + 80, h: p.h + 20 })) { const s = THEME.signs[cc + "," + rr]; if (s) { activeSign = s; break; } }
  if (progress.key) for (const [cc, rr] of cellsUnder({ x: p.x - 14, y: p.y - 6, w: p.w + 28, h: p.h + 12 })) if (solidMap[rr]?.[cc] === "G") {
    for (let r2 = 0; r2 < ROWS; r2++) for (let c2 = 0; c2 < COLS; c2++) if (solidMap[r2][c2] === "G") { solidMap[r2][c2] = " "; burst(c2 * TILE + 20, r2 * TILE + 20, "#ffde00", 10); }
    toast("Der goldene Schlüssel passt! Das Tor öffnet sich.", "#ffde00"); jingle([523, 659, 784, 1047], 0.1);
  }
  for (const [cc, rr] of cellsUnder(p)) if (tileAt(cc, rr) === "Z") { winSecret = true; foundSecret("Z", "Geheimes Ziel erreicht!"); state = "win"; score += 3000; jingle([659, 784, 988, 1319, 1568], 0.09); return; }

  if (p.y > LEVEL_H + 100) die();
  for (const [cc, rr] of cellsUnder(p)) if (tileAt(cc, rr) === "s" && rectsOverlap(p, { x: cc * TILE + 4, y: rr * TILE + 20, w: TILE - 8, h: TILE })) { if (!p.inv) die(); }

  // Steht die Fahne in einem verborgenen Raum, zählt das Ziel nur dort drin (sonst reicht ein Flug am Raum vorbei).
  const flagRoom = (THEME.rooms || []).find(rm => Math.floor(flagX / TILE) >= rm.c0 && Math.floor(flagX / TILE) <= rm.c1 && flagTop >= rm.r0 && flagTop <= rm.r1);
  const inFlagRoom = !flagRoom || (cxTile >= flagRoom.c0 && cxTile <= flagRoom.c1 && cyTile >= flagRoom.r0 && cyTile <= flagRoom.r1);
  if (inFlagRoom && p.x + p.w > flagX + 10 && p.y + p.h <= flagBase + 4 && p.y + p.h > flagBase - 120) { state = "win"; score += 1000; jingle([523, 659, 784, 1047]); }

  for (const it of items) if (!it.taken && rectsOverlap(p, it)) {
    it.taken = true; score += 100; beep(1200, 0.1, "triangle"); burst(it.x + 12, it.y + 12, it.master ? "#b070ff" : it.stick ? "#a0703a" : it.cucumber ? "#5bbf3a" : it.star ? "#ffd700" : "#f33");
    if (it.star) {
      stars++; score += 500; jingle([784, 988, 1175, 1568], 0.07); burst(it.x + 14, it.y + 14, "#ffd700", 16);
      if (stars >= 5 && !crowned) {
        crowned = true; const m = team[leadIdx] || team[0]; const old = m.level; m.level += 5; m.maxHp = calcMaxHp(m); m.hp = m.maxHp;
        const ev = sp(m).evolve; if (ev && m.level >= ev.level) evolveMon(m);
        toast(`Fünf Sterne! Du trägst jetzt eine Krone. ${monName(m)} steigt von Level ${old} auf ${m.level}!`, "#ffd700"); jingle([523, 659, 784, 1047, 1319, 1568], 0.1);
      } else toast(stars < 5 ? `Stern ${stars}/5 gesammelt!` : `Noch ein Stern (${stars})!`, "#ffd700");
    }
    else if (it.cucumber) { cucumbers++; toast(`+1 Gurke (${cucumbers}). Wirf sie mit G auf Kürbisse!`, "#9be37d"); }
    else if (it.secretKey) { progress.key = true; foundSecret("y", "Du hast den goldenen Schlüssel gefunden!"); burst(it.x + 12, it.y + 12, "#ffde00", 16); }
    else if (it.stick) { sticks++; score += 20; toast(sticks >= 5 ? `+1 Stock (${sticks}) – drücke B für ein Stockhaus!` : `+1 Stock (${sticks}/5)`, "#e8c9a0"); }
    else if (it.master) { masterBalls = 1; jingle([659, 784, 988, 1319], 0.08); toast("MEISTERBALL! Fängt jedes Pokémon garantiert.", "#d9b3ff"); }
    else { pokeballs++; healTeam(diff.pickupHeal); toast(`+1 Pokéball, Team +${Math.round(diff.pickupHeal * 100)}% KP`); }
  }

  // Geworfene Pokébälle
  for (const b of projectiles) { b.vy += b.cucumber ? 0.12 : 0.35; b.x += b.vx; b.y += b.vy; b.rot += 0.3; b.life--; const c = Math.floor((b.x + 8) / TILE), r = Math.floor((b.y + 8) / TILE); if (isSolid(c, r)) b.life = 0; }
  projectiles = projectiles.filter(b => b.life > 0);

  // Wilde Pokémon
  for (const e of enemies) {
    if (!e.alive) { e.y += 3; continue; }
    if (e.asleep) {
      const near = Math.abs(player.x - e.x) < 110 && Math.abs(player.y - e.y) < 70;
      e.wake = near ? (e.wake || 0) + 1 : 0;
      if (e.wake > 50 && !e.boss) { e.asleep = false; burst(e.x + e.w / 2, e.y, "#fff", 5); toast(monName(e) + " ist aufgewacht!"); }
      e.dir = player.x < e.x ? -1 : 1;
      if (!e.flyer && !e.stationary) { e.vy += GRAVITY; const vx = e.vx; e.vx = 0; moveWithCollision(e, false); e.vx = vx; }
    }
    else if (e.stationary) { e.dir = player.x < e.x ? -1 : 1; }
    else if (!e.flyer) {
      e.vy += GRAVITY;
      const prevVx = e.vx;
      moveWithCollision(e, false);
      if (e.vx === 0) e.vx = -prevVx;
      const aheadCol = Math.floor((e.x + (e.vx > 0 ? e.w + 2 : -2)) / TILE), footRow = Math.floor((e.y + e.h + 2) / TILE);
      if (e.onGround && (!isSolid(aheadCol, footRow) || tileAt(aheadCol, footRow - 1) === "s")) e.vx = -e.vx; // an Abgründen und Stacheln umkehren
      e.dir = Math.sign(e.vx) || e.dir;
    } else {
      e.t += 0.05;
      const ny = e.baseY + Math.sin(e.t) * (e.hover ? 14 : e.swimmer ? 20 : 40);
      const free = (x, y) => { for (let c = Math.floor(x / TILE); c <= Math.floor((x + e.w - 1) / TILE); c++) for (let r = Math.floor(y / TILE); r <= Math.floor((y + e.h - 1) / TILE); r++) if (isSolid(c, r) || (e.swimmer && !isWater(c, r))) return false; return true; };
      if (e.swimmer) { if (free(e.x, ny)) e.y = ny; else e.baseY = e.y; } else e.y = ny;   // Schwimmer nie in Mauern
      if (e.hover) { e.dir = player.x < e.x ? -1 : 1; }
      else if (e.swimmer) { if (free(e.x + e.vx, e.y)) e.x += e.vx; else e.vx = -e.vx; }
      else e.x += e.vx;
      if (!e.hover && (e.x < camX - 100 || e.x > LEVEL_W - 40 || isSolid(Math.floor(e.x / TILE), Math.floor(e.y / TILE)) || isSolid(Math.floor((e.x + e.w) / TILE), Math.floor(e.y / TILE)))) e.vx = -e.vx;
      if (!e.hover) e.dir = Math.sign(e.vx);
    }
    for (const b of projectiles) if (b.life > 0 && !b.cucumber && rectsOverlap(b, e)) { b.life = 0; startBattle(e, false); return; }
    if (rectsOverlap(p, e)) {
      if (p.vy > 0 && p.y + p.h - e.y < 18 && !e.noStomp) { stomp(e); p.vy = JUMP * 0.6; }
      else if (!p.inv) { startBattle(e, !e.asleep); return; }
    }
  }
  enemies = enemies.filter(e => e.y < LEVEL_H + 200);
  // Kürbisse: blockieren, erschrecken, flitzen nach einem Gurkentreffer davon
  if (pumpkinToast > 0) pumpkinToast--;
  for (const k of pumpkins) {
    if (k.fleeing) { k.x += k.vx; k.y += k.vy; k.vy += 0.3; k.life--; continue; }
    for (const b of projectiles) if (b.life > 0 && b.cucumber && rectsOverlap(b, k)) { b.life = 0; k.fleeing = true; k.vx = (b.vx > 0 ? 1 : -1) * 6; k.vy = -6; score += 100; burst(k.x + 18, k.y + 10, "#ff9f1c", 10); toast("Iiih, eine Gurke! Der Kürbis flitzt davon.", "#ffb347"); beep(400, 0.15, "square"); }
    if (!k.fleeing && rectsOverlap(p, k) && !p.riding) {
      const dir = p.x + p.w / 2 < k.x + k.w / 2 ? -1 : 1; p.vx = dir * 5; p.vy = -5; p.x += dir * 6;
      if (pumpkinToast === 0) { toast("Buh! Der Kürbis schubst dich weg. Wirf eine Gurke (G)!", "#ffb347"); pumpkinToast = 90; beep(150, 0.2, "sawtooth"); }
    }
  }
  pumpkins = pumpkins.filter(k => !k.fleeing || k.life > 0);
  for (const q of particles) { q.x += q.vx; q.y += q.vy; q.vy += 0.3; q.life--; }
  particles = particles.filter(q => q.life > 0);
  for (const t of toasts) t.life--;
  toasts = toasts.filter(t => t.life > 0);

  camX += (p.x - W * 0.4 - camX) * 0.1;
  camX = clamp(camX, 0, LEVEL_W - W);
  camY += (p.y - H * 0.55 - camY) * 0.12;
  camY = clamp(camY, 0, Math.max(0, LEVEL_H - H));
  clearPressed();
}
function startRest(hut) { state = "rest"; restT = 0; restX = hut.x; for (const m of team) m.hp = m.maxHp; player.vx = 0; projectiles = []; jingle([392, 330, 262], 0.15); }
function startGame(sel) { titleSel = sel; diff = sel ? DIFFS.schwerer : DIFFS.leichter; init(false); jingle([523, 659, 784], 0.08); }
function clearPressed() { for (const k in pressed) pressed[k] = false; }

function cellsUnder(o) {
  const out = [];
  for (let c = Math.floor(o.x / TILE); c <= Math.floor((o.x + o.w - 1) / TILE); c++)
    for (let r = Math.floor(o.y / TILE); r <= Math.floor((o.y + o.h - 1) / TILE); r++) out.push([c, r]);
  return out;
}
function moveWithCollision(o, isPlayer) {
  // Horizontal: Zeilen von Ober- bis Unterkante (exklusiv), damit der Boden nicht als Wand zählt
  o.x += o.vx;
  for (const [c, r] of cellsUnder(o)) if (isSolid(c, r)) { if (o.vx > 0) o.x = c * TILE - o.w; else if (o.vx < 0) o.x = (c + 1) * TILE; o.vx = 0; }
  if (o.x < 0) { o.x = 0; o.vx = 0; }
  // Vertikal: nach unten die Unterkante inklusive prüfen, sonst sinkt die Figur jeden zweiten Frame ein und "zittert"
  o.y += o.vy; o.onGround = false;
  const c0 = Math.floor(o.x / TILE), c1 = Math.floor((o.x + o.w - 1) / TILE);
  if (o.vy >= 0) {
    const r = Math.floor((o.y + o.h) / TILE);
    for (let c = c0; c <= c1; c++) if (isSolid(c, r)) { o.y = r * TILE - o.h; o.onGround = true; o.vy = 0; break; }
  } else {
    const r = Math.floor(o.y / TILE);
    for (let c = c0; c <= c1; c++) if (isSolid(c, r) || (isPlayer && r >= 0 && r < ROWS && solidMap[r][c] === "h")) { o.y = (r + 1) * TILE; o.vy = 0; if (isPlayer) hitBlock(c, r); break; }
  }
}
function hitBlock(c, r) {
  const t = solidMap[r][c];
  if (t === "h") {
    solidMap[r][c] = "U"; pokeballs++; score += 200; beep(1000, 0.1, "triangle"); burst(c * TILE + 20, r * TILE + 20, "#ffde00", 12);
    particles.push({ x: c * TILE + 8, y: r * TILE - 24, vx: 0, vy: -3, life: 25, ball: true });
    foundSecret("h:" + c + "," + r, "Versteckter Block!");
  } else if (t === "?") {
    solidMap[r][c] = "U"; pokeballs++; score += 200; healTeam(1);
    beep(1000, 0.1, "triangle"); burst(c * TILE + 20, r * TILE - 5, "#f33");
    particles.push({ x: c * TILE + 8, y: r * TILE - 24, vx: 0, vy: -3, life: 25, ball: true });
    toast("Ein Trank! Team vollständig geheilt. +1 Pokéball");
  } else if (t === "B") { solidMap[r][c] = " "; score += 50; beep(200, 0.1); burst(c * TILE + 20, r * TILE + 20, "#b5651d", 10); }
  else beep(150, 0.05);
}
function foundSecret(key, text) {
  if (progress.secrets.includes(key)) return;
  progress.secrets.push(key); score += 300; jingle([784, 1047, 1319], 0.08);
  toast(`★ ${text} (${progress.secrets.length}/${THEME.secretTotal || "?"} Geheimnisse)`, "#ffde00");
}
function doorAt(p) {
  for (const [c, r] of cellsUnder(p)) { const t = tileAt(c, r); if (t >= "1" && t <= "9") return { t, c, r }; }
  const rb = Math.floor((p.y + p.h + 2) / TILE);
  for (let c = Math.floor(p.x / TILE); c <= Math.floor((p.x + p.w - 1) / TILE); c++) { const t = tileAt(c, rb); if (t >= "1" && t <= "9") return { t, c, r: rb }; }
  return null;
}
function useDoor(d) {
  const guard = pumpkins.find(k => !k.fleeing && Math.abs(k.x + k.w / 2 - (d.c * TILE + 20)) < 95 && Math.abs(k.y + k.h - (d.r + 1) * TILE) < 60);
  if (guard) { toast("Die Kürbisse versperren die Tür! Verscheuche sie mit Gurken (Taste G).", "#ffb347"); beep(200, 0.1); return; }
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (LEVEL[r][c] === d.t && (c !== d.c || r !== d.r)) {
    const p = player; burst(p.x + 15, p.y + 18, "#ffde00", 10);
    p.x = c * TILE + 5; p.y = (isSolid(c, r) ? r : r + 1) * TILE - p.h; p.vx = 0; p.vy = 0; p.inv = 12; p.px = p.x; p.py = p.y;
    camX = clamp(p.x - W * 0.4, 0, LEVEL_W - W); prevCamX = camX; camY = clamp(p.y - H * 0.55, 0, Math.max(0, LEVEL_H - H)); prevCamY = camY;
    burst(p.x + 15, p.y + 18, "#ffde00", 10); beep(660, 0.1, "triangle"); foundSecret("d:" + d.t, THEME.museum ? "Durch das Gemälde gesprungen!" : "Geheimtür benutzt!");
    return;
  }
}
function healTeam(frac) { for (const m of team) if (m.hp > 0) m.hp = Math.min(m.maxHp, m.hp + Math.ceil(m.maxHp * frac)); }
function stomp(e) {
  e.alive = false; e.vy = -4; score += 300; beep(300, 0.1); burst(e.x + e.w / 2, e.y + e.h / 2, "#fff", 8);
  const lead = team[aliveIdx()];
  if (lead) { const gain = Math.floor((wildLevel(e) * 12 + 10) / 2); lead.xp += gain; toast(`${monName(lead)} +${gain} EP`); levelUpsOutsideBattle(lead); }
}
function levelUpsOutsideBattle(m) {
  while (m.xp >= xpNeeded(m)) { m.xp -= xpNeeded(m); m.level++; const old = m.maxHp; m.maxHp = calcMaxHp(m); m.hp += m.maxHp - old; toast(`${monName(m)} erreicht Level ${m.level}!`, "#ffde00"); jingle([660, 880]); }
  const ev = sp(m).evolve;
  if (ev && m.level >= ev.level) evolveMon(m);
}
function evolveMon(m) {
  const from = monName(m), ratio = m.hp / m.maxHp;
  m.key = sp(m).evolve.to; m.maxHp = calcMaxHp(m); m.hp = Math.max(1, Math.round(m.maxHp * ratio));
  stats.evolutions++; jingle([523, 587, 659, 698, 784, 880, 988, 1047], 0.07);
  if (state !== "battle") toast(`${from} hat sich zu ${monName(m)} entwickelt!`, "#ffde00");
  return from;
}
function wildLevel(e) { return e.fixedLevel || Math.max(2, THEME.levelBonus + diff.lvl + 3 + Math.floor(e.x / 1300)); }
function die() {
  if (state !== "play") return;
  lives--; beep(180, 0.4, "sawtooth"); burst(player.x + 15, player.y + 18, "#ffde00", 20);
  if (lives <= 0) state = "gameover";
  else { state = "dying"; setTimeout(() => { init(true); player.inv = 90; }, 900); }
}
function burst(x, y, color, n = 6) { for (let i = 0; i < n; i++) particles.push({ x, y, vx: (Math.random() - 0.5) * 6, vy: -Math.random() * 5, life: 30 + Math.random() * 20, color }); }

// =====================================================================
// Kampfsystem
// =====================================================================
function startBattle(enemy, ambush) {
  const lvl = enemy.fixedLevel || wildLevel(enemy) + (Math.random() < 0.4 ? 1 : 0);
  const wild = makeMon(enemy.key, lvl);
  wild.sleep = enemy.asleep ? (enemy.boss ? 3 : 2) : 0;
  const mine = aliveIdx();
  battle = { enemy, wild, mine, queue: [], step: null, phase: "msg", menu: 0, sub: 0, t: 0, text: "", shown: { me: team[mine].hp, wild: wild.hp }, anim: null, inBall: false, forced: false, evoKey: null, ballColor: "#e3350d" };
  state = "battle"; stats.battles++;
  player.vx = 0; projectiles = [];
  jingle([440, 0, 440, 0, 392, 349], 0.07);
  if (enemy.boss) {
    push({ text: `${enemy.title} ${monName(wild).toUpperCase()} (Lv. ${lvl}) versperrt dir den Weg!${wild.sleep ? " Es schnarcht laut... Zzz" : enemy.key === "lahmus" ? " Es gähnt gelangweilt..." : enemy.key === "laschoking" ? " Es mustert dich klug." : enemy.key === "lapras" ? " Es gleitet singend aus der Tiefe herauf." : enemy.key === "arktos" ? " Eisiger Wind weht dir entgegen!" : enemy.key === "gengar" ? " Es kichert aus dem Schatten: Buh!" : enemy.key === "mewtu" ? " Es schwebt schweigend vor dem letzten Saal." : ""}` });
    push({ text: enemy.tip, hold: 130 });
  } else if (enemy.key === "mew") {
    push({ text: `Ein wildes MEW (Lv. ${lvl}) schwebt vor dir! Es sieht dich neugierig an...` });
    push({ text: masterBalls > 0 ? "Tipp: Wähle POKÉBALL, dein Meisterball fängt es garantiert!" : "Tipp: Hol dir zuerst den lila Meisterball am Start!", hold: 120 });
  } else push({ text: wild.sleep ? `Ein wildes ${monName(wild)} (Lv. ${lvl}) schläft hier... Zzz` : `Ein wildes ${monName(wild)} (Lv. ${lvl}) erscheint!` });
  push({ text: `Los, ${monName(team[mine])}!`, hold: 50 });
  if (ambush && enemy.key !== "mew" && !enemy.boss) { push({ text: `Das wilde ${monName(wild)} greift überraschend an!` }); push({ fn: wildTurn }); }
}
const push = (...s) => battle.queue.push(...s);
const insert = (...s) => battle.queue.unshift(...s);
const me = () => team[battle.mine];

function updateBattle() {
  const b = battle; b.t++;
  b.shown.me += (me().hp - b.shown.me) * 0.12; b.shown.wild += (b.wild.hp - b.shown.wild) * 0.12;
  if (Math.abs(b.shown.me - me().hp) < 0.3) b.shown.me = me().hp;
  if (Math.abs(b.shown.wild - b.wild.hp) < 0.3) b.shown.wild = b.wild.hp;

  if (b.step) {
    const s = b.step; s.t++;
    if (s.text !== undefined) { if ((confirmPressed() && s.t > 8) || s.t > (s.hold ?? 80)) b.step = null; }
    else if (s.anim) { if (s.t >= s.dur) { b.anim = null; b.step = null; } }
    else if (s.wait) { if (s.t >= s.wait) b.step = null; }
    return; // Schritt läuft noch oder wurde gerade beendet: Menü frühestens im nächsten Frame, damit ein Tastendruck nicht doppelt zählt
  }
  if (b.queue.length) {
    const s = b.queue.shift(); s.t = 0;
    if (s.fn) { s.fn(); return; }
    b.step = s; b.phase = "msg";
    if (s.text !== undefined) b.text = s.text;
    if (s.anim) b.anim = { ...s.anim, dur: s.dur };
    return;
  }
  if (state !== "battle") return;
  if (b.phase === "msg") { b.phase = b.forced ? "switch" : "menu"; b.sub = 0; b.text = b.forced ? "Welches Pokémon soll kämpfen?" : `Was soll ${monName(me())} tun?`; }
  if (b.phase === "menu") {
    if (pressed.ArrowLeft || pressed.ArrowRight || pressed.KeyA || pressed.KeyD) { b.menu ^= 1; beep(600, 0.03); }
    if (pressed.ArrowUp || pressed.ArrowDown || pressed.KeyW || pressed.KeyS) { b.menu ^= 2; beep(600, 0.03); }
    if (confirmPressed()) {
      beep(800, 0.05);
      if (b.menu === 0) { b.phase = "moves"; b.sub = 0; }
      else if (b.menu === 1) throwBallInBattle();
      else if (b.menu === 2) { b.phase = "switch"; b.sub = 0; }
      else tryFlee();
    }
  } else if (b.phase === "moves") {
    const moves = sp(me()).moves;
    if (pressed.ArrowUp || pressed.ArrowDown || pressed.KeyW || pressed.KeyS) { b.sub = (b.sub + 1) % moves.length; beep(600, 0.03); }
    if (backPressed()) b.phase = "menu";
    else if (confirmPressed()) { b.phase = "msg"; doAttack(me(), b.wild, MOVES[moves[b.sub]], true); }
  } else if (b.phase === "switch") {
    const choices = team.map((m, i) => i).filter(i => i !== b.mine && team[i].hp > 0);
    if (!choices.length) { b.phase = "menu"; b.text = "Kein anderes Pokémon einsatzbereit!"; return; }
    if (pressed.ArrowUp || pressed.KeyW) { b.sub = (b.sub + choices.length - 1) % choices.length; beep(600, 0.03); }
    if (pressed.ArrowDown || pressed.KeyS) { b.sub = (b.sub + 1) % choices.length; beep(600, 0.03); }
    if (backPressed() && !b.forced) b.phase = "menu";
    else if (confirmPressed()) {
      const idx = choices[b.sub], wasForced = b.forced;
      b.forced = false; b.phase = "msg";
      if (!wasForced) push({ text: `Komm zurück, ${monName(me())}!`, hold: 40 });
      push({ fn: () => { b.mine = idx; leadIdx = idx; b.shown.me = me().hp; } });
      push({ text: `Los, ${monName(team[idx])}!`, hold: 50 });
      if (!wasForced) push({ fn: wildTurn });
    }
  }
}

function doAttack(att, def, move, isMe) {
  const who = isMe ? "" : "Wildes ";
  if (!move.power) { insert({ text: `${who}${monName(att)} setzt ${move.name} ein!`, hold: 45 }, { text: move.flavor || "Aber nichts passiert!", hold: 70 }, { fn: () => afterDamage(isMe) }); return; }
  insert(
    { text: `${who}${monName(att)} setzt ${move.name} ein!`, hold: 45 },
    { anim: { type: "lunge", who: isMe ? "me" : "wild" }, dur: 22 },
    { fn: () => {
      const r = calcDamage(att, def, move, isMe ? diff.dmgDealt : diff.dmgTaken);
      def.hp = Math.max(0, def.hp - r.dmg);
      beep(r.eff > 1 ? 220 : 330, 0.12, "sawtooth");
      const extra = [];
      if (r.crit) extra.push({ text: "Ein Volltreffer!", hold: 50 });
      if (r.eff === 0) extra.push({ text: "Es hat keine Wirkung!", hold: 60 });
      else if (r.eff > 1) extra.push({ text: "Das ist sehr effektiv!", hold: 50 });
      else if (r.eff < 1) extra.push({ text: "Das ist nicht sehr effektiv...", hold: 50 });
      insert({ anim: { type: "hit", who: isMe ? "wild" : "me" }, dur: 24 }, { wait: 20 }, ...extra, { fn: () => afterDamage(isMe) });
    } }
  );
}
function afterDamage(iAttacked) {
  const b = battle;
  if (iAttacked) { if (b.wild.hp <= 0) wildFainted(); else wildTurn(); }
  else if (me().hp <= 0) myFainted();
}
function wildTurn() {
  const b = battle; if (b.wild.hp <= 0) return;
  if (b.wild.sleep > 0) {
    b.wild.sleep--;
    const steps = [{ text: `Das wilde ${monName(b.wild)} schläft tief und fest... Zzz`, hold: 70 }];
    if (b.wild.sleep === 0) steps.push({ text: `${monName(b.wild)} ist aufgewacht!`, hold: 60 });
    insert(...steps); return;
  }
  const moves = sp(b.wild).moves;
  const preferred = sp(b.wild).wildMove ?? 0; // wildes Mew kichert meistens, statt anzugreifen
  const move = MOVES[moves[Math.random() < (preferred ? 0.7 : 0.6) ? preferred : 1 - preferred]];
  doAttack(b.wild, me(), move, false);
}
function wildFainted() {
  const b = battle;
  insert(
    { anim: { type: "faint", who: "wild" }, dur: 40 },
    { text: b.enemy.boss ? `${b.enemy.title} ist besiegt! Der Weg ist frei.` : b.wild.key === "mew" ? "Mew lächelt, winkt dir zu und verschwindet in den Wolken..." : `Das wilde ${monName(b.wild)} wurde besiegt!` },
    { fn: () => { score += 300; giveXp(me(), Math.floor(b.wild.level * 12 + 10)); push({ fn: () => endBattle("win") }); } }
  );
}
function giveXp(m, gain) {
  m.xp += gain;
  const steps = [{ text: `${monName(m)} erhält ${gain} Erfahrungspunkte!`, hold: 60 }];
  while (m.xp >= xpNeeded(m)) {
    m.xp -= xpNeeded(m); m.level++;
    const old = m.maxHp; m.maxHp = calcMaxHp(m); m.hp += m.maxHp - old;
    const lv = m.level;
    steps.push({ fn: () => jingle([660, 880]) }, { text: `${monName(m)} erreicht Level ${lv}!`, hold: 60 });
  }
  const ev = sp(m).evolve;
  if (ev && m.level >= ev.level) {
    steps.push(
      { text: `Was? ${monName(m)} entwickelt sich!`, hold: 60 },
      { fn: () => { battle.evoKey = ev.to; } },
      { anim: { type: "evolve", who: "me" }, dur: 130 },
      { fn: () => { const from = evolveMon(m); battle.evoKey = null; insert({ text: `Glückwunsch! Dein ${from} hat sich zu ${monName(m)} entwickelt!`, hold: 130 }); } }
    );
  }
  insert(...steps);
}
function myFainted() {
  const b = battle;
  insert(
    { anim: { type: "faint", who: "me" }, dur: 40 },
    { text: `${monName(me())} wurde besiegt!` },
    { fn: () => {
      if (team.some(m => m.hp > 0)) { b.forced = true; b.phase = "msg"; }
      else insert({ text: "Dir sind die Pokémon ausgegangen! Du fliehst zurück..." }, { fn: () => { endBattle("lose"); die(); } });
    } }
  );
}
function throwBallInBattle() {
  const b = battle; b.phase = "msg";
  const useMaster = masterBalls > 0;
  if (!useMaster && pokeballs <= 0) { push({ text: "Du hast keine Pokébälle mehr! Sammle welche im Level.", hold: 90 }); return; }
  if (team.length >= 6) { push({ text: "Dein Team ist voll (6 Pokémon)!", hold: 90 }); return; }
  if (useMaster) masterBalls--; else pokeballs--;
  b.ballColor = useMaster ? "#8a4fd6" : "#e3350d";
  const hpFrac = b.wild.hp / b.wild.maxHp;
  let p = 0.1 + 0.8 * Math.pow(1 - hpFrac, 1.3) + 0.03 * (me().level - b.wild.level) + diff.catchBonus + (b.wild.sleep > 0 ? 0.25 : 0);
  p = clamp(p, 0.05, 0.95);
  const success = useMaster || Math.random() < p;
  const shakes = success ? 3 : Math.min(2, Math.floor(p * 3 + Math.random()));
  const steps = [
    { text: useMaster ? "Du wirfst den MEISTERBALL!" : "Du wirfst einen Pokéball!", hold: 40 },
    { anim: { type: "ballfly" }, dur: 34 },
    { fn: () => { b.inBall = true; beep(500, 0.08); } },
    { wait: 25 },
  ];
  for (let i = 0; i < shakes; i++) steps.push({ fn: () => beep(260, 0.06) }, { anim: { type: "shake" }, dur: 36 });
  if (success) steps.push(
    { fn: () => { jingle([784, 988, 1175], 0.1); } },
    { anim: { type: "caught" }, dur: 50 },
    { text: `Toll! ${monName(b.wild)} wurde gefangen!`, hold: 110 },
    { fn: () => { const c = { ...b.wild, xp: 0 }; team.push(c); stats.caught++; score += 500; insert({ text: `${monName(c)} ist jetzt in deinem Team (Platz ${team.length}).`, hold: 90 }, { fn: () => endBattle("caught") }); } }
  );
  else steps.push(
    { fn: () => { b.inBall = false; beep(200, 0.15, "sawtooth"); } },
    { anim: { type: "break" }, dur: 20 },
    { text: shakes === 0 ? "Oh nein! Das Pokémon ist sofort ausgebrochen!" : shakes === 1 ? "Mist! Fast hätte es geklappt!" : "Argh! So knapp daneben!" },
    { fn: wildTurn }
  );
  push(...steps);
}
function tryFlee() {
  const b = battle; b.phase = "msg";
  const p = clamp(0.6 + 0.1 * (me().level - b.wild.level), 0.3, 0.95);
  if (Math.random() < p) push({ text: "Du bist entkommen!", hold: 60 }, { fn: () => endBattle("flee") });
  else push({ text: "Flucht gescheitert!" }, { fn: wildTurn });
}
function endBattle(result) {
  const b = battle;
  state = "play"; battle = null;
  if ((result === "win" || result === "caught") && b.enemy.boss) progress.bossesDone.push(b.enemy.id);
  if (result === "win") { b.enemy.alive = false; b.enemy.vy = -4; burst(b.enemy.x + 16, b.enemy.y + 16, "#fff", 8); }
  if (result === "caught") { enemies = enemies.filter(e => e !== b.enemy); burst(b.enemy.x + 16, b.enemy.y + 16, "#f33", 12); }
  player.inv = 90;
  if (result === "flee" || result === "lose") { player.vx = -5 * player.facing; player.vy = -5; }
  leadIdx = b.mine;
  if (team[leadIdx].hp <= 0) leadIdx = Math.max(0, aliveIdx());
}

// =====================================================================
// Sprite-Zeichner
// =====================================================================
const off = document.createElement("canvas"); off.width = 260 * DPR; off.height = 260 * DPR;
const offCtx = off.getContext("2d"); offCtx.scale(DPR, DPR);
let g = ctx; // aktueller Zeichenkontext (Haupt oder Offscreen)

function E(x, y, rx, ry) { g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, 7); g.fill(); }
function Rc(x, y, w, h) { g.fillRect(x, y, w, h); }
function P(pts) { g.beginPath(); g.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]); g.closePath(); g.fill(); }

// Zeichnet ein Pokémon mit Füßen bei (cx, fy). facing 1 = nach rechts.
function drawMon(key, cx, fy, s, facing, o = {}) {
  const L = SPECIES[key].look;
  g.save(); g.translate(cx, fy); g.scale(facing * s, s);
  if (o.alpha != null) g.globalAlpha = o.alpha;
  const bob = o.bob || 0, walk = o.walk || 0, z = L.size;
  const B = L.body, D = L.dark || "#333", Y = L.belly;
  if (L.kind === "bat") {
    const flap = Math.sin(time * 0.3) * 7;
    const cy = -13 * z;
    g.fillStyle = B;
    P([0, cy, -18 * z, cy - 10 + flap, -14 * z, cy + 4 + flap, -6 * z, cy + 2]);
    P([0, cy, 18 * z, cy - 10 + flap, 14 * z, cy + 4 + flap, 6 * z, cy + 2]);
    E(0, cy, 8 * z, 9 * z);
    P([-5 * z, cy - 7 * z, -7 * z, cy - 15 * z, -1 * z, cy - 8 * z]);
    P([5 * z, cy - 7 * z, 7 * z, cy - 15 * z, 1 * z, cy - 8 * z]);
    g.fillStyle = "#222"; P([-4 * z, cy + 3 * z, 4 * z, cy + 3 * z, 0, cy + 7 * z]);
    g.fillStyle = "#fff"; P([-3 * z, cy + 3 * z, -2 * z, cy + 6 * z, -1 * z, cy + 3 * z]); P([3 * z, cy + 3 * z, 2 * z, cy + 6 * z, 1 * z, cy + 3 * z]);
    if (L.eyes) { g.fillStyle = "#fff"; E(-3 * z, cy - 1 * z, 2.2, 2.2); E(3 * z, cy - 1 * z, 2.2, 2.2); g.fillStyle = "#222"; E(-3 * z, cy - 1 * z, 1, 1); E(3 * z, cy - 1 * z, 1, 1); }
    if (o.cap) drawCap(2 * z, cy - 9 * z, z);
    g.restore(); return;
  }
  if (L.kind === "rock") {
    const arms = L.arms || 1;
    g.strokeStyle = B; g.lineWidth = 5 * z; g.lineCap = "round";
    for (let a = 0; a < arms; a++) { const ay = -12 * z - a * 9 * z, sw = Math.sin(time * 0.1 + a) * 2; g.beginPath(); g.moveTo(-10 * z, ay); g.lineTo(-24 * z, ay - 6 * z + sw); g.moveTo(10 * z, ay); g.lineTo(24 * z, ay - 6 * z - sw); g.stroke(); }
    g.lineCap = "butt"; g.lineWidth = 1;
    g.fillStyle = D; E(-25 * z, -18 * z, 5 * z, 4 * z); E(25 * z, -18 * z, 5 * z, 4 * z);
    g.fillStyle = B; E(0, -13 * z + bob, 15 * z, 12 * z); g.fillStyle = D; E(-6 * z, -20 * z, 3 * z, 2 * z); E(8 * z, -8 * z, 2.5 * z, 2 * z);
    g.fillStyle = "#fff"; E(5 * z, -15 * z, 3 * z, 3 * z); E(-4 * z, -15 * z, 3 * z, 3 * z); g.fillStyle = "#222"; E(6 * z, -15 * z, 1.5 * z, 1.8 * z); E(-3 * z, -15 * z, 1.5 * z, 1.8 * z);
    g.strokeStyle = "#222"; g.lineWidth = 1.5; g.beginPath(); g.moveTo(-8 * z, -20 * z); g.lineTo(-1 * z, -18 * z); g.moveTo(9 * z, -20 * z); g.lineTo(2 * z, -18 * z); g.moveTo(-3 * z, -8 * z); g.lineTo(4 * z, -8 * z); g.stroke(); g.lineWidth = 1;
    if (o.cap) drawCap(1 * z, -24 * z, z);
    g.restore(); return;
  }
  if (L.kind === "slowbro" || L.kind === "slowking") {
    const king = L.kind === "slowking";
    if (!king) { g.strokeStyle = B; g.lineWidth = 6 * z; g.beginPath(); g.moveTo(-8 * z, -10 * z); g.quadraticCurveTo(-18 * z, -8 * z, -22 * z, -14 * z); g.stroke(); g.lineWidth = 1;
      g.fillStyle = "#9a9aa8"; E(-26 * z, -16 * z, 10 * z, 9 * z); g.strokeStyle = "#5a5a68"; g.lineWidth = 1.5; g.beginPath(); g.arc(-26 * z, -16 * z, 6 * z, 0, 4.5); g.arc(-26 * z, -16 * z, 3 * z, 0, 4); g.stroke(); g.lineWidth = 1;
      g.fillStyle = "#5a5a68"; P([-18 * z, -22 * z, -14 * z, -26 * z, -16 * z, -18 * z]); P([-18 * z, -10 * z, -14 * z, -6 * z, -16 * z, -14 * z]); }
    g.fillStyle = B; E(0, -16 * z + bob * 0.5, 15 * z, 14 * z); g.fillStyle = Y; E(2 * z, -13 * z, 9 * z, 9 * z);
    g.fillStyle = D; Rc(-12 * z, -4 * z, 9 * z, 4 * z); Rc(3 * z, -4 * z, 9 * z, 4 * z);
    if (king) { g.fillStyle = "#fff"; E(2 * z, -27 * z, 14 * z, 5 * z); }
    g.fillStyle = B; E(2 * z, -33 * z + bob, 12 * z, 11 * z); g.fillStyle = Y; E(9 * z, -31 * z + bob, 6 * z, 4 * z);
    g.fillStyle = B; P([-6 * z, -40 * z, -9 * z, -47 * z, -2 * z, -42 * z]); P([8 * z, -41 * z, 12 * z, -47 * z, 13 * z, -40 * z]);
    const ey2 = -35 * z + bob; g.fillStyle = "#fff"; E(6 * z, ey2, 2.8 * z, 2.8 * z); E(-2 * z, ey2, 2.8 * z, 2.8 * z); g.fillStyle = "#222"; E(6.5 * z, ey2, 1.3 * z, 1.5 * z); E(-1.5 * z, ey2, 1.3 * z, 1.5 * z);
    if (!king) { g.fillStyle = B; Rc(3 * z, ey2 - 3.2 * z, 6.5 * z, 3 * z); Rc(-5 * z, ey2 - 3.2 * z, 6.5 * z, 3 * z); }
    g.strokeStyle = "#222"; g.beginPath(); g.moveTo(4 * z, -29 * z + bob); g.lineTo(9 * z, -29 * z + bob); g.stroke();
    if (king) {
      g.fillStyle = "#9a9aa8"; E(2 * z, -46 * z + bob, 13 * z, 7 * z);
      g.fillStyle = "#8a8a98"; for (let i = -2; i <= 2; i++) P([2 * z + i * 5 * z - 3 * z, -47 * z + bob, 2 * z + i * 5 * z, -58 * z + bob + Math.abs(i) * 2 * z, 2 * z + i * 5 * z + 3 * z, -47 * z + bob]);
      g.fillStyle = "#e3350d"; E(2 * z, -46 * z + bob, 3 * z, 3 * z);
    }
    if (o.cap) drawCap(2 * z, -43 * z + bob, z * 0.8);
    g.restore(); return;
  }
  if (L.kind === "mewtwo") {
    const fl = Math.sin(time * 0.06) * 2 * z;
    g.strokeStyle = Y; g.lineWidth = 6 * z; g.lineCap = "round"; g.beginPath(); g.moveTo(-6 * z, -14 * z); g.quadraticCurveTo(-26 * z, -8 * z, -30 * z, -30 * z + fl); g.stroke(); g.lineCap = "butt"; g.lineWidth = 1;
    g.fillStyle = D; Rc(-10 * z, -8 * z, 7 * z, 8 * z); Rc(3 * z, -8 * z, 7 * z, 8 * z);
    g.fillStyle = B; E(0, -22 * z + fl, 11 * z, 15 * z); g.fillStyle = Y; E(1 * z, -20 * z + fl, 5 * z, 9 * z);
    g.fillStyle = B; E(-14 * z, -26 * z + fl, 4 * z, 3 * z); E(14 * z, -26 * z + fl, 4 * z, 3 * z);
    g.strokeStyle = B; g.lineWidth = 5 * z; g.beginPath(); g.moveTo(-8 * z, -30 * z + fl); g.lineTo(-14 * z, -26 * z + fl); g.moveTo(8 * z, -30 * z + fl); g.lineTo(14 * z, -26 * z + fl); g.stroke(); g.lineWidth = 1;
    g.fillStyle = B; E(1 * z, -44 * z + fl, 11 * z, 10 * z); P([-8 * z, -50 * z + fl, -9 * z, -62 * z + fl, -2 * z, -52 * z + fl]); P([10 * z, -50 * z + fl, 11 * z, -62 * z + fl, 4 * z, -52 * z + fl]);
    g.strokeStyle = Y; g.lineWidth = 4 * z; g.beginPath(); g.moveTo(-9 * z, -46 * z + fl); g.quadraticCurveTo(-18 * z, -40 * z, -12 * z, -32 * z + fl); g.stroke(); g.lineWidth = 1;
    g.fillStyle = "#7a3ad0"; P([-8 * z, -46 * z + fl, -1 * z, -44 * z + fl, -7 * z, -41 * z + fl]); P([10 * z, -46 * z + fl, 3 * z, -44 * z + fl, 9 * z, -41 * z + fl]);
    if (o.cap) drawCap(1 * z, -54 * z + fl, z * 0.8);
    g.restore(); return;
  }
  if (L.kind === "ghost") {
    const fl = Math.sin(time * 0.08) * 3 * z;
    g.fillStyle = "rgba(160,120,220,.25)"; E(0, -20 * z + fl, 19 * z, 18 * z);
    g.fillStyle = B; E(0, -20 * z + fl, 14 * z, 13 * z);
    if (L.spiky) { g.fillStyle = B; for (let i = -2; i <= 2; i++) P([i * 6 * z - 3 * z, -30 * z + fl, i * 6 * z, -40 * z + fl - Math.abs(i) * 2 * z, i * 6 * z + 3 * z, -30 * z + fl]); P([-14 * z, -16 * z + fl, -20 * z, -26 * z + fl, -13 * z, -24 * z + fl]); P([14 * z, -16 * z + fl, 20 * z, -26 * z + fl, 13 * z, -24 * z + fl]); }
    if (L.hands) { g.fillStyle = B; E(-19 * z, -14 * z + fl + Math.sin(time * 0.1) * 2, 5 * z, 4 * z); E(19 * z, -14 * z + fl - Math.sin(time * 0.1) * 2, 5 * z, 4 * z); }
    const eyeC = L.redEyes ? "#ff3b3b" : "#fff";
    g.fillStyle = eyeC; P([-9 * z, -26 * z + fl, -2 * z, -22 * z + fl, -9 * z, -19 * z + fl]); P([9 * z, -26 * z + fl, 2 * z, -22 * z + fl, 9 * z, -19 * z + fl]);
    g.fillStyle = "#222"; E(-5 * z, -22 * z + fl, 1.5 * z, 1.5 * z); E(5 * z, -22 * z + fl, 1.5 * z, 1.5 * z);
    g.fillStyle = "#fff"; g.beginPath(); g.moveTo(-9 * z, -13 * z + fl); g.quadraticCurveTo(0, -5 * z + fl, 9 * z, -13 * z + fl); g.lineTo(9 * z, -12 * z + fl); g.quadraticCurveTo(0, -8 * z + fl, -9 * z, -12 * z + fl); g.fill();
    g.strokeStyle = D; g.lineWidth = 1; g.beginPath(); for (let i = -2; i <= 2; i++) { g.moveTo(i * 3.5 * z, -12.5 * z + fl - Math.abs(i) * 0.5 * z); g.lineTo(i * 3.5 * z, -9 * z + fl - Math.abs(i) * 1.2 * z); } g.stroke();
    if (o.cap) drawCap(0, -32 * z + fl, z * 0.9);
    g.restore(); return;
  }
  if (L.kind === "lapras") {
    const S = L.shell || "#b8a888", sway = Math.sin(time * 0.04) * 2 * z;
    g.fillStyle = D; E(-12 * z, -4 * z, 9 * z, 4 * z); E(10 * z, -4 * z, 9 * z, 4 * z);
    g.fillStyle = B; E(0, -22 * z, 19 * z, 14 * z);
    g.fillStyle = S; E(-4 * z, -34 * z, 15 * z, 9 * z); g.strokeStyle = "#8a7a5a"; g.lineWidth = 1.5; for (let i = -1; i <= 1; i++) { g.beginPath(); g.arc(-4 * z + i * 9 * z, -34 * z, 4 * z, 0, 7); g.stroke(); } g.lineWidth = 1;
    g.fillStyle = Y; E(6 * z, -18 * z, 11 * z, 8 * z);
    g.strokeStyle = B; g.lineWidth = 10 * z; g.lineCap = "round"; g.beginPath(); g.moveTo(10 * z, -30 * z); g.quadraticCurveTo(20 * z + sway, -48 * z, 19 * z + sway, -62 * z); g.stroke(); g.lineCap = "butt"; g.lineWidth = 1;
    g.fillStyle = B; E(21 * z + sway, -66 * z, 10 * z, 7.5 * z); g.fillStyle = Y; E(27 * z + sway, -64 * z, 5 * z, 3.5 * z);
    g.fillStyle = D; P([17 * z + sway, -72 * z, 19 * z + sway, -80 * z, 22 * z + sway, -72 * z]); E(13 * z + sway, -70 * z, 3 * z, 4 * z);
    g.fillStyle = "#fff"; E(23 * z + sway, -68 * z, 2.6 * z, 2.6 * z); g.fillStyle = "#222"; E(23.6 * z + sway, -68 * z, 1.3 * z, 1.5 * z);
    g.strokeStyle = "#222"; g.beginPath(); g.moveTo(27 * z + sway, -61 * z); g.lineTo(31 * z + sway, -61 * z); g.stroke();
    if (o.cap) drawCap(21 * z + sway, -73 * z, z * 0.7);
    g.restore(); return;
  }
  if (L.kind === "fish") {
    const sw = Math.sin(time * 0.25) * 4 * z;
    g.fillStyle = D; P([-10 * z, -14 * z, -22 * z, -24 * z + sw, -22 * z, -4 * z + sw]);
    g.fillStyle = B; E(0, -14 * z, 13 * z, 10 * z); g.fillStyle = Y; E(2 * z, -11 * z, 8 * z, 5 * z);
    g.fillStyle = D; P([-4 * z, -22 * z, 2 * z, -32 * z, 8 * z, -22 * z]); E(0, -6 * z, 5 * z, 2 * z);
    g.fillStyle = "#fff"; E(7 * z, -16 * z, 3 * z, 3 * z); g.fillStyle = "#222"; E(8 * z, -16 * z, 1.5 * z, 1.5 * z);
    g.strokeStyle = D; g.lineWidth = 1.5; g.beginPath(); g.moveTo(12 * z, -12 * z); g.lineTo(18 * z, -8 * z); g.moveTo(12 * z, -11 * z); g.lineTo(18 * z, -13 * z); g.stroke();
    if (o.cap) drawCap(2 * z, -24 * z, z * 0.8);
    g.restore(); return;
  }
  if (L.kind === "jelly") {
    g.strokeStyle = D; g.lineWidth = 2.5 * z;
    for (let i = -1.5; i <= 1.5; i++) { g.beginPath(); g.moveTo(i * 6 * z, -14 * z); g.quadraticCurveTo(i * 6 * z + Math.sin(time * 0.1 + i) * 5 * z, -4 * z, i * 6 * z + Math.sin(time * 0.13 + i) * 6 * z, 2 * z); g.stroke(); }
    g.lineWidth = 1; g.fillStyle = B; g.beginPath(); g.ellipse(0, -18 * z, 14 * z, 12 * z, 0, Math.PI, 0); g.fill(); Rc(-14 * z, -18 * z, 28 * z, 5 * z);
    g.fillStyle = "rgba(255,255,255,.35)"; E(-5 * z, -24 * z, 4 * z, 3 * z);
    g.fillStyle = "#fff"; E(5 * z, -18 * z, 2.5 * z, 2.5 * z); E(-5 * z, -18 * z, 2.5 * z, 2.5 * z); g.fillStyle = "#222"; E(5.5 * z, -18 * z, 1.2 * z, 1.4 * z); E(-4.5 * z, -18 * z, 1.2 * z, 1.4 * z);
    if (o.cap) drawCap(0, -28 * z, z * 0.9);
    g.restore(); return;
  }
  if (L.kind === "bird") {
    const flap = Math.sin(time * 0.35) * 8 * z;
    g.fillStyle = D; P([-4 * z, -16 * z, -22 * z, -22 * z - flap, -16 * z, -8 * z]); P([4 * z, -16 * z, 22 * z, -22 * z - flap, 16 * z, -8 * z]);
    g.fillStyle = B; E(0, -14 * z, 11 * z, 10 * z); g.fillStyle = Y; E(1 * z, -11 * z, 6 * z, 6 * z);
    g.fillStyle = D; P([-10 * z, -10 * z, -22 * z, -6 * z, -20 * z, -14 * z]);
    g.fillStyle = B; E(5 * z, -26 * z, 7 * z, 6.5 * z);
    if (L.crest) { g.fillStyle = L.crestColor || "#e05050"; P([3 * z, -31 * z, 1 * z, -40 * z, 7 * z, -32 * z]); P([6 * z, -32 * z, 8 * z, -41 * z, 10 * z, -31 * z]); }
    g.fillStyle = "#f0a040"; P([11 * z, -27 * z, 17 * z, -25 * z, 11 * z, -23 * z]);
    g.fillStyle = "#fff"; E(7 * z, -27 * z, 2.2 * z, 2.2 * z); g.fillStyle = "#222"; E(7.5 * z, -27 * z, 1.1 * z, 1.2 * z);
    g.fillStyle = "#f0a040"; Rc(-5 * z, -5 * z, 2 * z, 5 * z); Rc(3 * z, -5 * z, 2 * z, 5 * z);
    if (o.cap) drawCap(5 * z, -32 * z, z * 0.8);
    g.restore(); return;
  }
  if (L.kind === "llama") {
    g.fillStyle = D; Rc(-12 * z, -12 * z, 4 * z, 12 * z); Rc(-5 * z, -12 * z, 4 * z, 12 * z); Rc(4 * z, -12 * z, 4 * z, 12 * z); Rc(10 * z, -12 * z, 4 * z, 12 * z);
    g.fillStyle = B; E(0, -20 * z, 15 * z, 10 * z);
    g.fillStyle = B; g.beginPath(); g.moveTo(8 * z, -24 * z); g.lineTo(12 * z, -44 * z); g.lineTo(18 * z, -44 * z); g.lineTo(16 * z, -22 * z); g.closePath(); g.fill();
    E(15 * z, -46 * z, 7 * z, 5 * z); g.fillStyle = D; E(20 * z, -45 * z, 3 * z, 2 * z);
    g.fillStyle = B; P([10 * z, -50 * z, 9 * z, -57 * z, 13 * z, -51 * z]); P([16 * z, -50 * z, 18 * z, -57 * z, 19 * z, -50 * z]);
    g.fillStyle = "#222"; E(15 * z, -48 * z, 1.3 * z, 1.5 * z);
    g.fillStyle = D; E(-14 * z, -22 * z, 2.5 * z, 4 * z);
    if (o.cap) drawCap(14 * z, -51 * z, z * 0.7);
    g.restore(); return;
  }
  if (L.kind === "lion") {
    g.fillStyle = B; E(-2 * z, -14 * z, 15 * z, 11 * z); Rc(-13 * z, -8 * z, 6 * z, 8 * z); Rc(4 * z, -8 * z, 6 * z, 8 * z);
    g.strokeStyle = B; g.lineWidth = 3 * z; g.beginPath(); g.moveTo(-16 * z, -14 * z); g.quadraticCurveTo(-28 * z, -10 * z, -26 * z, -26 * z); g.stroke(); g.lineWidth = 1; g.fillStyle = D; E(-26 * z, -27 * z, 3.5 * z, 3.5 * z);
    g.fillStyle = D; E(6 * z, -30 * z, 17 * z, 16 * z);
    g.fillStyle = B; E(6 * z, -30 * z, 11 * z, 10 * z);
    g.fillStyle = "#fff"; E(10 * z, -32 * z, 2.5 * z, 2.5 * z); E(2 * z, -32 * z, 2.5 * z, 2.5 * z); g.fillStyle = "#222"; E(10.5 * z, -32 * z, 1.3 * z, 1.5 * z); E(2.5 * z, -32 * z, 1.3 * z, 1.5 * z);
    g.fillStyle = "#5a2a10"; P([4 * z, -27 * z, 8 * z, -27 * z, 6 * z, -24 * z]);
    g.fillStyle = "#f8d030"; P([-2 * z, -40 * z, -2 * z, -50 * z, 2 * z, -44 * z, 6 * z, -52 * z, 10 * z, -44 * z, 14 * z, -50 * z, 14 * z, -40 * z]);
    g.fillStyle = "#e3350d"; E(6 * z, -45 * z, 1.8 * z, 1.8 * z);
    if (o.cap) drawCap(6 * z, -44 * z, z * 0.9);
    g.restore(); return;
  }
  if (L.kind === "relaxo") {
    g.fillStyle = B; E(0, -18 * z, 19 * z, 17 * z); E(0, -36 * z, 12 * z, 9 * z);
    g.fillStyle = D; Rc(-16 * z, -5 * z, 10 * z, 5 * z); Rc(6 * z, -5 * z, 10 * z, 5 * z); E(-20 * z, -26 * z, 5 * z, 7 * z); E(20 * z, -26 * z, 5 * z, 7 * z);
    g.fillStyle = Y; E(0, -16 * z, 13 * z, 12 * z); E(2 * z, -36 * z, 8 * z, 5.5 * z);
    g.fillStyle = B; P([-9 * z, -42 * z, -6 * z, -50 * z, -2 * z, -43 * z]); P([9 * z, -42 * z, 6 * z, -50 * z, 2 * z, -43 * z]);
    g.strokeStyle = "#222"; g.lineWidth = 1.5 * z; g.beginPath(); g.moveTo(-6 * z, -37 * z); g.lineTo(-1 * z, -37 * z); g.moveTo(3 * z, -37 * z); g.lineTo(8 * z, -37 * z); g.stroke(); g.lineWidth = 1;
    g.fillStyle = "#fff"; P([-3 * z, -33 * z, -1 * z, -33 * z, -2 * z, -31 * z]); P([3 * z, -33 * z, 5 * z, -33 * z, 4 * z, -31 * z]);
    if (o.cap) drawCap(1 * z, -46 * z, z);
    g.restore(); return;
  }
  if (L.kind === "snake") {
    const n = 7; let hx = 0, hyy = 0;
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1), sx = Math.sin(t * 2.4 + Math.sin(time * 0.05) * 0.3) * 10 * z, sy = -8 * z - t * 46 * z, r = (11 - t * 3.5) * z;
      g.fillStyle = i % 2 ? B : D; E(sx, sy, r, r * 0.85); hx = sx; hyy = sy;
    }
    g.fillStyle = B; E(hx, hyy - 4 * z, 10 * z, 8 * z);
    g.fillStyle = D; P([hx - 2 * z, hyy - 11 * z, hx + 1 * z, hyy - 19 * z, hx + 4 * z, hyy - 11 * z]);
    g.fillStyle = "#fff"; E(hx + 5 * z, hyy - 5 * z, 2.5 * z, 2.5 * z); g.fillStyle = "#222"; E(hx + 6 * z, hyy - 5 * z, 1.2 * z, 1.4 * z);
    g.strokeStyle = "#222"; g.beginPath(); g.moveTo(hx + 2 * z, hyy); g.lineTo(hx + 9 * z, hyy + 1 * z); g.stroke();
    if (o.cap) drawCap(hx + 1 * z, hyy - 12 * z, z * 0.8);
    g.restore(); return;
  }
  const hy = -30 * z + bob; // Kopfmitte
  if (L.wings) {
    const flap = Math.sin(time * 0.15) * 3;
    g.fillStyle = L.wings; P([-6 * z, -24 * z, -30 * z, -48 * z + flap, -34 * z, -22 * z, -12 * z, -16 * z]);
    g.fillStyle = D; P([-6 * z, -24 * z, -14 * z, -34 * z, -12 * z, -16 * z]);
    g.fillStyle = L.wings; P([4 * z, -26 * z, 20 * z, -46 * z + flap, 22 * z, -24 * z, 10 * z, -18 * z]);
  }
  if (L.tail === "pika") {
    g.fillStyle = B; P([-10, -14, -24, -22, -20, -30, -28, -38, -16, -34, -18, -26, -8, -18]);
    g.fillStyle = D; Rc(-14, -18, 6, 5);
  } else if (L.tail === "flame") {
    const fl = 6 * z + Math.sin(time * 0.4) * 1.5;
    g.strokeStyle = B; g.lineWidth = 4 * z; g.beginPath(); g.moveTo(-6 * z, -10 * z); g.quadraticCurveTo(-20 * z, -8 * z, -18 * z, -18 * z); g.stroke(); g.lineWidth = 1;
    g.fillStyle = "#ff7b00"; E(-18 * z, -22 * z, fl, fl * 1.2); g.fillStyle = "#ffd800"; E(-18 * z, -21 * z, fl * 0.5, fl * 0.6);
  } else if (L.tail === "curl") {
    g.strokeStyle = B; g.lineWidth = 5 * z; g.beginPath(); g.moveTo(-8 * z, -10 * z); g.quadraticCurveTo(-22 * z, -6 * z, -20 * z, -20 * z); g.stroke(); g.lineWidth = 1;
    g.fillStyle = B; E(-20 * z, -20 * z, 4 * z, 4 * z);
  } else if (L.tail === "fluff") {
    g.fillStyle = Y || "#fde8b0"; E(-20 * z, -14 * z, 9 * z, 7 * z); E(-26 * z, -20 * z, 6 * z, 5 * z);
  } else if (L.tail === "thin") {
    g.strokeStyle = L.dark || "#333"; g.lineWidth = 2.5 * z; g.beginPath(); g.moveTo(-8 * z, -10 * z); g.quadraticCurveTo(-24 * z, -6 * z, -28 * z, -22 * z); g.stroke(); g.lineWidth = 1;
  } else if (L.tail === "bolt") {
    g.strokeStyle = D; g.lineWidth = 3 * z; g.beginPath(); g.moveTo(-8 * z, -10 * z); g.quadraticCurveTo(-24 * z, -12 * z, -26 * z, -32 * z); g.stroke(); g.lineWidth = 1;
    g.fillStyle = "#f8e030"; P([-26 * z, -32 * z, -36 * z, -40 * z, -30 * z, -40 * z, -38 * z, -50 * z, -22 * z, -38 * z, -28 * z, -38 * z]);
  }
  if (L.back === "bulb") { g.fillStyle = L.bulb; E(-6 * z, -26 * z, 11 * z, 10 * z); g.fillStyle = "#2a7050"; E(-10 * z, -24 * z, 4 * z, 3 * z); }
  if (L.back === "bud") { g.fillStyle = "#3a9a5a"; E(-6 * z, -24 * z, 13 * z, 7 * z); g.fillStyle = L.bulb; E(-6 * z, -30 * z, 8 * z, 10 * z); g.fillStyle = "#c04070"; E(-6 * z, -36 * z, 4 * z, 5 * z); }
  if (L.back === "flower") {
    g.fillStyle = "#3a9a5a"; E(-6 * z, -24 * z, 16 * z, 6 * z);
    g.fillStyle = L.bulb; for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3 + time * 0.01; E(-6 * z + Math.cos(a) * 9 * z, -36 * z + Math.sin(a) * 6 * z, 7 * z, 5 * z); }
    g.fillStyle = "#f8d030"; E(-6 * z, -36 * z, 6 * z, 5 * z);
  }
  if (L.back === "shell") {
    g.fillStyle = L.shell; E(-5 * z, -16 * z, 13 * z, 13 * z);
    g.lineWidth = 1.5; g.strokeStyle = "#6a4820"; g.beginPath(); g.moveTo(-5 * z, -29 * z); g.lineTo(-5 * z, -3 * z); g.moveTo(-18 * z, -16 * z); g.lineTo(8 * z, -16 * z); g.stroke(); g.lineWidth = 1;
    if (L.cannons) { g.fillStyle = "#9aa8b8"; Rc(-24 * z, -40 * z, 6 * z, 18 * z); Rc(-15 * z, -44 * z, 6 * z, 22 * z); g.fillStyle = "#333"; E(-21 * z, -40 * z, 3 * z, 1.5 * z); E(-12 * z, -44 * z, 3 * z, 1.5 * z); }
  }
  g.fillStyle = B; E(0, -14 * z + bob * 0.5, 13 * z, 14 * z);
  g.fillStyle = L.feet || D;
  const wa = Math.sin(walk) * 3;
  Rc(-11 * z, -4 * z + wa, 9 * z, 4 * z); Rc(2 * z, -4 * z - wa, 9 * z, 4 * z);
  if (Y) { g.fillStyle = Y; E(3 * z, -12 * z, 7 * z, 9 * z); }
  if (L.stripes) { g.fillStyle = D; Rc(-9, -12, 4, 10); Rc(-3, -14, 4, 12); }
  g.fillStyle = B; E(2 * z, hy, 12 * z, 11 * z);
  if (L.ears === "pika") {
    g.fillStyle = B; P([-8, hy - 6, -16, hy - 26, -2, hy - 10]); P([8, hy - 7, 18, hy - 24, 13, hy - 6]);
    g.fillStyle = "#222"; P([-13, hy - 19, -16, hy - 26, -10, hy - 20]); P([15, hy - 19, 18, hy - 24, 16, hy - 17]);
  } else if (L.ears === "raichu") {
    g.fillStyle = D; E(-9 * z, hy - 11 * z, 6 * z, 7 * z); E(12 * z, hy - 10 * z, 6 * z, 7 * z);
    g.fillStyle = "#f8e030"; E(-9 * z, hy - 11 * z, 3 * z, 4 * z); E(12 * z, hy - 10 * z, 3 * z, 4 * z);
  } else if (L.ears === "small") {
    g.fillStyle = B; P([-6 * z, hy - 8 * z, -10 * z, hy - 16 * z, -1 * z, hy - 10 * z]); P([8 * z, hy - 9 * z, 12 * z, hy - 16 * z, 12 * z, hy - 7 * z]);
  } else if (L.ears === "fluff") {
    g.fillStyle = Y || "#fde8b0"; E(-8 * z, hy - 9 * z, 5 * z, 4 * z); E(11 * z, hy - 9 * z, 5 * z, 4 * z);
  }
  if (L.horns) {
    g.fillStyle = D; P([2 * z, hy - 10 * z, 0, hy - 18 * z, 6 * z, hy - 10 * z]);
    if (L.horns > 1) P([-6 * z, hy - 8 * z, -10 * z, hy - 16 * z, -2 * z, hy - 9 * z]);
  }
  const ey = hy - 2 * z, eyeC = L.eye || "#222";
  if (o.asleep) { g.strokeStyle = "#222"; g.lineWidth = 1.5 * z; g.beginPath(); g.moveTo(4 * z, ey); g.lineTo(10 * z, ey); g.moveTo(-6 * z, ey); g.lineTo(0, ey); g.stroke(); g.lineWidth = 1; }
  else {
    g.fillStyle = "#fff"; E(7 * z, ey, 3 * z, 3 * z); E(-3 * z, ey, 3 * z, 3 * z);
    g.fillStyle = eyeC; E(8 * z, ey, 1.8 * z, 2 * z); E(-2 * z, ey, 1.8 * z, 2 * z);
    g.fillStyle = "#fff"; Rc(7.5 * z, ey - 1.5 * z, 1, 1); Rc(-2.5 * z, ey - 1.5 * z, 1, 1);
  }
  if (L.sleepyEyes && !o.asleep) { g.fillStyle = B; Rc(3.5 * z, ey - 3.5 * z, 7 * z, 3.5 * z); Rc(-6.5 * z, ey - 3.5 * z, 7 * z, 3.5 * z); }
  if (L.teeth) { g.fillStyle = "#fff"; Rc(1 * z, hy + 6 * z, 2 * z, 3 * z); Rc(4 * z, hy + 6 * z, 2 * z, 3 * z); }
  if (L.leaf) { g.fillStyle = "#3cb043"; g.beginPath(); g.ellipse(4 * z, hy - 14 * z, 8 * z, 3.5 * z, -0.7, 0, 7); g.fill(); g.strokeStyle = "#2e7d32"; g.beginPath(); g.moveTo(1 * z, hy - 10 * z); g.lineTo(7 * z, hy - 18 * z); g.stroke(); }
  if (L.cheeks) { g.fillStyle = L.cheeks; E(12 * z, hy + 4 * z, 3 * z, 3 * z); E(-8 * z, hy + 4 * z, 3 * z, 3 * z); }
  g.strokeStyle = "#222"; g.lineWidth = 1; g.beginPath(); g.moveTo(1 * z, hy + 4 * z); g.lineTo(3 * z, hy + 6 * z); g.lineTo(5 * z, hy + 4 * z); g.stroke();
  if (L.curl) { g.strokeStyle = B; g.lineWidth = 3 * z; g.beginPath(); g.moveTo(3 * z, hy - 10 * z); g.quadraticCurveTo(12 * z, hy - 24 * z, -2 * z, hy - 19 * z); g.stroke(); g.lineWidth = 1; }
  if (L.sparkle) { g.fillStyle = "#fff"; for (let i = 0; i < 3; i++) { const a = time * 0.06 + i * 2.1; Rc(Math.cos(a) * 20 * z, hy + Math.sin(a) * 16 * z, 3, 3); } }
  if (o.cap) drawCap(2 * z, hy - 10 * z, z);
  g.restore();
}
function drawCap(x, y, z) {
  if (crowned) { // goldene Krone
    g.fillStyle = "#f8d030"; P([x - 11 * z, y + 2 * z, x - 11 * z, y - 9 * z, x - 6 * z, y - 3 * z, x, y - 11 * z, x + 6 * z, y - 3 * z, x + 11 * z, y - 9 * z, x + 11 * z, y + 2 * z]);
    g.fillStyle = "#e3350d"; E(x, y - 2 * z, 1.8 * z, 1.8 * z); g.fillStyle = "#3a8ee6"; E(x - 6 * z, y - 1 * z, 1.3 * z, 1.3 * z); E(x + 6 * z, y - 1 * z, 1.3 * z, 1.3 * z);
    g.strokeStyle = "#b8860b"; g.lineWidth = 1; g.strokeRect(x - 11 * z, y - 1 * z, 22 * z, 3 * z); return;
  }
  g.fillStyle = "#e3350d"; g.beginPath(); g.ellipse(x, y, 12 * z, 5 * z, 0, Math.PI, 0); g.fill();
  Rc(x - 8 * z, y - 1, 22 * z, 3); g.fillStyle = "#fff"; E(x + 1, y - 2 * z, 3 * z, 3 * z);
  g.fillStyle = "#e3350d"; g.font = `bold ${5 * z}px monospace`; g.textAlign = "center"; g.fillText("M", x + 1, y - 0.3 * z);
}
// Weiß eingefärbte Variante (Entwicklung)
function drawMonFlash(key, cx, fy, s, facing, white) {
  offCtx.clearRect(0, 0, off.width, off.height);
  g = offCtx; drawMon(key, 130, 230, s, facing); g = ctx;
  offCtx.globalCompositeOperation = "source-atop"; offCtx.fillStyle = `rgba(255,255,255,${white})`; offCtx.fillRect(0, 0, off.width, off.height);
  offCtx.globalCompositeOperation = "source-over";
  ctx.drawImage(off, cx - 130, fy - 230, 260, 260);
}
function drawPokeball(cx, cy, r, rot = 0, color = "#e3350d") {
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot);
  ctx.beginPath(); ctx.arc(0, 0, r, Math.PI, 0); ctx.fillStyle = color; ctx.fill();
  if (color !== "#e3350d") { ctx.fillStyle = "#f0c0ff"; ctx.fillRect(-r * 0.5, -r * 0.75, r * 0.3, r * 0.3); ctx.fillRect(r * 0.2, -r * 0.75, r * 0.3, r * 0.3); }
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI); ctx.fillStyle = "#fff"; ctx.fill();
  ctx.fillStyle = "#222"; ctx.fillRect(-r, -r * 0.12, r * 2, r * 0.24);
  ctx.beginPath(); ctx.arc(0, 0, r * 0.35, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.arc(0, 0, r * 0.2, 0, 7); ctx.fillStyle = "#fff"; ctx.fill();
  ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.strokeStyle = "#222"; ctx.lineWidth = Math.max(1, r * 0.12); ctx.stroke(); ctx.lineWidth = 1;
  ctx.restore();
}

// =====================================================================
// Zeichnen: Overworld
// =====================================================================
function draw() {
  ctx.clearRect(0, 0, W, H);
  if (state === "title") { drawTitle(); return; }
  if (state === "battle") { drawBattle(); return; }
  camDraw = prevCamX === undefined ? camX : prevCamX + (camX - prevCamX) * renderAlpha; // zwischen zwei Physikschritten interpolieren
  camDrawY = prevCamY === undefined ? camY : prevCamY + (camY - prevCamY) * renderAlpha;
  const sky = ctx.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, THEME.sky[0]); sky.addColorStop(1, THEME.sky[1]);
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
  if (THEME.ground === "museum") drawMuseum(); else if (THEME.ground === "castle") drawCastle(); else if (THEME.ground === "mixed") drawMixed(); else if (THEME.ground === "city") drawCity(); else if (THEME.ground === "jungle") drawJungle(); else if (THEME.ground === "stone") drawTemple(); else { drawClouds(); if (THEME.hills) drawHills(); else drawCloudLayer(); }
  ctx.save(); ctx.translate(-camDraw, -camDrawY);
  const c0 = Math.floor(camDraw / TILE), c1 = c0 + W / TILE + 2, r0 = Math.max(0, Math.floor(camDrawY / TILE)), r1 = Math.min(ROWS, r0 + H / TILE + 2);
  for (let r = r0; r < r1; r++) for (let c = c0; c < c1 && c < COLS; c++) drawTile(solidMap[r][c], c * TILE, r * TILE, r);
  for (const m of movers) drawMover(m);
  drawFlag();
  for (const it of items) if (!it.taken) { if (it.star) { drawStar(it.x + 14, it.y + 14 + Math.sin(time * 0.1 + it.x) * 3, 13, true); } else if (it.cucumber) { drawCucumber(it.x + 14, it.y + 12 + Math.sin(time * 0.1 + it.x) * 3, -0.5); } else if (it.secretKey) { drawKey(it.x + 12, it.y + 12 + Math.sin(time * 0.1) * 3); } else if (it.stick) { drawStick(it.x + 14, it.y + 16 + Math.sin(time * 0.1 + it.x) * 3); } else if (it.master) { ctx.fillStyle = "rgba(200,150,255,.35)"; ctx.beginPath(); ctx.arc(it.x + 15, it.y + 15, 22 + Math.sin(time * 0.15) * 3, 0, 7); ctx.fill(); drawPokeball(it.x + 15, it.y + 15 + Math.sin(time * 0.1) * 3, 15, 0, "#8a4fd6"); } else drawPokeball(it.x + 12, it.y + 12 + Math.sin(time * 0.1 + it.x) * 3, 12); }
  if (progress && progress.level === levelIdx) for (const h of progress.huts) drawHut(h, state === "rest" && h.x === restX);
  for (const e of enemies) {
    drawMon(e.key, lerpX(e) + e.w / 2, lerpY(e) + e.h, 1, -e.dir || -1, { alpha: e.alive ? 1 : 0.5, walk: e.flyer || e.asleep || e.stationary ? 0 : time * 0.2, asleep: e.asleep });
    if (e.asleep && e.alive) { ctx.fillStyle = "#fff"; ctx.font = "bold 13px monospace"; ctx.textAlign = "left"; const t = (time * 0.5) % 40; ctx.globalAlpha = 1 - t / 40; ctx.fillText("z", e.x + e.w + 2 + t * 0.2, e.y - 4 - t * 0.6); ctx.globalAlpha = 1; }
  }
  for (const b of projectiles) { if (b.cucumber) drawCucumber(lerpX(b) + 11, lerpY(b) + 6, b.rot); else drawPokeball(lerpX(b) + 8, lerpY(b) + 8, 8, b.rot); }
  for (const k of pumpkins) drawPumpkin(k);
  if (balloon && !player.riding) drawBalloon(balloon.x, balloon.y);
  if (state !== "dying" && state !== "rest") {
    const p = player, s = 1 / SPECIES[avatarKey()].look.size;
    if (p.riding) drawBalloon(lerpX(p) - 2, lerpY(p) - 30);
    drawMon(avatarKey(), lerpX(p) + p.w / 2, lerpY(p) + p.h, s, p.facing, { cap: true, alpha: p.inv ? 0.5 + 0.2 * Math.sin(time * 0.3) : 1, walk: p.onGround ? p.anim : 0, bob: p.onGround ? Math.sin(p.anim) * 2 : 0 });
  }
  drawRooms();
  for (const q of particles) {
    if (q.ball) drawPokeball(q.x + 12, q.y + 12, 10);
    else { ctx.fillStyle = q.color; ctx.globalAlpha = Math.max(0, q.life / 40); ctx.fillRect(q.x - 3, q.y - 3, 6, 6); ctx.globalAlpha = 1; }
  }
  ctx.restore();
  drawHUD();
}
function drawClouds() {
  ctx.fillStyle = "rgba(255,255,255,.9)";
  for (let i = 0; i < 12; i++) {
    const x = ((i * 290 - camDraw * 0.3) % (W + 300) + W + 300) % (W + 300) - 150, y = 50 + (i % 3) * 45;
    ctx.beginPath(); ctx.arc(x, y, 18, 0, 7); ctx.arc(x + 20, y - 10, 22, 0, 7); ctx.arc(x + 45, y, 18, 0, 7); ctx.fill();
  }
}
function drawMuseum() {
  // Stockwerke mit Epochenräumen: Wandfarbe, Sockelleiste, Raumname, Deckenlampen
  const floors = THEME.floors || [{ r0: 2, r1: 9, epochs: THEME.epochs || [] }];
  for (const fl of floors) {
    const top = fl.r0 * TILE - camDrawY, bottom = (fl.r1 + 1) * TILE - camDrawY; if (bottom < 0 || top > H) continue;
    let x0 = 0;
    for (const ep of fl.epochs) {
      const x1 = Math.min(ep.until, LEVEL_W), sx0 = x0 - camDraw, sx1 = x1 - camDraw;
      if (sx1 > 0 && sx0 < W) {
        ctx.fillStyle = ep.wall; ctx.fillRect(sx0, top, sx1 - sx0, bottom - top);
        ctx.fillStyle = "rgba(0,0,0,.15)"; ctx.fillRect(sx0, bottom - 44, sx1 - sx0, 44); ctx.fillStyle = "rgba(255,255,255,.25)"; ctx.fillRect(sx0, bottom - 48, sx1 - sx0, 4);
        const dark = ["#b8c7d6", "#ececec"].includes(ep.wall);
        ctx.fillStyle = dark ? "rgba(0,0,0,.18)" : "rgba(255,255,255,.18)"; ctx.font = "bold 30px Georgia, serif"; ctx.textAlign = "center"; ctx.fillText(ep.name, (sx0 + sx1) / 2, top + 50);
        ctx.font = "bold 12px monospace"; ctx.fillText(ep.name === "Kabinett" ? "nur durch ein Gemälde erreichbar" : "Werke von Künstlerinnen", (sx0 + sx1) / 2, top + 70);
      }
      x0 = x1; if (x0 >= LEVEL_W) break;
    }
    for (let i = 0; i < 24; i++) { const lx = i * 360 - (camDraw % 360); ctx.fillStyle = "rgba(255,250,220,.08)"; ctx.beginPath(); ctx.moveTo(lx - 10, top + 2); ctx.lineTo(lx + 10, top + 2); ctx.lineTo(lx + 90, bottom); ctx.lineTo(lx - 90, bottom); ctx.fill(); ctx.fillStyle = "#333"; ctx.fillRect(lx - 12, top - 2, 24, 8); ctx.fillStyle = "#fff6c8"; ctx.fillRect(lx - 8, top + 6, 16, 3); }
  }
}
function drawPainting(x, y, t) {
  const a = ART[THEME.art && THEME.art[(x / TILE) + "," + (y / TILE)]];
  if (a && !a.img && typeof Image !== "undefined") { a.img = new Image(); a.img.src = a.data; }
  const fw = 148, fh = 112, fx = x + 20 - fw / 2, fy = y - fh - 14, portal = t !== "&";
  if (portal) { ctx.fillStyle = `rgba(255,230,120,${0.18 + 0.1 * Math.sin(time * 0.08)})`; ctx.beginPath(); ctx.ellipse(x + 20, y + 36, 34, 8, 0, 0, 7); ctx.fill(); ctx.fillStyle = "#ffde00"; ctx.font = "bold 13px monospace"; ctx.textAlign = "center"; ctx.fillText("↓", x + 20, y + 26 + Math.sin(time * 0.1) * 2); }
  ctx.fillStyle = "rgba(0,0,0,.25)"; ctx.fillRect(fx + 5, fy + 6, fw, fh);
  ctx.fillStyle = portal ? "#d4a017" : "#8a6a2a"; ctx.fillRect(fx, fy, fw, fh); ctx.fillStyle = portal ? "#f3cf5a" : "#b89a52"; ctx.fillRect(fx + 3, fy + 3, fw - 6, fh - 6); ctx.fillStyle = "#f6f0e2"; ctx.fillRect(fx + 8, fy + 8, fw - 16, fh - 16);
  const iw = fw - 20, ih = fh - 20, ix = fx + 10, iy = fy + 10;
  if (a && a.img && a.img.complete && a.img.naturalWidth) {
    const s = Math.min(iw / a.img.naturalWidth, ih / a.img.naturalHeight), dw = a.img.naturalWidth * s, dh = a.img.naturalHeight * s;
    ctx.drawImage(a.img, ix + (iw - dw) / 2, iy + (ih - dh) / 2, dw, dh);
  } else { ctx.fillStyle = "#ddd"; ctx.fillRect(ix, iy, iw, ih); ctx.fillStyle = "#555"; ctx.font = "9px monospace"; ctx.textAlign = "center"; ctx.fillText(a ? a.artist : "Kunstwerk", x + 20, iy + ih / 2); }
  if (portal) { ctx.strokeStyle = `rgba(255,235,150,${0.5 + 0.4 * Math.sin(time * 0.08)})`; ctx.lineWidth = 3; ctx.strokeRect(fx - 2, fy - 2, fw + 4, fh + 4); ctx.lineWidth = 1; }
  ctx.fillStyle = "#f8f4ea"; ctx.fillRect(x + 20 - 56, y - 10, 112, 10); ctx.strokeStyle = "#8a6a2a"; ctx.strokeRect(x + 20 - 55.5, y - 9.5, 111, 9);
  ctx.fillStyle = "#222"; ctx.font = "8px monospace"; ctx.textAlign = "center"; ctx.fillText(a ? a.artist.slice(0, 26) : "", x + 20, y - 2.5);
}
function drawCastle() {
  ctx.fillStyle = "#fff"; for (let i = 0; i < 50; i++) { const sx = (i * 173 + 31) % W, sy = ((i * 97) % 260 - camDrawY * 0.1 + 400) % 400; ctx.globalAlpha = 0.35 + 0.65 * Math.abs(Math.sin(time * 0.04 + i)); ctx.fillRect(sx, sy, 2, 2); } ctx.globalAlpha = 1;
  const mx = 650 - camDraw * 0.05, my = 90 - camDrawY * 0.1;
  ctx.fillStyle = "#f3e9a8"; ctx.beginPath(); ctx.arc(mx, my, 44, 0, 7); ctx.fill(); ctx.fillStyle = "#e0d48c"; ctx.beginPath(); ctx.arc(mx - 14, my - 8, 7, 0, 7); ctx.arc(mx + 12, my + 10, 5, 0, 7); ctx.arc(mx + 6, my - 20, 4, 0, 7); ctx.fill();
  for (let i = 0; i < 8; i++) {
    const x = ((i * 330 - camDraw * 0.3) % (W + 400) + W + 400) % (W + 400) - 200, base = H + 40 - camDrawY * 0.3, h = 160 + (i * 61) % 120;
    ctx.fillStyle = "#1c1030"; ctx.fillRect(x, base - h, 70, h); ctx.fillRect(x + 90, base - h + 50, 50, h - 50);
    for (let k = 0; k < 4; k++) ctx.fillRect(x + k * 20, base - h - 14, 10, 14);
    ctx.fillStyle = "rgba(255,200,80,.5)"; ctx.fillRect(x + 28, base - h + 40, 12, 18); ctx.fillRect(x + 104, base - h + 90, 10, 14);
  }
  ctx.fillStyle = "#0b0616"; for (let i = 0; i < 6; i++) { const bx = ((i * 260 + time * (0.8 + i * 0.15)) % (W + 100)) - 50, by = 60 + (i * 53) % 200 + Math.sin(time * 0.1 + i) * 12, fl = Math.sin(time * 0.3 + i) * 6; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx - 14, by - 6 + fl); ctx.lineTo(bx - 8, by + 2); ctx.lineTo(bx, by + 4); ctx.lineTo(bx + 8, by + 2); ctx.lineTo(bx + 14, by - 6 + fl); ctx.fill(); }
}
function drawPumpkin(k) {
  const x = k.x + k.w / 2, y = k.y + k.h, bob = Math.sin(time * 0.08 + k.seed) * 1.5;
  if (k.fleeing) ctx.globalAlpha = Math.max(0.2, k.life / 80);
  ctx.fillStyle = "#2e7d32"; ctx.fillRect(x - 3, y - 36 + bob, 6, 8);
  ctx.fillStyle = "#ff8c1a"; ctx.beginPath(); ctx.ellipse(x, y - 15 + bob, 18, 15, 0, 0, 7); ctx.fill();
  ctx.fillStyle = "#e07010"; ctx.beginPath(); ctx.ellipse(x - 9, y - 15 + bob, 5, 14, 0, 0, 7); ctx.ellipse(x + 9, y - 15 + bob, 5, 14, 0, 0, 7); ctx.fill();
  ctx.fillStyle = "#ffd166"; ctx.beginPath(); ctx.moveTo(x - 10, y - 16 + bob); ctx.lineTo(x - 4, y - 16 + bob); ctx.lineTo(x - 7, y - 22 + bob); ctx.fill(); ctx.beginPath(); ctx.moveTo(x + 4, y - 16 + bob); ctx.lineTo(x + 10, y - 16 + bob); ctx.lineTo(x + 7, y - 22 + bob); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x - 9, y - 10 + bob); for (let i = 0; i < 5; i++) ctx.lineTo(x - 9 + i * 4.5, y - (i % 2 ? 10 : 6) + bob); ctx.lineTo(x + 9, y - 10 + bob); ctx.lineTo(x, y - 4 + bob); ctx.fill();
  ctx.globalAlpha = 1;
}
function drawStar(x, y, r, glow) {
  if (glow) { ctx.fillStyle = `rgba(255,220,80,${0.25 + 0.15 * Math.sin(time * 0.12)})`; ctx.beginPath(); ctx.arc(x, y, r * 1.8, 0, 7); ctx.fill(); }
  ctx.fillStyle = "#ffd700"; ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } ctx.closePath(); ctx.fill();
  ctx.strokeStyle = "#b8860b"; ctx.lineWidth = 1; ctx.stroke(); ctx.fillStyle = "#fff8c0"; ctx.beginPath(); ctx.arc(x - r * 0.25, y - r * 0.3, r * 0.18, 0, 7); ctx.fill();
}
function drawCucumber(x, y, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.fillStyle = "#4caf50"; ctx.beginPath(); ctx.ellipse(0, 0, 11, 5, 0, 0, 7); ctx.fill();
  ctx.fillStyle = "#2e7d32"; ctx.beginPath(); ctx.ellipse(-6, -1, 2, 1.2, 0, 0, 7); ctx.ellipse(1, 1.5, 2, 1.2, 0, 0, 7); ctx.ellipse(6, -1.5, 2, 1.2, 0, 0, 7); ctx.fill(); ctx.restore();
}
function zoneAt(x) { const zs = THEME.zones || []; for (const z of zs) if (x < z.until) return z.kind; return "grass"; }
function drawMixed() {
  const kind = zoneAt(camDraw + W / 2);
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  if (kind === "water") { sky.addColorStop(0, "#3a86e0"); sky.addColorStop(1, "#9fd4ff"); } else if (kind === "sky") { sky.addColorStop(0, "#1e4fb8"); sky.addColorStop(1, "#a8d8ff"); } else { sky.addColorStop(0, "#5c94fc"); sky.addColorStop(1, "#a8d8ff"); }
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
  // Wolken nur oberhalb der Wasseroberfläche, solange der See im Bild ist
  const lakeOnScreen = THEME.water && camDraw < (THEME.water.c1 + 1) * TILE && camDraw + W > THEME.water.c0 * TILE;
  ctx.save(); if (lakeOnScreen) { ctx.beginPath(); ctx.rect(0, 0, W, Math.max(0, THEME.water.r0 * TILE - camDrawY)); ctx.clip(); }
  ctx.fillStyle = "rgba(255,255,255,.9)";
  for (let i = 0; i < 14; i++) { const x = ((i * 290 - camDraw * 0.3) % (W + 300) + W + 300) % (W + 300) - 150, y = ((i * 137 - camDrawY * 0.4) % (H + 100) + H + 100) % (H + 100) - 50; ctx.beginPath(); ctx.arc(x, y, 18, 0, 7); ctx.arc(x + 20, y - 10, 22, 0, 7); ctx.arc(x + 45, y, 18, 0, 7); ctx.fill(); }
  if (kind === "sky") { ctx.fillStyle = "#7f8fb0"; for (let i = 0; i < 6; i++) { const x = ((i * 420 - camDraw * 0.5) % (W + 500) + W + 500) % (W + 500) - 250, base = LEVEL_H - 80 - camDrawY * 0.85; ctx.beginPath(); ctx.moveTo(x - 220, base); ctx.lineTo(x, base - 520); ctx.lineTo(x + 220, base); ctx.fill(); ctx.fillStyle = "#e8f0ff"; ctx.beginPath(); ctx.moveTo(x - 50, base - 400); ctx.lineTo(x, base - 520); ctx.lineTo(x + 50, base - 400); ctx.fill(); ctx.fillStyle = "#7f8fb0"; } }
  else { ctx.fillStyle = "#3cb043"; for (let i = 0; i < 10; i++) { const x = ((i * 420 - camDraw * 0.5) % (W + 500) + W + 500) % (W + 500) - 250; ctx.beginPath(); ctx.arc(x, LEVEL_H - 80 - camDrawY, 130, Math.PI, 0); ctx.fill(); } }
  ctx.restore();
}
function drawMover(m) {
  ctx.fillStyle = "#6a6a78"; ctx.fillRect(m.x, m.y, m.w, m.h); ctx.fillStyle = "#9a9aa8"; ctx.fillRect(m.x, m.y, m.w, 5); ctx.fillStyle = "#44444f"; ctx.fillRect(m.x + 2, m.y + m.h - 4, m.w - 4, 3);
  ctx.fillStyle = "#ffde00"; const up = m.vy < 0; ctx.beginPath(); ctx.moveTo(m.x + m.w / 2, up ? m.y + 3 : m.y + m.h - 3); ctx.lineTo(m.x + m.w / 2 - 6, up ? m.y + 11 : m.y + m.h - 11); ctx.lineTo(m.x + m.w / 2 + 6, up ? m.y + 11 : m.y + m.h - 11); ctx.fill();
}
function drawBalloon(x, y) {
  const bob = Math.sin(time * 0.05) * 3;
  ctx.strokeStyle = "#5a3a1c"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x + 4, y + 36); ctx.lineTo(x + 8, y - 8 + bob); ctx.moveTo(x + 30, y + 36); ctx.lineTo(x + 26, y - 8 + bob); ctx.stroke();
  ctx.fillStyle = "#e3350d"; ctx.beginPath(); ctx.ellipse(x + 17, y - 30 + bob, 30, 34, 0, 0, 7); ctx.fill();
  ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.ellipse(x + 17, y - 30 + bob, 10, 34, 0, 0, 7); ctx.fill();
  ctx.fillStyle = "#ffde00"; ctx.beginPath(); ctx.ellipse(x + 17, y - 30 + bob, 30, 8, 0, 0, 7); ctx.fill();
  ctx.fillStyle = "#8a5a2b"; ctx.fillRect(x, y + 36, 34, 14); ctx.fillStyle = "#a0703a"; ctx.fillRect(x + 2, y + 38, 30, 4);
}
function drawCity() {
  ctx.fillStyle = "#fff"; for (let i = 0; i < 40; i++) { const sx = (i * 173) % W, sy = (i * 97) % 200; ctx.globalAlpha = 0.4 + 0.6 * Math.abs(Math.sin(time * 0.03 + i)); ctx.fillRect(sx, sy, 2, 2); } ctx.globalAlpha = 1;
  for (let i = 0; i < 14; i++) {
    const x = ((i * 190 - camDraw * 0.2) % (W + 300) + W + 300) % (W + 300) - 150, h = 120 + (i * 53) % 160, w = 70 + (i * 29) % 60;
    ctx.fillStyle = "#23264f"; ctx.fillRect(x, 400 - h, w, h);
    ctx.fillStyle = "rgba(255,230,150,.55)"; for (let wy = 400 - h + 12; wy < 390; wy += 22) for (let wx = x + 8; wx < x + w - 10; wx += 18) if ((wx * 7 + wy * 13 + i) % 5 < 3) ctx.fillRect(wx, wy, 7, 9);
  }
  for (let i = 0; i < 10; i++) {
    const x = ((i * 260 - camDraw * 0.45) % (W + 400) + W + 400) % (W + 400) - 200, h = 80 + (i * 71) % 120, w = 90 + (i * 37) % 70;
    ctx.fillStyle = "#15173a"; ctx.fillRect(x, 400 - h, w, h);
    ctx.fillStyle = "rgba(255,220,120,.35)"; for (let wy = 400 - h + 10; wy < 390; wy += 24) for (let wx = x + 10; wx < x + w - 12; wx += 20) if ((wx * 3 + wy * 11 + i) % 4 < 2) ctx.fillRect(wx, wy, 8, 10);
  }
}
function drawLamp(x, y) {
  ctx.fillStyle = "rgba(255,220,140,.14)"; ctx.beginPath(); ctx.arc(x + 20, y - 22, 70, 0, 7); ctx.fill();
  ctx.fillStyle = "#2a2a30"; ctx.fillRect(x + 18, y - 30, 5, 70); ctx.fillRect(x + 10, y - 36, 21, 8);
  ctx.fillStyle = "#ffe9a0"; ctx.fillRect(x + 13, y - 32, 15, 6);
}
function drawDoor(x, y) {
  ctx.fillStyle = "#3b2a1a"; ctx.fillRect(x + 6, y + 2, 28, 38); ctx.fillStyle = "#6b4a2a"; ctx.fillRect(x + 9, y + 5, 22, 35);
  ctx.fillStyle = "#ffe9a0"; ctx.fillRect(x + 14, y + 10, 12, 9); ctx.fillStyle = "#f8d030"; ctx.fillRect(x + 25, y + 24, 3, 3);
  ctx.fillStyle = "#fff"; ctx.font = "bold 11px monospace"; ctx.textAlign = "center"; ctx.fillText("↓", x + 20, y - 4 + Math.sin(time * 0.1) * 2);
}
function drawJungle() {
  for (let i = 0; i < 9; i++) {
    const x = ((i * 430 - camDraw * 0.5) % (W + 500) + W + 500) % (W + 500) - 250;
    ctx.fillStyle = "#2f4f2a"; ctx.beginPath(); ctx.arc(x + 20, 40, 120, 0, 7); ctx.arc(x + 150, 20, 110, 0, 7); ctx.fill();
    ctx.fillStyle = "#3b2a16"; ctx.fillRect(x, 60, 34, 360); ctx.fillStyle = "#4e3a20"; ctx.fillRect(x + 6, 60, 8, 360);
    ctx.fillStyle = "#2f6e3a"; ctx.beginPath(); ctx.arc(x + 230, 395, 48, Math.PI, 0); ctx.fill();
  }
  ctx.fillStyle = "rgba(255,255,200,.06)"; for (let i = 0; i < 4; i++) { const x = ((i * 310 - camDraw * 0.3) % (W + 300) + W + 300) % (W + 300) - 150; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 120, 0); ctx.lineTo(x + 60, H); ctx.lineTo(x - 40, H); ctx.fill(); }
}
function drawVine(x, y) {
  ctx.strokeStyle = "#2e8b3a"; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x + 20, y);
  for (let k = 1; k <= 6; k++) ctx.lineTo(x + 20 + Math.sin(time * 0.02 + k) * 6, y + k * 20); ctx.stroke(); ctx.lineWidth = 1;
  ctx.fillStyle = "#3cb043"; for (let k = 1; k <= 5; k += 2) { ctx.beginPath(); ctx.ellipse(x + 30 + Math.sin(time * 0.02 + k) * 6, y + k * 20, 9, 4, 0.6, 0, 7); ctx.fill(); }
}
function drawHut(h, resting) {
  const x = h.x, y = h.y;
  ctx.fillStyle = "#3cb043"; ctx.beginPath(); ctx.moveTo(x - 38, y - 2); ctx.lineTo(x, y - 62); ctx.lineTo(x + 38, y - 2); ctx.fill();
  ctx.strokeStyle = "#8a5a2b"; ctx.lineWidth = 5; ctx.beginPath();
  ctx.moveTo(x - 34, y); ctx.lineTo(x, y - 58); ctx.lineTo(x + 34, y); ctx.moveTo(x - 24, y - 16); ctx.lineTo(x + 24, y - 16); ctx.moveTo(x - 14, y - 34); ctx.lineTo(x + 14, y - 34); ctx.stroke(); ctx.lineWidth = 1;
  ctx.fillStyle = "#2a1a0a"; ctx.beginPath(); ctx.moveTo(x - 12, y); ctx.lineTo(x, y - 24); ctx.lineTo(x + 12, y); ctx.fill();
  if (resting) { ctx.fillStyle = "#fff"; ctx.font = "bold 16px monospace"; ctx.textAlign = "left"; for (let k = 0; k < 3; k++) { const t = (time * 0.6 + k * 20) % 60; ctx.globalAlpha = 1 - t / 60; ctx.fillText("z", x + 10 + k * 8 + t * 0.2, y - 60 - t); } ctx.globalAlpha = 1; }
}
function drawKey(x, y) {
  ctx.fillStyle = "rgba(255,230,120,.3)"; ctx.beginPath(); ctx.arc(x, y, 18 + Math.sin(time * 0.15) * 3, 0, 7); ctx.fill();
  ctx.strokeStyle = "#c9a227"; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x - 6, y, 6, 0, 7); ctx.stroke();
  ctx.fillStyle = "#f8d030"; ctx.fillRect(x - 1, y - 2, 16, 4); ctx.fillRect(x + 8, y + 2, 3, 5); ctx.fillRect(x + 13, y + 2, 3, 4);
  ctx.fillStyle = "#fff"; ctx.fillRect(x - 9, y - 4, 2, 2); ctx.lineWidth = 1;
}
function drawRooms() {
  if (!THEME.rooms) return;
  THEME.rooms.forEach((rm, i) => {
    const seen = progress.roomsSeen.includes(i); let a = seen ? 0 : 1;
    if (seen && roomFade[i] > 0) a = roomFade[i] / 40;
    if (a <= 0) return;
    ctx.fillStyle = `rgba(8,12,24,${a})`; ctx.fillRect(rm.c0 * TILE, rm.r0 * TILE, (rm.c1 - rm.c0 + 1) * TILE, (rm.r1 - rm.r0 + 1) * TILE);
    if (!seen) { ctx.fillStyle = `rgba(255,255,255,${0.25 + 0.15 * Math.sin(time * 0.1)})`; ctx.font = "bold 18px monospace"; ctx.textAlign = "center"; ctx.fillText("?", (rm.c0 + rm.c1 + 1) * TILE / 2, (rm.r0 + rm.r1 + 1) * TILE / 2 + 6); }
  });
}
function drawStick(x, y) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(-0.6); ctx.fillStyle = "#8a5a2b"; ctx.fillRect(-11, -2.5, 22, 5); ctx.fillStyle = "#a0703a"; ctx.fillRect(-11, -2.5, 22, 2);
  ctx.fillStyle = "#3cb043"; ctx.beginPath(); ctx.ellipse(7, -5, 6, 3, -0.5, 0, 7); ctx.fill(); ctx.restore();
}
function drawTemple() {
  for (let i = 0; i < 8; i++) {
    const x = ((i * 520 - camDraw * 0.6) % (W + 600) + W + 600) % (W + 600) - 300;
    ctx.fillStyle = "#3e2812"; ctx.fillRect(x, 60, 46, 340);
    ctx.fillStyle = "#5c3f1e"; ctx.fillRect(x + 8, 60, 10, 340); ctx.fillRect(x - 10, 48, 66, 16); ctx.fillRect(x - 10, 390, 66, 16);
  }
  const lava = ctx.createLinearGradient(0, H - 70, 0, H); lava.addColorStop(0, "rgba(255,110,0,0)"); lava.addColorStop(0.5, "#ff6a00"); lava.addColorStop(1, "#ffd040");
  ctx.fillStyle = lava; ctx.fillRect(0, H - 70, W, 70);
  ctx.fillStyle = "rgba(255,235,140,.8)";
  for (let i = 0; i < 12; i++) { const bx = (i * 83 + time * 0.8) % W, by = H - 18 + Math.sin(time * 0.1 + i) * 7; ctx.beginPath(); ctx.arc(bx, by, 3.5, 0, 7); ctx.fill(); }
}
function drawTorch(x, y) {
  const fl = Math.sin(time * 0.3 + x) * 2;
  ctx.fillStyle = "rgba(255,160,40,.13)"; ctx.beginPath(); ctx.arc(x + 20, y + 14, 70 + fl * 3, 0, 7); ctx.fill();
  ctx.fillStyle = "#5a3a1c"; ctx.fillRect(x + 17, y + 18, 6, 18); ctx.fillStyle = "#8a6a3c"; ctx.fillRect(x + 14, y + 16, 12, 5);
  ctx.fillStyle = "#ff8c00"; ctx.beginPath(); ctx.ellipse(x + 20, y + 9 + fl, 7, 11, 0, 0, 7); ctx.fill();
  ctx.fillStyle = "#ffe066"; ctx.beginPath(); ctx.ellipse(x + 20, y + 12 + fl, 3.5, 6, 0, 0, 7); ctx.fill();
}
function drawCloudLayer() {
  ctx.fillStyle = "rgba(255,255,255,.55)";
  for (let i = 0; i < 9; i++) { const x = ((i * 470 - camDraw * 0.5) % (W + 500) + W + 500) % (W + 500) - 250, y = 330 + (i % 3) * 30; ctx.beginPath(); ctx.arc(x, y, 60, 0, 7); ctx.arc(x + 70, y - 25, 75, 0, 7); ctx.arc(x + 150, y, 60, 0, 7); ctx.arc(x + 80, y + 20, 90, 0, 7); ctx.fill(); }
}
function drawHills() {
  ctx.fillStyle = "#3cb043";
  for (let i = 0; i < 10; i++) { const x = ((i * 420 - camDraw * 0.5) % (W + 500) + W + 500) % (W + 500) - 250; ctx.beginPath(); ctx.arc(x, ROWS * TILE - 80, 130, Math.PI, 0); ctx.fill(); }
}
function drawTile(t, x, y, row) {
  const top = t === "#" && (row === 0 || LEVEL[row - 1][x / TILE] !== "#");
  if (t === "t") { drawTorch(x, y); return; }
  if (t === "l") { drawLamp(x, y); return; }
  if (THEME.museum) {
    if ((t >= "1" && t <= "9") || t === "&") { drawPainting(x, y, t); return; }
    if (t === "#") { ctx.fillStyle = ((x / TILE + row) % 2) ? "#e9e4da" : "#d9d2c4"; ctx.fillRect(x, y, TILE, TILE); ctx.strokeStyle = "rgba(120,100,80,.35)"; ctx.beginPath(); ctx.moveTo(x + 4, y + 30); ctx.quadraticCurveTo(x + 18, y + 10, x + 36, y + 22); ctx.stroke(); ctx.strokeStyle = "rgba(0,0,0,.2)"; ctx.strokeRect(x + .5, y + .5, TILE - 1, TILE - 1); return; }
    if (t === "=") { ctx.fillStyle = "#cfc6b4"; ctx.fillRect(x, y, TILE, TILE); ctx.fillStyle = "#e4dccb"; ctx.fillRect(x + 3, y + 3, TILE - 6, TILE - 6); ctx.fillStyle = "#b5aa95"; ctx.fillRect(x, y + 18, TILE, 3); ctx.strokeStyle = "rgba(0,0,0,.25)"; ctx.strokeRect(x + .5, y + .5, TILE - 1, TILE - 1); return; }
    if (t === "~") { ctx.fillStyle = "#6b4a2a"; ctx.fillRect(x + 2, y + 14, TILE - 4, 8); ctx.fillRect(x + 6, y + 22, 5, 18); ctx.fillRect(x + 29, y + 22, 5, 18); ctx.fillStyle = "#8a2a2a"; ctx.fillRect(x + 2, y + 10, TILE - 4, 6); return; }
  }
  if ((t === "#" || t === "=") && THEME.ground === "castle") {
    ctx.fillStyle = t === "=" ? "#3e8e41" : "#2f6b33"; ctx.fillRect(x, y, TILE, TILE);
    ctx.fillStyle = t === "=" ? "#5fb85f" : "#4a9a4e"; const col = x / TILE; for (let i = 0; i < 5; i++) { const px = (col * 7 + row * 13 + i * 11) % 32 + 4, py = (col * 5 + row * 17 + i * 7) % 32 + 4; ctx.fillRect(x + px, y + py, 3, 3); }
    ctx.fillStyle = "rgba(0,0,0,.35)"; ctx.fillRect(x, y + 19, TILE, 2); ctx.fillRect(x + (row % 2 ? 22 : 8), y, 2, 19); ctx.fillRect(x + (row % 2 ? 8 : 26), y + 21, 2, 19);
    if (top || (row > 0 && LEVEL[row - 1][col] === " ")) { ctx.fillStyle = "#7fd17f"; ctx.fillRect(x, y, TILE, 4); }
    ctx.strokeStyle = "rgba(0,0,0,.4)"; ctx.strokeRect(x + .5, y + .5, TILE - 1, TILE - 1); return;
  }
  if (isWater(x / TILE, row)) {
    const surface = !isWater(x / TILE, row - 1) && !isSolid(x / TILE, row - 1), depth = Math.min(10, row - (THEME.water ? THEME.water.r0 : 29));
    ctx.fillStyle = `rgba(30,110,210,${0.45 + depth * 0.03})`; ctx.fillRect(x, y, TILE, TILE);
    if (surface) { ctx.fillStyle = "rgba(220,245,255,.8)"; for (let i = 0; i < 4; i++) ctx.fillRect(x + i * 10 + ((time / 8 + i) % 10 > 5 ? 2 : 0), y + 2 + Math.sin(time * 0.1 + x / 20 + i) * 2, 6, 3); }
    if (t === "W" || t === " ") return;
  }
  if (t === "o") { ctx.fillStyle = "rgba(230,250,255,.85)"; for (let i = 0; i < 3; i++) { const ph = (time * 0.6 + i * 20 + x) % 60; ctx.beginPath(); ctx.arc(x + 20 + Math.sin(ph / 6) * 6, y + 36 - ph, 3 + i, 0, 7); ctx.fill(); } return; }
  if (t === "G") { ctx.fillStyle = "#6a4a1a"; ctx.fillRect(x, y, TILE, TILE); ctx.fillStyle = "#c9a227"; ctx.fillRect(x + 4, y + 4, TILE - 8, TILE - 8); ctx.fillStyle = "#6a4a1a"; ctx.fillRect(x + 14, y + 12, 12, 16); ctx.fillStyle = "#222"; ctx.beginPath(); ctx.arc(x + 20, y + 18, 4, 0, 7); ctx.fill(); ctx.fillRect(x + 18, y + 18, 4, 8); return; }
  if (t === "Z") { ctx.fillStyle = "#ddd"; ctx.fillRect(x + 18, y - 60, 4, 100); ctx.fillStyle = "#b040e0"; ctx.beginPath(); ctx.moveTo(x + 20, y - 56); ctx.lineTo(x + 56, y - 40); ctx.lineTo(x + 20, y - 24); ctx.fill(); ctx.fillStyle = "#ffde00"; ctx.font = "bold 14px monospace"; ctx.textAlign = "center"; ctx.fillText("★", x + 36, y - 36); return; }
  if (t === "!") { ctx.fillStyle = "#8a5a2b"; ctx.fillRect(x + 17, y + 14, 6, 26); ctx.fillStyle = "#d2a060"; ctx.fillRect(x + 4, y + 4, 32, 18); ctx.fillStyle = "#222"; ctx.font = "bold 14px monospace"; ctx.textAlign = "center"; ctx.fillText("?", x + 20, y + 18); return; }
  if (t >= "1" && t <= "9" && THEME.pipes) {
    ctx.fillStyle = "#2e9e4a"; ctx.fillRect(x + 4, y + 12, TILE - 8, TILE - 12); ctx.fillStyle = "#1f7a36"; ctx.fillRect(x + 4, y + 12, 6, TILE - 12); ctx.fillStyle = "#5fd47a"; ctx.fillRect(x + 12, y + 12, 5, TILE - 12);
    ctx.fillStyle = "#2e9e4a"; ctx.fillRect(x - 2, y, TILE + 4, 14); ctx.fillStyle = "#1f7a36"; ctx.fillRect(x - 2, y, 6, 14); ctx.fillStyle = "#5fd47a"; ctx.fillRect(x + 6, y, 5, 14);
    ctx.strokeStyle = "#145a28"; ctx.strokeRect(x - 1.5, y + .5, TILE + 3, 13); ctx.strokeRect(x + 4.5, y + 12.5, TILE - 9, TILE - 13);
    ctx.fillStyle = "#fff"; ctx.font = "bold 11px monospace"; ctx.textAlign = "center"; ctx.fillText("↓", x + 20, y - 4 + Math.sin(time * 0.1) * 2); return;
  }
  if (t === "#" && THEME.ground === "mixed" && zoneAt(x) === "water") {
    ctx.fillStyle = "#d8c088"; ctx.fillRect(x, y, TILE, TILE); ctx.fillStyle = "#c0a870"; ctx.fillRect(x + 6, y + 10, 6, 4); ctx.fillRect(x + 24, y + 26, 6, 4); ctx.fillRect(x + 14, y + 30, 4, 3);
    if (top) { ctx.fillStyle = "#e8d8a0"; ctx.fillRect(x, y, TILE, 8); }
    ctx.strokeStyle = "rgba(0,0,0,.2)"; ctx.strokeRect(x + .5, y + .5, TILE - 1, TILE - 1); return;
  }
  if (t >= "1" && t <= "9") { drawDoor(x, y); return; }
  if (t === "h") return; // unsichtbar, bis angesprungen
  if ((t === "=" || t === "f") && THEME.ground === "city") {
    const near = t === "f" && Math.abs(x + 20 - (player.x + 15)) < 90 && Math.abs(y + 20 - (player.y + 18)) < 90;
    if (near) ctx.globalAlpha = 0.35;
    ctx.fillStyle = "#8a4a3a"; ctx.fillRect(x, y, TILE, TILE);
    ctx.fillStyle = "#6e3a2c"; ctx.fillRect(x, y + 19, TILE, 2); ctx.fillRect(x + (row % 2 ? 22 : 8), y, 2, 19); ctx.fillRect(x + (row % 2 ? 8 : 26), y + 21, 2, 19);
    const above = row === 0 || LEVEL[row - 1][x / TILE] === " " || LEVEL[row - 1][x / TILE] === "p";
    if (above) { ctx.fillStyle = "#b0b0b8"; ctx.fillRect(x, y, TILE, 5); }
    else if (((x / TILE) * 5 + row * 3) % 4 === 0) { ctx.fillStyle = "#ffe9a0"; ctx.fillRect(x + 12, y + 10, 16, 16); ctx.fillStyle = "#6e3a2c"; ctx.fillRect(x + 19, y + 10, 2, 16); ctx.fillRect(x + 12, y + 17, 16, 2); }
    ctx.strokeStyle = "rgba(0,0,0,.3)"; ctx.strokeRect(x + .5, y + .5, TILE - 1, TILE - 1);
    ctx.globalAlpha = 1; return;
  }
  if (t === "#" && THEME.ground === "city") {
    ctx.fillStyle = "#3a3a44"; ctx.fillRect(x, y, TILE, TILE);
    if (top) { ctx.fillStyle = "#9a9aa6"; ctx.fillRect(x, y, TILE, 14); ctx.fillStyle = "#7a7a86"; ctx.fillRect(x, y + 12, TILE, 3); ctx.fillStyle = "#b8b8c4"; ctx.fillRect(x + 1, y, 18, 12); }
    else if (row === ROWS - 1) { ctx.fillStyle = "#f0c030"; ctx.fillRect(x + 4, y + 18, 20, 4); }
    ctx.strokeStyle = "rgba(0,0,0,.25)"; ctx.strokeRect(x + .5, y + .5, TILE - 1, TILE - 1);
    return;
  }
  if (t === "v") { drawVine(x, y); return; }
  if (t === "~") {
    ctx.fillStyle = "#8b5a2b"; ctx.fillRect(x, y + 4, TILE, TILE - 8); ctx.fillStyle = "#a0703a"; ctx.fillRect(x, y + 8, TILE, 6); ctx.fillStyle = "#6a4420"; ctx.fillRect(x, y + 26, TILE, 4);
    ctx.strokeStyle = "#4a2e12"; ctx.strokeRect(x + .5, y + 4.5, TILE - 1, TILE - 9); return;
  }
  if (t === "#" && THEME.ground === "jungle") {
    ctx.fillStyle = "#5a3b1e"; ctx.fillRect(x, y, TILE, TILE);
    ctx.fillStyle = "#4a2f16"; ctx.fillRect(x + 6, y + 14, 10, 6); ctx.fillRect(x + 24, y + 28, 10, 6);
    if (top) { ctx.fillStyle = "#3f9b3f"; ctx.fillRect(x, y, TILE, 12); ctx.fillStyle = "#2e7d32"; for (let i = 0; i < 5; i++) ctx.fillRect(x + i * 8 + 2, y - 4, 3, 9); }
    ctx.strokeStyle = "rgba(0,0,0,.3)"; ctx.strokeRect(x + .5, y + .5, TILE - 1, TILE - 1);
    return;
  }
  if (t === "#" && THEME.ground === "stone") {
    ctx.fillStyle = ((x / TILE + row) % 2) ? "#a8804a" : "#b48c54"; ctx.fillRect(x, y, TILE, TILE);
    ctx.fillStyle = "#6e4e2a"; ctx.fillRect(x, y + 19, TILE, 2); ctx.fillRect(x + (row % 2 ? 22 : 8), y, 2, 19); ctx.fillRect(x + (row % 2 ? 8 : 26), y + 21, 2, 19);
    ctx.strokeStyle = "rgba(0,0,0,.35)"; ctx.strokeRect(x + .5, y + .5, TILE - 1, TILE - 1);
  } else if (t === "#" && THEME.ground === "cloud") {
    ctx.fillStyle = "#eef4ff"; ctx.fillRect(x, y, TILE, TILE); ctx.fillStyle = "#cfdcf5"; ctx.fillRect(x, y + TILE - 7, TILE, 7);
    if (top) { ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(x + 9, y + 6, 11, 0, 7); ctx.arc(x + 25, y + 3, 13, 0, 7); ctx.arc(x + 38, y + 7, 9, 0, 7); ctx.fill(); }
    ctx.strokeStyle = "rgba(120,150,200,.3)"; ctx.strokeRect(x + .5, y + .5, TILE - 1, TILE - 1);
  } else if (t === "#") {
    ctx.fillStyle = top ? "#3cb043" : "#8b5a2b"; ctx.fillRect(x, y, TILE, TILE);
    if (top) { ctx.fillStyle = "#8b5a2b"; ctx.fillRect(x, y + 12, TILE, TILE - 12); ctx.fillStyle = "#2e8b57"; for (let i = 0; i < 4; i++) ctx.fillRect(x + i * 10 + 2, y + 2, 4, 8); }
    ctx.strokeStyle = "rgba(0,0,0,.25)"; ctx.strokeRect(x + .5, y + .5, TILE - 1, TILE - 1);
  } else if (t === "B") {
    ctx.fillStyle = "#c2703e"; ctx.fillRect(x, y, TILE, TILE);
    ctx.fillStyle = "#8b4513"; ctx.fillRect(x, y + 19, TILE, 2); ctx.fillRect(x + 19, y, 2, 19); ctx.fillRect(x + 9, y + 21, 2, 19); ctx.fillRect(x + 29, y + 21, 2, 19);
    ctx.strokeStyle = "#5a2d0c"; ctx.strokeRect(x + .5, y + .5, TILE - 1, TILE - 1);
  } else if (t === "?") {
    ctx.fillStyle = "#f8b800"; ctx.fillRect(x, y, TILE, TILE);
    ctx.strokeStyle = "#a05a00"; ctx.lineWidth = 2; ctx.strokeRect(x + 1, y + 1, TILE - 2, TILE - 2); ctx.lineWidth = 1;
    ctx.fillStyle = "#fff"; ctx.font = "bold 26px monospace"; ctx.textAlign = "center"; ctx.fillText("?", x + TILE / 2, y + 30);
  } else if (t === "=") {
    ctx.fillStyle = "#9a9aa8"; ctx.fillRect(x, y, TILE, TILE);
    ctx.fillStyle = "#7a7a88"; ctx.fillRect(x + 4, y + 4, 14, 14); ctx.fillRect(x + 22, y + 4, 14, 14); ctx.fillRect(x + 4, y + 22, 14, 14); ctx.fillRect(x + 22, y + 22, 14, 14);
    ctx.strokeStyle = "#44444f"; ctx.strokeRect(x + .5, y + .5, TILE - 1, TILE - 1);
  } else if (t === "U") {
    ctx.fillStyle = "#8a6a2a"; ctx.fillRect(x, y, TILE, TILE); ctx.strokeStyle = "#4a3a10"; ctx.strokeRect(x + .5, y + .5, TILE - 1, TILE - 1);
  } else if (t === "s") {
    ctx.fillStyle = "#ccc";
    for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(x + i * 10, y + TILE); ctx.lineTo(x + i * 10 + 5, y + 18); ctx.lineTo(x + i * 10 + 10, y + TILE); ctx.fill(); }
  }
}
function drawFlag() {
  const x = flagX + 18, top = (flagTop - 2) * TILE;
  ctx.fillStyle = "#ddd"; ctx.fillRect(x, top, 4, flagBase - top);
  ctx.fillStyle = "#eee"; ctx.beginPath(); ctx.arc(x + 2, top, 7, 0, 7); ctx.fill();
  ctx.fillStyle = "#e3350d"; ctx.beginPath(); ctx.moveTo(x, top + 6); ctx.lineTo(x - 42, top + 22); ctx.lineTo(x, top + 38); ctx.fill();
  drawPokeball(x - 20, top + 22, 7);
}
function drawHUD() {
  ctx.fillStyle = "rgba(0,0,0,.4)"; ctx.fillRect(0, 0, W, 34);
  ctx.fillStyle = "#fff"; ctx.font = "bold 15px monospace"; ctx.textAlign = "left";
  ctx.fillText("PUNKTE " + String(score).padStart(6, "0"), 12, 23);
  drawPokeball(190, 17, 9); ctx.fillText("x " + pokeballs, 204, 23);
  ctx.fillText("♥ x " + lives, 250, 23);
  if (masterBalls > 0) drawPokeball(306, 17, 9, 0, "#8a4fd6");
  let hx = 326;
  if (THEME.secrets) { ctx.fillStyle = "#ffde00"; ctx.fillText("★ " + progress.secrets.length + "/" + THEME.secretTotal, hx, 23); ctx.fillStyle = "#fff"; hx += 54; }
  if (progress.key) { ctx.fillStyle = "#ffde00"; ctx.beginPath(); ctx.arc(hx + 6, 17, 5, 0, 7); ctx.fill(); ctx.fillRect(hx + 8, 16, 11, 3); ctx.fillRect(hx + 14, 19, 2, 4); ctx.fillStyle = "#fff"; hx += 26; }
  if (sticks > 0 || THEME.sticks) { drawStick(hx + 10, 17); ctx.fillText("x " + sticks, hx + 24, 23); hx += 56; }
  if (cucumbers > 0 || THEME.cucumbers) { drawCucumber(hx + 11, 17, -0.5); ctx.fillText("x " + cucumbers, hx + 26, 23); hx += 58; }
  if (stars > 0 || THEME.stars) { drawStar(hx + 10, 17, 8, false); ctx.fillStyle = crowned ? "#ffd700" : "#fff"; ctx.fillText(crowned ? "Krone!" : stars + "/5", hx + 22, 23); ctx.fillStyle = "#fff"; hx += 64; }
  if (air < AIR_MAX) { ctx.fillStyle = "rgba(0,0,0,.45)"; ctx.fillRect(W / 2 - 110, 40, 220, 18); ctx.fillStyle = "#333"; ctx.fillRect(W / 2 - 100, 45, 200, 8); ctx.fillStyle = air < AIR_MAX * 0.3 ? "#e04030" : "#4fc3f7"; ctx.fillRect(W / 2 - 100, 45, 200 * air / AIR_MAX, 8); ctx.fillStyle = "#fff"; ctx.font = "bold 11px monospace"; ctx.textAlign = "center"; ctx.fillText("LUFT", W / 2, 54); ctx.font = "bold 15px monospace"; }
  let tx = 470;
  team.forEach((m, i) => {
    const L = sp(m).look;
    ctx.fillStyle = i === leadIdx ? "rgba(255,222,0,.35)" : "rgba(255,255,255,.12)"; ctx.fillRect(tx - 2, 3, 52, 28);
    ctx.fillStyle = m.hp > 0 ? L.body : "#555"; ctx.beginPath(); ctx.arc(tx + 8, 14, 7, 0, 7); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.font = "bold 10px monospace"; ctx.fillText("L" + m.level, tx + 18, 13);
    ctx.fillStyle = "#333"; ctx.fillRect(tx + 18, 18, 30, 6);
    ctx.fillStyle = hpColor(m.hp / m.maxHp); ctx.fillRect(tx + 18, 18, 30 * m.hp / m.maxHp, 6);
    ctx.fillStyle = "#ddd"; ctx.font = "9px monospace"; ctx.fillText(String(i + 1), tx + 2, 29);
    tx += 55;
  });
  ctx.font = "bold 15px monospace";
  if (activeSign && (state === "play" || state === "rest")) {
    ctx.font = "bold 15px monospace"; const lines = [], maxW = 640; let line = "";
    for (const wd of activeSign.split(" ")) { const t = line ? line + " " + wd : wd; if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = wd; } else line = t; }
    lines.push(line);
    const w = Math.max(...lines.map(l => ctx.measureText(l).width)) + 36, h = 14 + lines.length * 22;
    ctx.fillStyle = "rgba(60,40,20,.92)"; ctx.fillRect(W / 2 - w / 2, 40, w, h); ctx.strokeStyle = "#d2a060"; ctx.lineWidth = 2; ctx.strokeRect(W / 2 - w / 2, 40, w, h); ctx.lineWidth = 1;
    ctx.fillStyle = "#ffe9b0"; ctx.textAlign = "center"; lines.forEach((l, i) => ctx.fillText(l, W / 2, 60 + i * 22));
  }
  toasts.slice(-3).forEach((t, i) => {
    ctx.globalAlpha = Math.min(1, t.life / 20); ctx.fillStyle = "rgba(0,0,0,.55)"; const w = ctx.measureText(t.text).width + 20;
    const off = activeSign ? 18 + 22 * Math.max(1, Math.ceil(ctx.measureText(activeSign).width / 640)) : 0;
    ctx.fillRect(W / 2 - w / 2, 44 + off + i * 26, w, 22); ctx.fillStyle = t.color; ctx.textAlign = "center"; ctx.fillText(t.text, W / 2, 60 + off + i * 26); ctx.globalAlpha = 1;
  });
  if (state === "rest") {
    ctx.fillStyle = "rgba(0,0,0,.45)"; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#ffde00"; ctx.font = "bold 26px monospace"; ctx.textAlign = "center"; ctx.fillText("Pause im Stockhaus... Zzz", W / 2, 120);
    ctx.fillStyle = "#fff"; ctx.font = "16px monospace"; ctx.fillText("Dein Team erholt sich vollständig.", W / 2, 150); ctx.fillText("Checkpoint gesetzt: Hier geht es nach einem verlorenen Leben weiter.", W / 2, 174);
  }
  if (state === "win" || state === "gameover") {
    ctx.fillStyle = "rgba(0,0,0,.65)"; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = state === "win" ? "#ffde00" : "#ff5050"; ctx.font = "bold 42px monospace"; ctx.textAlign = "center";
    ctx.fillText(state === "win" ? (winSecret ? "GEHEIMES ZIEL GEFUNDEN!" : "LEVEL GESCHAFFT!") : "GAME OVER", W / 2, 110);
    ctx.fillStyle = "#fff"; ctx.font = "18px monospace";
    ctx.fillText(`Modus: ${diff.name}   Punkte: ${score}   Kämpfe: ${stats.battles}   Gefangen: ${stats.caught}   Entwicklungen: ${stats.evolutions}`, W / 2, 150);
    if (THEME.secrets) { ctx.fillStyle = "#ffde00"; ctx.fillText(`★ Geheimnisse gefunden: ${progress.secrets.length} von ${THEME.secretTotal}`, W / 2, 174); ctx.fillStyle = "#fff"; }
    ctx.fillText("Dein Team:", W / 2, 195);
    team.forEach((m, i) => {
      const x = W / 2 - (team.length - 1) * 60 + i * 120;
      drawMon(m.key, x, 300, 1.4 / sp(m).look.size, 1, {});
      ctx.fillStyle = "#fff"; ctx.font = "13px monospace"; ctx.textAlign = "center"; ctx.fillText(`${monName(m)} L${m.level}`, x, 325);
    });
    ctx.font = "18px monospace";
    if (state === "win" && levelIdx < LEVELS.length - 1) { ctx.fillStyle = "#ffde00"; ctx.fillText("Space/Enter: weiter zu Level " + LEVELS[levelIdx + 1].name, W / 2, 380); ctx.fillStyle = "#fff"; }
    else if (state === "win") ctx.fillText("Du hast alle Level geschafft!", W / 2, 380);
    ctx.fillText("R: zurück zur Auswahl   L: Level wechseln", W / 2, 410);
  }
  if (time < 260 && state === "play") {
    ctx.fillStyle = "rgba(0,0,0,.5)"; ctx.fillRect(W / 2 - 250, H / 2 - 70, 500, 86);
    ctx.fillStyle = "#ffde00"; ctx.font = "bold 20px monospace"; ctx.textAlign = "center";
    ctx.fillText(THEME.intro[0], W / 2, H / 2 - 42);
    ctx.fillStyle = "#fff"; ctx.font = "13px monospace";
    ctx.fillText(THEME.intro[1], W / 2, H / 2 - 18);
    ctx.fillText(THEME.intro[2], W / 2, H / 2 + 2);
  }
}
const hpColor = f => f > 0.5 ? "#30d050" : f > 0.2 ? "#f0c030" : "#e04030";

// =====================================================================
// Zeichnen: Kampf
// =====================================================================
function drawTitle() {
  const sky = ctx.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, "#1b2a6b"); sky.addColorStop(1, "#5c94fc");
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#3cb043"; ctx.fillRect(0, 432, W, 48);
  ctx.textAlign = "center"; ctx.fillStyle = "#ffde00"; ctx.font = "bold 46px monospace"; ctx.fillText("POKÉ-MARIO", W / 2, 66);
  ctx.fillStyle = "#fff"; ctx.font = "18px monospace"; ctx.fillText("Wer spielt? Wähle deine Schwierigkeit", W / 2, 100);
  [DIFFS.leichter, DIFFS.schwerer].forEach((d, i) => {
    const x = 55 + i * 380, y = 120, w = 310, h = 280, sel = titleSel === i;
    ctx.fillStyle = sel ? "rgba(255,255,255,.96)" : "rgba(255,255,255,.72)"; ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = sel ? "#ffde00" : "#333"; ctx.lineWidth = sel ? 5 : 2; ctx.strokeRect(x, y, w, h); ctx.lineWidth = 1;
    ctx.textAlign = "center"; ctx.fillStyle = d.color; ctx.font = "bold 30px monospace"; ctx.fillText(d.name, x + w / 2, y + 42);
    ctx.fillStyle = "#333"; ctx.font = "bold 15px monospace"; ctx.fillText("(" + d.label + ")", x + w / 2, y + 66);
    drawMon(d.mascot, x + 58, y + 170, 1.6 / SPECIES[d.mascot].look.size, 1, { cap: true });
    ctx.fillStyle = "#222"; ctx.font = "12px monospace"; ctx.textAlign = "left";
    d.info.forEach((line, k) => ctx.fillText("• " + line, x + 104, y + 104 + k * 24));
    ctx.textAlign = "center";
    if (sel) { ctx.fillStyle = "#e3350d"; ctx.font = "bold 16px monospace"; ctx.fillText(Math.floor(time / 30) % 2 ? "▶ Space / Enter ◀" : "▶ Los geht's! ◀", x + w / 2, y + h - 16); }
  });
  ctx.fillStyle = "#fff"; ctx.font = "14px monospace"; ctx.fillText("← →  oder Klick: wählen      Space / Enter: starten      1 / 2: direkt wählen", W / 2, 460);
}
function drawBattle() {
  const b = battle, m = me(), w = b.wild;
  const sky = ctx.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, "#1b2a6b"); sky.addColorStop(0.6, "#7fb3ff"); sky.addColorStop(1, "#9be39b");
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#5bb35b"; ctx.beginPath(); ctx.ellipse(600, 262, 130, 26, 0, 0, 7); ctx.fill();
  ctx.fillStyle = "#4da34d"; ctx.beginPath(); ctx.ellipse(210, 395, 170, 30, 0, 0, 7); ctx.fill();

  let meDx = 0, meDy = 0, wDx = 0, wDy = 0, meAlpha = 1, wAlpha = 1, hitFlash = false;
  const a = b.anim, at = b.step ? b.step.t : 0;
  if (a) {
    const f = at / a.dur;
    if (a.type === "lunge") { const k = Math.sin(f * Math.PI) * 50; if (a.who === "me") { meDx = k; meDy = -k * 0.4; } else { wDx = -k; wDy = k * 0.4; } }
    if (a.type === "hit") { const k = Math.sin(at * 1.5) * 8 * (1 - f); if (a.who === "me") { meDx = k; meAlpha = at % 6 < 3 ? 0.3 : 1; } else { wDx = k; wAlpha = at % 6 < 3 ? 0.3 : 1; } hitFlash = at < 4; }
    if (a.type === "faint") { if (a.who === "me") { meDy = f * 120; meAlpha = 1 - f; } else { wDy = f * 120; wAlpha = 1 - f; } }
  }
  // Wildes Pokémon
  const wx = 600 + wDx, wy = 258 + wDy, ws = 2 / sp(w).look.size;
  if (b.inBall && !(a && a.type === "break")) {
    let rot = 0;
    if (a && a.type === "shake") rot = Math.sin(at * 0.6) * 0.5 * (1 - at / a.dur);
    if (a && a.type === "caught") { ctx.fillStyle = "#ffe066"; for (let i = 0; i < 6; i++) { const ang = i * 1.05 + at * 0.1, r = 30 + at; ctx.fillRect(wx + Math.cos(ang) * r, wy - 30 + Math.sin(ang) * r, 5, 5); } }
    drawPokeball(wx, wy - 18, 18, rot, b.ballColor);
  } else if (a && a.type === "ballfly") {
    const f = at / a.dur, bx = 260 + (wx - 260) * f, by = 300 - Math.sin(f * Math.PI) * 160 + (wy - 30 - 300) * f;
    const shrink = Math.max(0, 1 - Math.max(0, f - 0.7) / 0.3);
    if (shrink > 0) drawMon(w.key, wx, wy, ws * (0.4 + 0.6 * shrink), -1, { alpha: shrink });
    drawPokeball(bx, by, 18, f * 12, b.ballColor);
  } else if (a && a.type === "break") {
    const f = at / a.dur;
    drawMon(w.key, wx, wy, ws * (0.5 + 0.5 * f), -1, {});
    ctx.fillStyle = "#fff"; for (let i = 0; i < 8; i++) { const ang = i * 0.785; ctx.fillRect(wx + Math.cos(ang) * f * 60, wy - 30 + Math.sin(ang) * f * 60, 4, 4); }
  } else if (w.hp > 0 || (a && a.type === "faint" && a.who === "wild")) {
    drawMon(w.key, wx, wy, ws, -1, { alpha: wAlpha });
  }
  // Mein Pokémon
  const mx = 210 + meDx, my = 392 + meDy, ms = 2.6 / sp(m).look.size;
  if (a && a.type === "evolve") {
    const f = at / a.dur, white = Math.min(1, f * 3);
    const toggle = f > 0.25 && Math.floor(at / Math.max(3, 14 - at / 8)) % 2 === 1;
    const key = toggle ? b.evoKey : m.key, s = 2.6 / SPECIES[key].look.size;
    ctx.fillStyle = `rgba(255,255,255,${0.35 * Math.sin(f * Math.PI)})`; ctx.fillRect(0, 0, W, H);
    drawMonFlash(key, mx, my, s, 1, f > 0.9 ? (1 - f) * 10 : white);
  } else if (m.hp > 0 || (a && a.type === "faint" && a.who === "me")) {
    drawMon(m.key, mx, my, ms, 1, { alpha: meAlpha, cap: true });
  }
  if (hitFlash) { ctx.fillStyle = "rgba(255,255,255,.25)"; ctx.fillRect(0, 0, W, H); }

  drawStatusBox(30, 40, w, b.shown.wild, false);
  drawStatusBox(470, 290, m, b.shown.me, true);

  // Textbox
  ctx.fillStyle = "#1c1c3a"; ctx.fillRect(0, 396, W, 84);
  ctx.strokeStyle = "#f8d030"; ctx.lineWidth = 3; ctx.strokeRect(8, 402, W - 16, 70); ctx.lineWidth = 1;
  ctx.fillStyle = "#fff"; ctx.font = "bold 17px monospace"; ctx.textAlign = "left";
  const inMenu = b.phase === "menu" || b.phase === "moves" || b.phase === "switch";
  wrapText(b.text, 24, 430, inMenu ? 440 : W - 50, 22);
  if (b.phase === "msg" && b.step && b.step.text !== undefined && b.step.t > 8 && Math.floor(time / 20) % 2) { ctx.fillStyle = "#f8d030"; ctx.beginPath(); ctx.moveTo(W - 34, 456); ctx.lineTo(W - 22, 456); ctx.lineTo(W - 28, 464); ctx.fill(); }
  if (b.phase === "menu") {
    const opts = ["KAMPF", "POKÉBALL", "WECHSELN", "FLUCHT"];
    opts.forEach((o, i) => { const x = 480 + (i % 2) * 160, y = 428 + Math.floor(i / 2) * 28; ctx.fillStyle = i === b.menu ? "#f8d030" : "#fff"; ctx.fillText((i === b.menu ? "▶ " : "  ") + o, x, y); });
  } else if (b.phase === "moves") {
    sp(m).moves.forEach((k, i) => {
      const mv = MOVES[k], y = 428 + i * 26;
      ctx.fillStyle = i === b.sub ? "#f8d030" : "#fff"; ctx.font = "bold 17px monospace"; ctx.fillText((i === b.sub ? "▶ " : "  ") + mv.name, 480, y);
      ctx.fillStyle = TYPE_COLOR[mv.type]; ctx.fillRect(660, y - 12, 100, 16); ctx.fillStyle = "#222"; ctx.font = "bold 11px monospace"; ctx.fillText(mv.type.toUpperCase() + " " + mv.power, 664, y);
    });
    ctx.fillStyle = "#aaa"; ctx.font = "11px monospace"; ctx.fillText("Esc: zurück", 480, 468);
  } else if (b.phase === "switch") {
    const choices = team.map((_, i) => i).filter(i => i !== b.mine && team[i].hp > 0);
    ctx.font = "bold 14px monospace";
    choices.slice(0, 3).forEach((idx, i) => { const t = team[idx], y = 424 + i * 18; ctx.fillStyle = i === b.sub ? "#f8d030" : "#fff"; ctx.fillText(`${i === b.sub ? "▶" : " "} ${monName(t)} L${t.level} ${t.hp}/${t.maxHp}`, 480, y); });
    if (choices.length > 3) { ctx.fillStyle = "#aaa"; ctx.fillText("...", 480, 476); }
  }
}
function drawStatusBox(x, y, m, shownHp, mine) {
  ctx.fillStyle = "rgba(255,255,255,.92)"; ctx.fillRect(x, y, 300, mine ? 84 : 66);
  ctx.strokeStyle = "#333"; ctx.lineWidth = 3; ctx.strokeRect(x, y, 300, mine ? 84 : 66); ctx.lineWidth = 1;
  ctx.fillStyle = "#222"; ctx.font = "bold 17px monospace"; ctx.textAlign = "left";
  ctx.fillText(monName(m).toUpperCase(), x + 12, y + 24);
  ctx.textAlign = "right"; ctx.fillText("Lv" + m.level, x + 288, y + 24);
  const types = [sp(m).type].concat(sp(m).type2 ? [sp(m).type2] : []);
  types.forEach((tp, i) => { ctx.fillStyle = TYPE_COLOR[tp]; ctx.fillRect(x + 12 + i * 46, y + 30, 44, 12); ctx.fillStyle = "#222"; ctx.font = "bold 8px monospace"; ctx.textAlign = "left"; ctx.fillText(tp.toUpperCase(), x + 14 + i * 46, y + 39); });
  ctx.fillStyle = "#222"; ctx.font = "bold 11px monospace"; ctx.fillText("KP", x + 106, y + 40);
  ctx.fillStyle = "#333"; ctx.fillRect(x + 128, y + 31, 156, 10);
  const f = Math.max(0, shownHp / m.maxHp); ctx.fillStyle = hpColor(f); ctx.fillRect(x + 128, y + 31, 156 * f, 10);
  if (mine) {
    ctx.fillStyle = "#222"; ctx.font = "bold 13px monospace"; ctx.textAlign = "right"; ctx.fillText(`${Math.ceil(shownHp)}/${m.maxHp}`, x + 284, y + 58);
    ctx.font = "bold 10px monospace"; ctx.textAlign = "left"; ctx.fillText("EP", x + 12, y + 76);
    ctx.fillStyle = "#333"; ctx.fillRect(x + 34, y + 68, 250, 8); ctx.fillStyle = "#3a8ee6"; ctx.fillRect(x + 34, y + 68, 250 * Math.min(1, m.xp / xpNeeded(m)), 8);
  }
}
function wrapText(text, x, y, maxW, lh) {
  const words = text.split(" "); let line = "";
  for (const w of words) { const t = line ? line + " " + w : w; if (ctx.measureText(t).width > maxW && line) { ctx.fillText(line, x, y); y += lh; line = w; } else line = t; }
  ctx.fillText(line, x, y);
}

// =====================================================================
// Loop
// =====================================================================
let last = 0, acc = 0; const STEP = 1000 / 60;
function loop(ts) {
  acc += Math.min(100, ts - last); last = ts;
  while (acc >= STEP) { update(); acc -= STEP; }
  renderAlpha = acc / STEP;
  draw(); requestAnimationFrame(loop);
}
const startLevel = parseInt(location.hash.slice(1)) || 1; loadLevel(startLevel >= 1 && startLevel <= LEVELS.length ? startLevel - 1 : 0); init(false); state = "title"; requestAnimationFrame(loop);
// __TESTHOOK__
})();