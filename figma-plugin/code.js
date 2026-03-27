// ============================================================
// Aguilas del Sol - Dashboard Design System Generator
// Figma Plugin - Generates full design system + dashboard layout
// ============================================================

// --- COLOR TOKENS ---
const COLORS = {
  // Primary (Gold)
  'Primary/50': { r: 1, g: 0.984, b: 0.922 },        // #fffbeb
  'Primary/100': { r: 0.996, g: 0.953, b: 0.780 },    // #fef3c7
  'Primary/200': { r: 0.992, g: 0.906, b: 0.541 },    // #fde68a
  'Primary/300': { r: 0.988, g: 0.827, b: 0.302 },    // #fcd34d
  'Primary/400': { r: 0.984, g: 0.749, b: 0.141 },    // #fbbf24
  'Primary/500': { r: 0.961, g: 0.620, b: 0.043 },    // #f59e0b
  'Primary/600': { r: 0.851, g: 0.467, b: 0.024 },    // #d97706
  'Primary/700': { r: 0.706, g: 0.325, b: 0.035 },    // #b45309
  'Primary/800': { r: 0.573, g: 0.251, b: 0.055 },    // #92400e
  'Primary/900': { r: 0.471, g: 0.208, b: 0.059 },    // #78350f

  // Secondary (Dark)
  'Secondary/Default': { r: 0.039, g: 0.039, b: 0.039 },   // #0a0a0a
  'Secondary/Light': { r: 0.102, g: 0.102, b: 0.180 },     // #1a1a2e
  'Secondary/Lighter': { r: 0.165, g: 0.165, b: 0.306 },   // #2a2a4e

  // Background
  'Background/Default': { r: 0.039, g: 0.039, b: 0.039 },  // #0a0a0a
  'Background/Card': { r: 0.102, g: 0.102, b: 0.180 },     // #1a1a2e
  'Background/Hover': { r: 0.165, g: 0.165, b: 0.306 },    // #2a2a4e

  // Border
  'Border/Default': { r: 0.165, g: 0.165, b: 0.306 },      // #2a2a4e
  'Border/Light': { r: 0.227, g: 0.227, b: 0.369 },        // #3a3a5e

  // Danger (Red)
  'Danger/Default': { r: 0.863, g: 0.149, b: 0.149 },      // #dc2626
  'Danger/Light': { r: 0.937, g: 0.267, b: 0.267 },        // #ef4444
  'Danger/Dark': { r: 0.600, g: 0.106, b: 0.106 },         // #991b1b

  // Success (Green)
  'Success/Default': { r: 0.133, g: 0.773, b: 0.369 },     // #22c55e
  'Success/Light': { r: 0.290, g: 0.871, b: 0.502 },       // #4ade80
  'Success/Dark': { r: 0.086, g: 0.639, b: 0.290 },        // #16a34a

  // Warning (Yellow)
  'Warning/Default': { r: 0.918, g: 0.702, b: 0.031 },     // #eab308
  'Warning/Light': { r: 0.980, g: 0.800, b: 0.082 },       // #facc15
  'Warning/Dark': { r: 0.792, g: 0.541, b: 0.016 },        // #ca8a04

  // Text
  'Text/Primary': { r: 1, g: 1, b: 1 },                    // #ffffff
  'Text/Secondary': { r: 0.616, g: 0.631, b: 0.667 },      // #9ca3af (gray-400)
  'Text/Tertiary': { r: 0.827, g: 0.843, b: 0.863 },       // #d1d5db (gray-300)
  'Text/Subtle': { r: 0.420, g: 0.447, b: 0.502 },         // #6b7280 (gray-500)

  // Status
  'Status/Available': { r: 0.133, g: 0.773, b: 0.369 },    // green
  'Status/Patrolling': { r: 0.235, g: 0.502, b: 0.961 },   // blue
  'Status/FixedPost': { r: 0.918, g: 0.702, b: 0.031 },    // yellow
  'Status/Emergency': { r: 0.863, g: 0.149, b: 0.149 },    // red
  'Status/Offline': { r: 0.420, g: 0.447, b: 0.502 },      // gray
};

// --- TYPOGRAPHY ---
const TYPOGRAPHY = {
  'Display/Title': { size: 30, weight: 700, lineHeight: 36 },
  'Heading/H1': { size: 24, weight: 700, lineHeight: 32 },
  'Heading/H2': { size: 20, weight: 600, lineHeight: 28 },
  'Heading/H3': { size: 18, weight: 600, lineHeight: 24 },
  'Body/Default': { size: 16, weight: 400, lineHeight: 24 },
  'Body/Medium': { size: 16, weight: 500, lineHeight: 24 },
  'Label/Default': { size: 14, weight: 500, lineHeight: 20 },
  'Label/Small': { size: 12, weight: 500, lineHeight: 16 },
  'Caption/Default': { size: 12, weight: 400, lineHeight: 16 },
};

// --- SPACING ---
const SPACING = [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64];

// --- HELPERS ---
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return { r, g, b };
}

function createSolidPaint(color) {
  return [{ type: 'SOLID', color }];
}

function createRect(parent, x, y, w, h, color, cornerRadius) {
  const rect = figma.createRectangle();
  rect.x = x;
  rect.y = y;
  rect.resize(w, h);
  rect.fills = createSolidPaint(color);
  if (cornerRadius) rect.cornerRadius = cornerRadius;
  parent.appendChild(rect);
  return rect;
}

function createFrame(parent, name, x, y, w, h, color, options = {}) {
  const frame = figma.createFrame();
  frame.name = name;
  frame.x = x;
  frame.y = y;
  frame.resize(w, h);
  if (color) frame.fills = createSolidPaint(color);
  else frame.fills = [];
  if (options.cornerRadius) frame.cornerRadius = options.cornerRadius;
  if (options.layoutMode) {
    frame.layoutMode = options.layoutMode;
    frame.primaryAxisAlignItems = options.primaryAxisAlignItems || 'MIN';
    frame.counterAxisAlignItems = options.counterAxisAlignItems || 'MIN';
    frame.itemSpacing = options.itemSpacing || 0;
    frame.paddingTop = options.paddingTop || 0;
    frame.paddingBottom = options.paddingBottom || 0;
    frame.paddingLeft = options.paddingLeft || 0;
    frame.paddingRight = options.paddingRight || 0;
  }
  if (options.stroke) {
    frame.strokes = createSolidPaint(options.stroke);
    frame.strokeWeight = options.strokeWeight || 1;
  }
  if (parent) parent.appendChild(frame);
  return frame;
}

async function createText(parent, text, x, y, color, fontSize, fontWeight, options = {}) {
  const weight = fontWeight === 700 ? 'Bold' : fontWeight === 600 ? 'SemiBold' : fontWeight === 500 ? 'Medium' : 'Regular';
  await figma.loadFontAsync({ family: 'Inter', style: weight });

  const node = figma.createText();
  node.fontName = { family: 'Inter', style: weight };
  node.characters = text;
  node.fontSize = fontSize;
  node.fills = createSolidPaint(color);
  node.x = x;
  node.y = y;
  if (options.width) {
    node.resize(options.width, node.height);
    node.textAutoResize = 'HEIGHT';
  }
  if (parent) parent.appendChild(node);
  return node;
}

// --- PAINT STYLES ---
async function createColorStyles() {
  const styles = {};
  for (const [name, color] of Object.entries(COLORS)) {
    const style = figma.createPaintStyle();
    style.name = name;
    style.paints = createSolidPaint(color);
    styles[name] = style;
  }
  return styles;
}

// --- TEXT STYLES ---
async function createTextStyles() {
  const styles = {};
  for (const [name, config] of Object.entries(TYPOGRAPHY)) {
    const weight = config.weight === 700 ? 'Bold' : config.weight === 600 ? 'SemiBold' : config.weight === 500 ? 'Medium' : 'Regular';
    await figma.loadFontAsync({ family: 'Inter', style: weight });

    const style = figma.createTextStyle();
    style.name = name;
    style.fontName = { family: 'Inter', style: weight };
    style.fontSize = config.size;
    style.lineHeight = { value: config.lineHeight, unit: 'PIXELS' };
    styles[name] = style;
  }
  return styles;
}

// ============================================================
// PAGE 1: DESIGN TOKENS
// ============================================================
async function createDesignTokensPage() {
  const page = figma.createPage();
  page.name = 'Design Tokens';

  // --- Color Swatches ---
  const colorsFrame = createFrame(null, 'Color Palette', 0, 0, 1600, 1200, COLORS['Background/Default']);
  page.appendChild(colorsFrame);

  await createText(colorsFrame, 'Color Palette - Aguilas del Sol', 40, 30, COLORS['Text/Primary'], 30, 700);
  await createText(colorsFrame, 'Design System Tokens', 40, 70, COLORS['Text/Secondary'], 14, 400);

  let yPos = 120;
  const groups = {
    'Primary': ['Primary/50', 'Primary/100', 'Primary/200', 'Primary/300', 'Primary/400', 'Primary/500', 'Primary/600', 'Primary/700', 'Primary/800', 'Primary/900'],
    'Secondary': ['Secondary/Default', 'Secondary/Light', 'Secondary/Lighter'],
    'Background': ['Background/Default', 'Background/Card', 'Background/Hover'],
    'Border': ['Border/Default', 'Border/Light'],
    'Danger': ['Danger/Default', 'Danger/Light', 'Danger/Dark'],
    'Success': ['Success/Default', 'Success/Light', 'Success/Dark'],
    'Warning': ['Warning/Default', 'Warning/Light', 'Warning/Dark'],
    'Text': ['Text/Primary', 'Text/Secondary', 'Text/Tertiary', 'Text/Subtle'],
    'Status': ['Status/Available', 'Status/Patrolling', 'Status/FixedPost', 'Status/Emergency', 'Status/Offline'],
  };

  for (const [groupName, tokens] of Object.entries(groups)) {
    await createText(colorsFrame, groupName, 40, yPos, COLORS['Primary/500'], 18, 600);
    yPos += 30;

    let xPos = 40;
    for (const token of tokens) {
      const swatch = createRect(colorsFrame, xPos, yPos, 80, 80, COLORS[token], 8);
      swatch.name = token;
      const label = token.split('/')[1];
      await createText(colorsFrame, label, xPos, yPos + 88, COLORS['Text/Secondary'], 11, 400);
      xPos += 100;
    }
    yPos += 130;
  }

  // --- Typography Scale ---
  const typoFrame = createFrame(null, 'Typography Scale', 1700, 0, 800, 800, COLORS['Background/Default']);
  page.appendChild(typoFrame);

  await createText(typoFrame, 'Typography Scale', 40, 30, COLORS['Text/Primary'], 30, 700);
  await createText(typoFrame, 'Font: Inter | Mono: JetBrains Mono', 40, 70, COLORS['Text/Secondary'], 14, 400);

  let typoY = 120;
  for (const [name, config] of Object.entries(TYPOGRAPHY)) {
    await createText(typoFrame, `${name} - ${config.size}px / ${config.weight}`, 40, typoY, COLORS['Text/Primary'], config.size, config.weight);
    typoY += config.lineHeight + 16;
  }

  // --- Spacing Scale ---
  const spacingFrame = createFrame(null, 'Spacing Scale', 2600, 0, 600, 500, COLORS['Background/Default']);
  page.appendChild(spacingFrame);

  await createText(spacingFrame, 'Spacing Scale', 40, 30, COLORS['Text/Primary'], 30, 700);

  let spY = 100;
  for (const sp of SPACING) {
    if (sp === 0) continue;
    const bar = createRect(spacingFrame, 40, spY, sp * 4, 24, COLORS['Primary/500'], 4);
    bar.name = `space-${sp}`;
    await createText(spacingFrame, `${sp}px`, 40 + sp * 4 + 12, spY + 4, COLORS['Text/Secondary'], 12, 400);
    spY += 40;
  }

  return page;
}

// ============================================================
// PAGE 2: COMPONENTS
// ============================================================
async function createComponentsPage() {
  const page = figma.createPage();
  page.name = 'Components';

  // --- BUTTONS ---
  const buttonsFrame = createFrame(null, 'Buttons', 0, 0, 1200, 500, COLORS['Background/Default']);
  page.appendChild(buttonsFrame);

  await createText(buttonsFrame, 'Buttons', 40, 30, COLORS['Text/Primary'], 24, 700);

  const buttonConfigs = [
    { label: 'Primary', bg: COLORS['Primary/500'], text: COLORS['Text/Primary'] },
    { label: 'Danger', bg: COLORS['Danger/Default'], text: COLORS['Text/Primary'] },
    { label: 'Success', bg: COLORS['Success/Default'], text: COLORS['Text/Primary'] },
    { label: 'Warning', bg: COLORS['Warning/Default'], text: COLORS['Text/Primary'] },
    { label: 'Ghost', bg: COLORS['Background/Hover'], text: COLORS['Text/Tertiary'] },
  ];

  let btnX = 40;
  for (const cfg of buttonConfigs) {
    const btn = createFrame(buttonsFrame, `Button/${cfg.label}`, btnX, 80, 140, 40, cfg.bg, { cornerRadius: 8 });
    await createText(btn, cfg.label, 20, 10, cfg.text, 14, 500);
    btnX += 160;
  }

  // Disabled variant
  const disBtn = createFrame(buttonsFrame, 'Button/Disabled', btnX, 80, 140, 40, COLORS['Background/Hover'], { cornerRadius: 8 });
  disBtn.opacity = 0.5;
  await createText(disBtn, 'Disabled', 20, 10, COLORS['Text/Subtle'], 14, 500);

  // --- CARDS ---
  await createText(buttonsFrame, 'Cards', 40, 160, COLORS['Text/Primary'], 24, 700);

  // Base Card
  const card = createFrame(buttonsFrame, 'Card/Base', 40, 210, 300, 180, COLORS['Background/Card'], {
    cornerRadius: 8,
    stroke: COLORS['Border/Default'],
    strokeWeight: 1,
  });
  await createText(card, 'Card Title', 16, 16, COLORS['Text/Primary'], 18, 600);
  await createText(card, 'Card content goes here with secondary text styling for descriptions and details.', 16, 48, COLORS['Text/Secondary'], 14, 400, { width: 268 });

  // Stat Card
  const statCard = createFrame(buttonsFrame, 'Card/Stat', 360, 210, 240, 120, COLORS['Background/Card'], {
    cornerRadius: 8,
    stroke: COLORS['Border/Default'],
    strokeWeight: 1,
  });
  await createText(statCard, 'Agentes Online', 16, 16, COLORS['Text/Secondary'], 14, 400);
  await createText(statCard, '12/15', 16, 44, COLORS['Success/Default'], 24, 700);
  const iconCircle = createRect(statCard, 176, 16, 48, 48, COLORS['Success/Default'], 12);
  iconCircle.opacity = 0.15;

  // Alert Card
  const alertCard = createFrame(buttonsFrame, 'Card/Alert', 620, 210, 320, 180, COLORS['Background/Card'], {
    cornerRadius: 8,
    stroke: COLORS['Danger/Default'],
    strokeWeight: 2,
  });
  await createText(alertCard, 'AGT-001 - Juan Perez', 16, 16, COLORS['Text/Primary'], 16, 600);
  // Priority badge
  const badge = createFrame(alertCard, 'Badge/Critical', 16, 44, 80, 24, COLORS['Danger/Default'], { cornerRadius: 12 });
  await createText(badge, 'Critica', 12, 4, COLORS['Text/Primary'], 12, 500);
  await createText(alertCard, 'Zona: Miraflores', 16, 80, COLORS['Text/Secondary'], 14, 400);
  await createText(alertCard, 'hace 2 minutos', 16, 102, COLORS['Text/Subtle'], 12, 400);
  // Action buttons
  const ackBtn = createFrame(alertCard, 'Btn/Reconocer', 16, 136, 90, 32, COLORS['Primary/500'], { cornerRadius: 6 });
  await createText(ackBtn, 'Reconocer', 8, 8, COLORS['Text/Primary'], 12, 500);
  const respBtn = createFrame(alertCard, 'Btn/Responder', 114, 136, 90, 32, { r: 0.235, g: 0.502, b: 0.961 }, { cornerRadius: 6 });
  await createText(respBtn, 'Responder', 8, 8, COLORS['Text/Primary'], 12, 500);
  const resBtn = createFrame(alertCard, 'Btn/Resolver', 212, 136, 90, 32, COLORS['Success/Default'], { cornerRadius: 6 });
  await createText(resBtn, 'Resolver', 12, 8, COLORS['Text/Primary'], 12, 500);

  // --- BADGES ---
  await createText(buttonsFrame, 'Badges / Status', 40, 420, COLORS['Text/Primary'], 24, 700);

  const badgeConfigs = [
    { label: 'Disponible', color: COLORS['Status/Available'] },
    { label: 'Patrullando', color: COLORS['Status/Patrolling'] },
    { label: 'Puesto Fijo', color: COLORS['Status/FixedPost'] },
    { label: 'Emergencia', color: COLORS['Status/Emergency'] },
    { label: 'Desconectado', color: COLORS['Status/Offline'] },
  ];

  let badgeX = 40;
  for (const cfg of badgeConfigs) {
    // Dot
    createRect(buttonsFrame, badgeX, 468, 10, 10, cfg.color, 5);
    await createText(buttonsFrame, cfg.label, badgeX + 16, 464, cfg.color, 13, 500);
    badgeX += 130;
  }

  return page;
}

// ============================================================
// PAGE 3: DASHBOARD LAYOUT
// ============================================================
async function createDashboardPage() {
  const page = figma.createPage();
  page.name = 'Dashboard - Main';

  // Full viewport frame (1920x1080)
  const viewport = createFrame(null, 'Dashboard / 1920x1080', 0, 0, 1920, 1080, COLORS['Background/Default']);
  page.appendChild(viewport);

  // --- SIDEBAR (264px) ---
  const sidebar = createFrame(viewport, 'Sidebar', 0, 0, 264, 1080, COLORS['Secondary/Light'], {
    stroke: COLORS['Border/Default'],
    strokeWeight: 1,
  });

  // Logo area
  const logoArea = createFrame(sidebar, 'Logo', 0, 0, 264, 72, null);
  const shield = createRect(logoArea, 24, 16, 40, 40, COLORS['Primary/500'], 8);
  shield.name = 'Shield Icon';
  await createText(logoArea, 'Aguilas del Sol', 72, 16, COLORS['Text/Primary'], 16, 700);
  await createText(logoArea, 'ADS Security', 72, 36, COLORS['Primary/500'], 12, 400);

  // Divider
  createRect(sidebar, 24, 72, 216, 1, COLORS['Border/Default'], 0);

  // Nav items
  const navItems = [
    { label: 'Dashboard', active: true },
    { label: 'Agentes', active: false },
    { label: 'Alertas', active: false },
    { label: 'Reportes', active: false },
    { label: 'Configuracion', active: false },
  ];

  let navY = 92;
  for (const item of navItems) {
    const navItem = createFrame(sidebar, `Nav/${item.label}`, 12, navY, 240, 44, null, { cornerRadius: 8 });
    if (item.active) {
      navItem.fills = [{ type: 'SOLID', color: COLORS['Primary/500'], opacity: 0.2 }];
    }
    // Icon placeholder
    createRect(navItem, 12, 12, 20, 20, item.active ? COLORS['Primary/500'] : COLORS['Text/Secondary'], 4);
    const textColor = item.active ? COLORS['Primary/500'] : COLORS['Text/Secondary'];
    await createText(navItem, item.label, 44, 12, textColor, 14, 500);
    navY += 48;
  }

  // User profile at bottom
  const userArea = createFrame(sidebar, 'User Profile', 0, 1000, 264, 80, null);
  createRect(sidebar, 24, 992, 216, 1, COLORS['Border/Default'], 0);
  const avatar = createRect(userArea, 16, 16, 40, 40, COLORS['Primary/500'], 20);
  avatar.name = 'Avatar';
  await createText(userArea, 'OP', 27, 28, COLORS['Text/Primary'], 14, 600);
  await createText(userArea, 'Operador', 64, 16, COLORS['Text/Primary'], 14, 500);
  await createText(userArea, 'operador@ads.com', 64, 36, COLORS['Text/Subtle'], 12, 400);

  // --- HEADER (h-64, from x=264) ---
  const header = createFrame(viewport, 'Header', 264, 0, 1656, 64, COLORS['Secondary/Light'], {
    stroke: COLORS['Border/Default'],
    strokeWeight: 1,
  });

  await createText(header, 'Centro de Monitoreo 24/7', 24, 12, COLORS['Text/Primary'], 18, 700);
  await createText(header, '19 Feb 2026 - 14:30:45', 24, 36, COLORS['Text/Secondary'], 12, 400);

  // Right side of header
  // System status
  const statusDot = createRect(header, 1440, 24, 10, 10, COLORS['Status/Available'], 5);
  statusDot.name = 'Status Dot';
  await createText(header, 'Sistema Operativo', 1456, 20, COLORS['Success/Default'], 13, 500);

  // Alert badge
  const alertBadge = createFrame(header, 'Alert Badge', 1580, 16, 56, 32, COLORS['Danger/Default'], { cornerRadius: 8 });
  await createText(alertBadge, '3', 24, 8, COLORS['Text/Primary'], 14, 700);

  // --- MAIN CONTENT ---
  const main = createFrame(viewport, 'Main Content', 264, 64, 1656, 1016, null);
  main.fills = [];

  // --- STATS BAR (4 cards) ---
  const statsData = [
    { label: 'Agentes Online', value: '12/15', color: COLORS['Success/Default'] },
    { label: 'Alertas Activas', value: '3', color: COLORS['Danger/Default'] },
    { label: 'Resueltas Hoy', value: '8', color: COLORS['Primary/500'] },
    { label: 'Tiempo Promedio', value: '2m 45s', color: { r: 0.235, g: 0.502, b: 0.961 } },
  ];

  let statX = 24;
  for (const stat of statsData) {
    const statCard = createFrame(main, `Stat/${stat.label}`, statX, 24, 380, 100, COLORS['Background/Card'], {
      cornerRadius: 8,
      stroke: COLORS['Border/Default'],
      strokeWeight: 1,
    });
    await createText(statCard, stat.label, 16, 16, COLORS['Text/Secondary'], 14, 400);
    await createText(statCard, stat.value, 16, 44, stat.color, 24, 700);
    // Icon circle
    const ic = createRect(statCard, 312, 20, 48, 48, stat.color, 12);
    ic.opacity = 0.15;
    const ic2 = createRect(statCard, 324, 32, 24, 24, stat.color, 4);
    ic2.name = 'Icon';
    statX += 396;
  }

  // --- MAP AREA ---
  const mapArea = createFrame(main, 'Live Map', 24, 148, 1020, 844, COLORS['Background/Card'], {
    cornerRadius: 8,
    stroke: COLORS['Border/Default'],
    strokeWeight: 1,
  });
  // Map placeholder with dark bg
  const mapBg = createRect(mapArea, 0, 0, 1020, 844, { r: 0.078, g: 0.078, b: 0.118 }, 8);
  mapBg.name = 'Map Tile BG';
  await createText(mapArea, 'Mapa en Vivo - Lima, Peru', 16, 16, COLORS['Text/Secondary'], 14, 500);

  // Agent markers on map
  const markers = [
    { x: 300, y: 350, color: COLORS['Status/Available'], label: 'AGT-001' },
    { x: 500, y: 280, color: COLORS['Status/Patrolling'], label: 'AGT-002' },
    { x: 200, y: 500, color: COLORS['Status/Emergency'], label: 'AGT-003' },
    { x: 650, y: 400, color: COLORS['Status/FixedPost'], label: 'AGT-004' },
    { x: 450, y: 600, color: COLORS['Status/Available'], label: 'AGT-005' },
  ];

  for (const m of markers) {
    const marker = createRect(mapArea, m.x, m.y, 16, 16, m.color, 8);
    marker.name = m.label;
    // Ping ring for emergency
    if (m.color === COLORS['Status/Emergency']) {
      const ring = createRect(mapArea, m.x - 6, m.y - 6, 28, 28, m.color, 14);
      ring.opacity = 0.3;
      ring.name = `${m.label} Ping`;
    }
    await createText(mapArea, m.label, m.x + 20, m.y, COLORS['Text/Primary'], 11, 500);
  }

  // Map legend
  const legend = createFrame(mapArea, 'Map Legend', 16, 760, 300, 68, COLORS['Background/Card'], {
    cornerRadius: 8,
    stroke: COLORS['Border/Default'],
  });
  legend.opacity = 0.9;
  const legendItems = [
    { label: 'Disponible', color: COLORS['Status/Available'] },
    { label: 'Patrullando', color: COLORS['Status/Patrolling'] },
    { label: 'Puesto Fijo', color: COLORS['Status/FixedPost'] },
    { label: 'Emergencia', color: COLORS['Status/Emergency'] },
    { label: 'Offline', color: COLORS['Status/Offline'] },
  ];
  let legX = 12;
  for (const l of legendItems) {
    createRect(legend, legX, 26, 8, 8, l.color, 4);
    await createText(legend, l.label, legX + 12, 22, COLORS['Text/Secondary'], 10, 400);
    legX += 58;
  }

  // Agent count badge
  const countBadge = createFrame(mapArea, 'Agent Count', 940, 16, 64, 28, COLORS['Background/Card'], {
    cornerRadius: 6,
    stroke: COLORS['Border/Default'],
  });
  await createText(countBadge, '12 Agentes', 6, 6, COLORS['Text/Secondary'], 10, 500);

  // --- ALERT PANEL (right side) ---
  const alertPanel = createFrame(main, 'Alert Panel', 1060, 148, 572, 844, COLORS['Background/Card'], {
    cornerRadius: 8,
    stroke: COLORS['Border/Default'],
    strokeWeight: 1,
  });

  // Panel header
  await createText(alertPanel, 'Alertas Activas', 20, 20, COLORS['Text/Primary'], 18, 700);
  const countCircle = createFrame(alertPanel, 'Count', 168, 18, 32, 28, COLORS['Danger/Default'], { cornerRadius: 14 });
  await createText(countCircle, '3', 12, 5, COLORS['Text/Primary'], 14, 700);

  // Section: Requieren Atencion
  await createText(alertPanel, 'Requieren Atencion', 20, 68, COLORS['Danger/Light'], 13, 600);

  // Alert cards inside panel
  const alertsData = [
    { code: 'AGT-003', name: 'Carlos Ramirez', priority: 'Critica', zone: 'San Isidro', time: 'hace 2 min', status: 'active', borderColor: COLORS['Danger/Default'] },
    { code: 'AGT-007', name: 'Maria Lopez', priority: 'Alta', zone: 'Miraflores', time: 'hace 5 min', status: 'active', borderColor: COLORS['Warning/Default'] },
    { code: 'AGT-012', name: 'Pedro Diaz', priority: 'Media', zone: 'Barranco', time: 'hace 8 min', status: 'acknowledged', borderColor: { r: 0.235, g: 0.502, b: 0.961 } },
  ];

  let alertY = 96;
  for (const a of alertsData) {
    const aCard = createFrame(alertPanel, `Alert/${a.code}`, 16, alertY, 540, 160, COLORS['Background/Default'], {
      cornerRadius: 8,
      stroke: a.borderColor,
      strokeWeight: 2,
    });

    // Header row
    await createText(aCard, `${a.code} - ${a.name}`, 16, 12, COLORS['Text/Primary'], 15, 600);
    // Priority badge
    const prColor = a.priority === 'Critica' ? COLORS['Danger/Default'] : a.priority === 'Alta' ? COLORS['Warning/Default'] : COLORS['Warning/Light'];
    const prBadge = createFrame(aCard, `Badge/${a.priority}`, 420, 10, 100, 24, prColor, { cornerRadius: 12 });
    prBadge.opacity = 0.2;
    await createText(prBadge, a.priority, 12, 4, prColor, 12, 600);

    // Details
    await createText(aCard, `Zona: ${a.zone}`, 16, 44, COLORS['Text/Secondary'], 13, 400);
    await createText(aCard, a.time, 16, 64, COLORS['Text/Subtle'], 12, 400);

    // Status indicator
    if (a.status === 'acknowledged') {
      await createText(aCard, 'En Proceso', 16, 88, { r: 0.235, g: 0.502, b: 0.961 }, 12, 500);
    }

    // Action buttons
    const btnY = a.status === 'acknowledged' ? 112 : 96;
    if (a.status === 'active') {
      const ab1 = createFrame(aCard, 'Btn/Reconocer', 16, btnY, 100, 32, COLORS['Primary/500'], { cornerRadius: 6 });
      await createText(ab1, 'Reconocer', 12, 8, COLORS['Text/Primary'], 12, 500);
      const ab2 = createFrame(aCard, 'Btn/Responder', 124, btnY, 100, 32, { r: 0.235, g: 0.502, b: 0.961 }, { cornerRadius: 6 });
      await createText(ab2, 'Responder', 12, 8, COLORS['Text/Primary'], 12, 500);
    }
    const ab3 = createFrame(aCard, 'Btn/Resolver', a.status === 'active' ? 232 : 16, btnY, 90, 32, COLORS['Success/Default'], { cornerRadius: 6 });
    await createText(ab3, 'Resolver', 14, 8, COLORS['Text/Primary'], 12, 500);

    alertY += 176;
  }

  return page;
}

// ============================================================
// PAGE 4: LOGIN
// ============================================================
async function createLoginPage() {
  const page = figma.createPage();
  page.name = 'Login';

  const viewport = createFrame(null, 'Login / 1920x1080', 0, 0, 1920, 1080, COLORS['Background/Default']);
  page.appendChild(viewport);

  // Center card
  const loginCard = createFrame(viewport, 'Login Card', 660, 240, 600, 600, COLORS['Background/Card'], {
    cornerRadius: 16,
    stroke: COLORS['Border/Default'],
    strokeWeight: 1,
  });

  // Logo
  const logo = createRect(loginCard, 252, 40, 96, 96, COLORS['Primary/500'], 16);
  logo.name = 'Shield Logo';
  await createText(loginCard, 'ADS', 270, 72, COLORS['Text/Primary'], 24, 700);

  await createText(loginCard, 'Aguilas del Sol', 190, 156, COLORS['Text/Primary'], 24, 700);
  await createText(loginCard, 'Centro de Monitoreo 24/7', 195, 190, COLORS['Text/Secondary'], 14, 400);

  // Email field
  await createText(loginCard, 'Correo electronico', 40, 240, COLORS['Text/Secondary'], 14, 500);
  const emailField = createFrame(loginCard, 'Input/Email', 40, 268, 520, 48, COLORS['Background/Default'], {
    cornerRadius: 8,
    stroke: COLORS['Border/Default'],
    strokeWeight: 1,
  });
  await createText(emailField, 'operador@aguilasdelsol.com', 16, 14, COLORS['Text/Subtle'], 14, 400);

  // Password field
  await createText(loginCard, 'Contrasena', 40, 336, COLORS['Text/Secondary'], 14, 500);
  const passField = createFrame(loginCard, 'Input/Password', 40, 364, 520, 48, COLORS['Background/Default'], {
    cornerRadius: 8,
    stroke: COLORS['Border/Default'],
    strokeWeight: 1,
  });
  await createText(passField, '••••••••', 16, 12, COLORS['Text/Subtle'], 16, 400);

  // Login button
  const loginBtn = createFrame(loginCard, 'Button/Login', 40, 440, 520, 48, COLORS['Primary/500'], { cornerRadius: 8 });
  await createText(loginBtn, 'Iniciar Sesion', 195, 14, COLORS['Text/Primary'], 16, 600);

  // Footer
  await createText(loginCard, 'Sistema de emergencias v1.0', 210, 520, COLORS['Text/Subtle'], 12, 400);
  await createText(loginCard, 'Soporte: soporte@aguilasdelsol.com', 190, 542, COLORS['Text/Subtle'], 12, 400);

  return page;
}

// ============================================================
// MAIN EXECUTION
// ============================================================
async function main() {
  figma.notify('Generando Design System Aguilas del Sol...', { timeout: 3000 });

  try {
    // Load Inter font variants
    await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
    await figma.loadFontAsync({ family: 'Inter', style: 'Medium' });
    await figma.loadFontAsync({ family: 'Inter', style: 'SemiBold' });
    await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });

    // Create color and text styles
    figma.notify('Creando estilos de color...', { timeout: 2000 });
    await createColorStyles();

    figma.notify('Creando estilos de texto...', { timeout: 2000 });
    await createTextStyles();

    // Create pages
    figma.notify('Generando pagina de Design Tokens...', { timeout: 2000 });
    await createDesignTokensPage();

    figma.notify('Generando pagina de Components...', { timeout: 2000 });
    await createComponentsPage();

    figma.notify('Generando Dashboard principal...', { timeout: 2000 });
    const dashPage = await createDashboardPage();

    figma.notify('Generando pagina de Login...', { timeout: 2000 });
    await createLoginPage();

    // Remove default empty page
    if (figma.root.children.length > 4) {
      const firstPage = figma.root.children[0];
      if (firstPage.children.length === 0) {
        firstPage.remove();
      }
    }

    // Navigate to dashboard
    figma.currentPage = dashPage;

    figma.notify('Design System Aguilas del Sol generado exitosamente!', {
      timeout: 5000,
    });
  } catch (error) {
    figma.notify(`Error: ${error.message}`, { error: true, timeout: 5000 });
    console.error(error);
  }

  figma.closePlugin();
}

main();
