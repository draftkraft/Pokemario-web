(() => {
"use strict";
// Shared by the static website and the standalone game. No gameplay/save keys are translated.
(() => {
  if (globalThis.PokeI18n) return;
  const languages = { en: 'English', es: 'Español', de: 'Deutsch', ja: '日本語', fr: 'Français', pt: 'Português', zh: '中文（简体）', it: 'Italiano' };
  const storageKey = 'pokemario.language';
  const normalize = value => typeof value === 'string' ? value.toLowerCase().split(/[-_]/)[0] : '';
  const supported = value => Object.hasOwn(languages, normalize(value)) ? normalize(value) : '';
  const browserLanguage = preferences => (preferences || []).map(supported).find(Boolean) || 'en';
  let saved = '';
  try { saved = supported(localStorage.getItem(storageKey)); } catch (_) { /* private/file browsing */ }
  const pageLanguage = typeof document !== 'undefined' ? document.documentElement?.dataset?.locale : '';
  let language = supported(pageLanguage) || saved || browserLanguage(typeof navigator !== 'undefined' ? navigator.languages || [navigator.language] : []);
  const listeners = new Set(), exact = new Map(), patterns = [], cache = new Map();
  let fragments;
  const escape = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  function add(rows) {
    for (const [source, en, es, fr, ja, de = source, pt, zh, it] of rows) {
      const values = { de, en, es, fr, ja, pt, zh, it };
      if (Object.values(values).some(value => typeof value !== 'string')) throw new Error('Incomplete translation: ' + source);
      if (/\{\d+!?\}/.test(source)) {
        const captures = [...source.matchAll(/\{(\d+)(!)?\}/g)];
        const parts = source.split(/\{\d+!?\}/);
        patterns.push({ re: new RegExp('^' + parts.map(escape).join('([\\s\\S]+?)') + '$'), captures, values, weight: parts.join('').length });
      } else exact.set(source, values);
    }
    patterns.sort((a, b) => b.weight - a.weight);
    fragments = null; cache.clear();
  }
  function translate(value, depth = 0) {
    const source = String(value ?? '');
    const row = exact.get(source);
    if (row) return row[language];
    if (language === 'de' || depth > 5 || !source) return source;
    if (cache.has(source)) return cache.get(source);
    let result;
    for (const pattern of patterns) {
      const match = source.match(pattern.re);
      if (!match) continue;
      const values = {};
      pattern.captures.forEach((capture, i) => { values[capture[1]] = capture[2] ? match[i + 1] : translate(match[i + 1], depth + 1); });
      result = pattern.values[language].replace(/\{(\d+)!?\}/g, (_, i) => values[i]);
      break;
    }
    // Composed labels (bullets, uppercase species, artwork captions) stay in source
    // form in game state, and are translated only when laid out or drawn.
    if (result === undefined) {
      if (!fragments) fragments = new RegExp('(?<![\\p{L}\\p{N}])(?:' + [...exact.keys()].filter(Boolean).sort((a, b) => b.length - a.length).map(escape).join('|') + ')(?![\\p{L}\\p{N}])', 'gu');
      result = source.replace(fragments, key => exact.get(key)[language]);
    }
    if (cache.size > 1500) cache.clear();
    cache.set(source, result);
    return result;
  }
  function setLanguage(value, persist = true) {
    const next = supported(value);
    if (!next) return;
    language = next; cache.clear();
    if (persist) try { localStorage.setItem(storageKey, language); } catch (_) { /* session still works */ }
    if (typeof document !== 'undefined' && document.documentElement) document.documentElement.lang = language;
    listeners.forEach(listener => listener(language));
  }
  globalThis.PokeI18n = { languages, normalize, browserLanguage, add, t: translate, setLanguage,
    get language() { return language; }, onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); } };
})();

globalThis.PokeI18n.add([["web.title","Poké-Mario – Free Pokémon Game Online","Poké-Mario – Juego Pokémon gratis online","Poké-Mario – Jeu Pokémon gratuit en ligne","Poké-Mario｜無料ポケモンゲームをオンラインでプレイ","Poké-Mario – Kostenloses Pokémon-Spiel online","Poké-Mario – Jogo Pokémon grátis online","Poké-Mario – 免费在线宝可梦游戏","Poké-Mario – Gioco Pokémon gratis online"],["web.description","Play Poké-Mario, a free Pokémon game online. Explore platforming levels, catch wild Pokémon and fight turn-based battles in your browser—no download or account required.","Juega a Poké-Mario, un juego Pokémon gratis online. Explora niveles de plataformas, captura Pokémon salvajes y lucha por turnos en tu navegador, sin descargas ni cuenta.","Joue à Poké-Mario, un jeu Pokémon gratuit en ligne. Explore des niveaux de plateforme, capture des Pokémon sauvages et combats au tour par tour dans ton navigateur, sans téléchargement ni compte.","Poké-Marioは無料で遊べるポケモンゲームです。ステージを冒険し、野生のポケモンを捕まえてターン制バトルに挑戦。ダウンロードやアカウント登録なしでブラウザから遊べます。","Poké-Mario kostenlos online spielen: ein Pokémon-Spiel im Browser mit Jump’n’Run-Leveln, Pokémon zum Fangen und rundenbasierten Kämpfen. Ohne Download oder Konto.","Jogue Poké-Mario, um jogo Pokémon grátis online. Explore fases de plataforma, capture Pokémon selvagens e lute por turnos no navegador, sem download nem conta.","免费在线玩Poké-Mario：探索平台跳跃关卡，捕捉野生宝可梦，体验回合制战斗。浏览器即开即玩，无需下载或注册。","Gioca a Poké-Mario, un gioco Pokémon gratis online. Esplora livelli platform, cattura Pokémon selvatici e lotta a turni nel browser, senza download né account."],["web.home","Poké-Mario home","Inicio de Poké-Mario","Accueil Poké-Mario","Poké-Mario ホーム","Poké-Mario Startseite","Página inicial de Poké-Mario","Poké-Mario首页","Pagina iniziale di Poké-Mario"],["web.nav","About &amp; controls","Información y controles","Infos et commandes","遊び方と操作","Spielinfos &amp; Steuerung","Sobre e controles","介绍与操作","Informazioni e comandi"],["web.eyebrow","Poké-Mario · Free browser platformer","Poké-Mario · Plataformas gratis online","Poké-Mario · Plateforme gratuite sur navigateur","Poké-Mario · 無料ブラウザアクション","Poké-Mario · Kostenloses Browser-Jump’n’Run","Poké-Mario · Plataforma grátis no navegador","Poké-Mario · 免费浏览器平台游戏","Poké-Mario · Platform gratuito nel browser"],["web.heading","Play a free Pokémon \u003cspan>game online\u003c/span>","Juega gratis a un \u003cspan>juego Pokémon online\u003c/span>","Joue à un \u003cspan>jeu Pokémon gratuit en ligne\u003c/span>","無料のポケモンゲームを\u003cspan>オンラインでプレイ\u003c/span>","Pokémon \u003cspan>kostenlos online spielen\u003c/span>","Jogue Pokémon \u003cspan>grátis online\u003c/span>","免费在线玩\u003cspan>宝可梦游戏\u003c/span>","Gioca a Pokémon \u003cspan>gratis online\u003c/span>"],["web.intro","Explore handcrafted pixel levels, meet wild Pokémon and catch them in turn-based battles. Poké-Mario is a free Pokémon browser game that starts instantly, with no download or online account.","Explora niveles de píxeles diseñados a mano, encuentra Pokémon salvajes y captúralos en combates por turnos. Poké-Mario es un juego Pokémon gratis para navegador, sin descargas ni cuenta online.","Explore des niveaux en pixel art, rencontre des Pokémon sauvages et capture-les après des combats au tour par tour. Poké-Mario est un jeu Pokémon gratuit sur navigateur, sans téléchargement ni compte.","手作りのピクセルステージを冒険し、野生のポケモンと出会い、ターン制バトルで捕まえよう。Poké-Marioはブラウザですぐに遊べる無料ゲーム。ダウンロードやアカウント登録は不要です。","Entdecke handgebaute Pixel-Level, triff wilde Pokémon und fang sie nach rundenbasierten Kämpfen. Poké-Mario ist ein kostenloses Pokémon-Spiel im Browser – ohne Download und ohne Konto.","Explore fases de pixel art feitas à mão, encontre Pokémon selvagens e capture-os em batalhas por turnos. Poké-Mario é um jogo Pokémon grátis que começa direto no navegador, sem download nem conta online.","探索精心设计的像素关卡，遇见野生宝可梦，并在回合制战斗中捕捉它们。Poké-Mario是一款免费的宝可梦浏览器游戏，即开即玩，无需下载或注册。","Esplora livelli in pixel art creati a mano, incontra Pokémon selvatici e catturali nelle lotte a turni. Poké-Mario è un gioco Pokémon gratuito che parte subito nel browser, senza download né account online."],["web.play","\u003cspan aria-hidden=\"true\">▶\u003c/span> Play free now","\u003cspan aria-hidden=\"true\">▶\u003c/span> Jugar gratis ahora","\u003cspan aria-hidden=\"true\">▶\u003c/span> Jouer gratuitement","\u003cspan aria-hidden=\"true\">▶\u003c/span> 今すぐ無料で遊ぶ","\u003cspan aria-hidden=\"true\">▶\u003c/span> Jetzt kostenlos spielen","\u003cspan aria-hidden=\"true\">▶\u003c/span> Jogar grátis agora","\u003cspan aria-hidden=\"true\">▶\u003c/span> 立即免费游玩","\u003cspan aria-hidden=\"true\">▶\u003c/span> Gioca gratis ora"],["web.note","Two difficulties · Saved in your browser","Dos dificultades · Guardado en el navegador","Deux difficultés · Sauvegarde dans le navigateur","難易度は2種類 · ブラウザに保存","Zwei Schwierigkeitsgrade · Spielstand im Browser","Duas dificuldades · Progresso salvo no navegador","两种难度 · 进度保存在浏览器中","Due difficoltà · Salvataggio nel browser"],["web.features","Game features","Características del juego","Caractéristiques du jeu","ゲームの特徴","Spielmerkmale","Recursos do jogo","游戏特色","Caratteristiche del gioco"],["web.levels","Varied levels","Niveles variados","Des niveaux variés","多彩なステージ","Abwechslungsreiche Level","Fases variadas","多样关卡","Livelli vari"],["web.catch","Catch Pokémon","Captura Pokémon","Capture des Pokémon","ポケモンを捕まえよう","Pokémon fangen","Capture Pokémon","捕捉宝可梦","Cattura Pokémon"],["web.pixel","Retro pixel art","Píxeles retro","Pixel art rétro","レトロなドット絵","Retro-Pixelgrafik","Pixel art retrô","复古像素画风","Pixel art retrò"],["web.download","No download","Sin descargas","Sans téléchargement","ダウンロード不要","Kein Download","Sem download","无需下载","Senza download"],["web.noscript","Enable JavaScript to play. You can still read the game information without it.","Activa JavaScript para jugar. La información del juego sigue disponible sin él.","Active JavaScript pour jouer. Les informations restent lisibles sans JavaScript.","プレイにはJavaScriptを有効にしてください。ゲームの説明は無効でも読めます。","Zum Spielen JavaScript aktivieren. Die Spielinfos auf dieser Seite bleiben auch ohne JavaScript verfügbar.","Ative o JavaScript para jogar. As informações do jogo continuam disponíveis sem ele.","启用JavaScript即可游玩。即使未启用，仍可阅读游戏介绍。","Attiva JavaScript per giocare. Le informazioni sul gioco restano leggibili anche senza."],["web.world","POKÉ-MARIO · WORLD 1-7","POKÉ-MARIO · MUNDO 1-7","POKÉ-MARIO · MONDE 1-7","POKÉ-MARIO · ワールド 1-7","POKÉ-MARIO · WELT 1-7","POKÉ-MARIO · MUNDO 1-7","POKÉ-MARIO · 世界1-7","POKÉ-MARIO · MONDO 1-7"],["web.preview","GAMEPLAY PREVIEW","VISTA PREVIA","APERÇU DU JEU","ゲームプレビュー","GAMEPLAY-VORSCHAU","PRÉVIA DO JOGO","游戏预览","ANTEPRIMA DEL GIOCO"],["web.sceneTitle","Animated preview of level 1-7, Cucumber Castle","Vista animada del nivel 1-7, Castillo Pepino","Aperçu animé du niveau 1-7, Château Concombre","ステージ1-7「キュウリ城」のアニメーションプレビュー","Animierte Gameplay-Vorschau aus Level 1-7, Gurkenburg","Prévia animada da fase 1-7, Castelo do Pepino","第1-7关黄瓜城堡的动画预览","Anteprima animata del livello 1-7, Castello dei cetrioli"],["web.sceneDesc","Pikachu jumps between floating platforms in a dark pixel castle. A cucumber flies past a pumpkin enemy.","Pikachu salta entre plataformas flotantes de un castillo de píxeles. Un pepino pasa volando junto a una calabaza enemiga.","Pikachu saute entre des plateformes flottantes dans un château en pixels. Un concombre vole devant une citrouille ennemie.","暗いドット絵の城で、ピカチュウが浮かぶ足場をジャンプ。キュウリが敵のカボチャのそばを飛んでいきます。","Ein Pikachu springt zwischen schwebenden Plattformen durch eine dunkle Pixelburg. Eine Gurke fliegt an einem Kürbisgegner vorbei.","Pikachu salta entre plataformas flutuantes em um castelo escuro de pixel art. Um pepino passa voando por uma abóbora inimiga.","皮卡丘在黑暗的像素城堡中跳过漂浮平台，一根黄瓜从南瓜敌人旁飞过。","Pikachu salta tra piattaforme sospese in un castello buio in pixel art. Un cetriolo vola accanto a una zucca nemica."],["web.score","❤❤❤  SCORE  07350","❤❤❤  PUNTOS  07350","❤❤❤  SCORE  07350","❤❤❤  スコア  07350","❤❤❤  PUNKTE  07350","❤❤❤  PONTOS  07350","❤❤❤  得分  07350","❤❤❤  PUNTI  07350"],["web.castle","Level 1-7 · Cucumber Castle","Nivel 1-7 · Castillo Pepino","Niveau 1-7 · Château Concombre","ステージ1-7 · キュウリ城","Level 1-7 · Gurkenburg","Fase 1-7 · Castelo do Pepino","第1-7关 · 黄瓜城堡","Livello 1-7 · Castello dei cetrioli"],["web.actions","Jump · collect · battle","Salta · recoge · lucha","Saute · collecte · combats","ジャンプ · 収集 · バトル","Springen · sammeln · kämpfen","Pule · colete · lute","跳跃 · 收集 · 战斗","Salta · raccogli · lotta"],["web.aboutEyebrow","Your next adventure","Tu próxima aventura","Ton aventure t'attend","こんな冒険が待っている","Das erwartet dich","Sua próxima aventura","你的下一场冒险","La tua prossima avventura"],["web.aboutTitle","A Pokémon browser game with platforming levels","Un juego Pokémon de plataformas en el navegador","Un jeu Pokémon sur navigateur avec des niveaux de plateforme","ブラウザで遊ぶポケモン風アクション","Ein Pokémon-Browsergame mit Jump’n’Run-Levels","Um jogo Pokémon de plataforma no navegador","融合平台跳跃的宝可梦浏览器游戏","Un gioco Pokémon nel browser con livelli platform"],["web.about","Poké-Mario combines classic platforming with Pokémon collecting. Explore varied levels, dodge obstacles and encounter wild Pokémon. Weaken them in turn-based battles, then try catching them with a Poké Ball. Choose one of two difficulties and continue later using a profile saved in your browser.","Poké-Mario combina las plataformas clásicas con la colección de Pokémon. Explora niveles variados, esquiva obstáculos y encuentra Pokémon salvajes. Debilítalos en combates por turnos e intenta capturarlos con una Poké Ball. Elige una de las dos dificultades y continúa después con tu perfil guardado en el navegador.","Poké-Mario mêle plateforme classique et collection de Pokémon. Explore des niveaux variés, évite les obstacles et rencontre des Pokémon sauvages. Affaiblis-les au tour par tour, puis essaie de les capturer avec une Poké Ball. Choisis une difficulté et reprends plus tard avec ton profil sauvegardé dans le navigateur.","Poké-Marioは、昔ながらのジャンプアクションとポケモン集めを組み合わせたゲームです。さまざまなステージで障害物をかわし、野生のポケモンと出会おう。ターン制バトルで弱らせてからボールで捕獲。難易度は2種類で、ブラウザに保存したプロフィールから後で続きを遊べます。","Poké-Mario verbindet klassisches Plattformspiel mit Pokémon-Sammeln: Erkunde abwechslungsreiche Level, weiche Hindernissen aus und begegne wilden Pokémon. Schwäche sie im rundenbasierten Kampf und versuche, sie mit einem Pokéball zu fangen. Wähle zwischen zwei Schwierigkeitsgraden und setze deine Reise später mit dem lokal gespeicherten Spielstand fort.","Poké-Mario combina plataforma clássica com coleção de Pokémon. Explore fases variadas, desvie de obstáculos e encontre Pokémon selvagens. Enfraqueça-os em batalhas por turnos e tente capturá-los com uma Poké Bola. Escolha uma de duas dificuldades e continue depois com seu perfil salvo no navegador.","Poké-Mario将经典平台跳跃与宝可梦收集合二为一。探索多样关卡，躲避障碍，与野生宝可梦相遇。在回合制战斗中削弱它们，再用精灵球尝试捕捉。选择两种难度之一，之后可通过保存在浏览器中的档案继续冒险。","Poké-Mario unisce il platform classico alla raccolta di Pokémon. Esplora livelli vari, evita gli ostacoli e incontra Pokémon selvatici. Indeboliscili nelle lotte a turni, poi prova a catturarli con una Poké Ball. Scegli tra due difficoltà e riprendi più tardi con il profilo salvato nel browser."],["web.feature1Title","Varied levels","Niveles variados","Des niveaux variés","多彩なステージ","Abwechslungsreiche Level","Fases variadas","多样关卡","Livelli vari"],["web.feature1","From meadows and clouds to the jungle, Cucumber Castle and the art museum, each area has its own obstacles and secrets.","De praderas y nubes a la jungla, el Castillo Pepino y el museo de arte: cada zona tiene sus obstáculos y secretos.","De la prairie aux nuages, de la jungle au Château Concombre et au musée d'art, chaque zone a ses obstacles et ses secrets.","草原、雲、ジャングル、キュウリ城、美術館。それぞれのエリアに固有の障害物と秘密があります。","Von der Wiese über Wolken, Dschungel und Gurkenburg bis zum Kunstmuseum – jedes Gebiet bringt eigene Hindernisse und Geheimnisse.","Dos prados e nuvens à selva, ao Castelo do Pepino e ao museu de arte, cada área tem seus obstáculos e segredos.","从草地和云端到丛林、黄瓜城堡和美术馆，每个区域都有独特的障碍与秘密。","Dai prati e dalle nuvole alla giungla, al Castello dei cetrioli e al museo d'arte, ogni area ha i suoi ostacoli e segreti."],["web.feature2Title","Catch and build your team","Captura y forma tu equipo","Capture et forme ton équipe","捕まえてチームを作ろう","Fangen statt nur vorbeispringen","Capture e monte sua equipe","捕捉并组建队伍","Cattura e crea la tua squadra"],["web.feature2","Wild Pokémon trigger turn-based battles. Pick your team, choose effective moves and throw Poké Balls.","Los Pokémon salvajes inician combates por turnos. Elige tu equipo, usa ataques eficaces y lanza Poké Balls.","Les Pokémon sauvages lancent des combats au tour par tour. Choisis ton équipe, les bonnes attaques et lance des Poké Balls.","野生のポケモンに出会うとターン制バトル。チームを選び、相性のよい技を使って、ボールを投げよう。","Wilde Pokémon starten rundenbasierte Kämpfe. Wähle dein Team, setze passende Attacken ein und wirf Pokébälle.","Pokémon selvagens iniciam batalhas por turnos. Escolha sua equipe, use ataques eficazes e lance Poké Bolas.","遇见野生宝可梦即可开始回合制战斗。选择队伍，使用有效招式，扔出精灵球。","I Pokémon selvatici avviano lotte a turni. Scegli la squadra, usa mosse efficaci e lancia Poké Ball."],["web.feature3Title","Play instantly in your browser","Juega al instante en tu navegador","Joue tout de suite dans ton navigateur","ブラウザですぐプレイ","Sofort im Browser spielen","Jogue na hora no navegador","浏览器即开即玩","Gioca subito nel browser"],["web.feature3","No installer or online account needed. Progress is saved locally in your browser, with two difficulty settings to choose from.","Sin instalación ni cuenta online. Tu progreso se guarda en tu navegador y puedes elegir entre dos dificultades.","Ni installation ni compte en ligne. Ta progression est sauvegardée dans ton navigateur ; deux difficultés sont proposées.","インストールもオンラインアカウントも不要。進行状況はブラウザに保存され、難易度も2種類から選べます。","Kein Installer und kein Konto nötig. Die Fortschritte werden lokal in deinem Browser gespeichert; zwei Schwierigkeitsgrade stehen bereit.","Sem instalação nem conta online. O progresso fica salvo no navegador, com duas dificuldades à sua escolha.","无需安装或注册账号。进度保存在浏览器中，并有两种难度可供选择。","Non servono installazione né account online. I progressi si salvano nel browser e puoi scegliere tra due difficoltà."],["web.controlsEyebrow","Quick start","Guía rápida","Pour bien démarrer","かんたんガイド","Schnell erklärt","Primeiros passos","快速入门","Per iniziare"],["web.controlsTitle","Controls and frequently asked questions","Controles y preguntas frecuentes","Commandes et questions fréquentes","操作方法とよくある質問","Steuerung und häufige Fragen","Controles e perguntas frequentes","操作与常见问题","Comandi e domande frequenti"],["web.q1","How do I play Poké-Mario?","¿Cómo se juega a Poké-Mario?","Comment jouer à Poké-Mario ?","Poké-Marioの遊び方は？","Wie kann ich Poké-Mario spielen?","Como jogar Poké-Mario?","如何游玩Poké-Mario？","Come si gioca a Poké-Mario?"],["web.a1","Click “Play free now” to load the game. Use a keyboard: ← and → to move, Space or ↑ to jump, and X to throw a Poké Ball and start a battle.","Pulsa «Jugar gratis ahora». Usa el teclado: ← y → para moverte, Espacio o ↑ para saltar y X para lanzar una Poké Ball e iniciar un combate.","Clique sur « Jouer gratuitement ». Au clavier : ← et → pour bouger, Espace ou ↑ pour sauter et X pour lancer une Poké Ball et combattre.","「今すぐ無料で遊ぶ」を押してゲームを読み込みます。キーボードの← →で移動、Spaceまたは↑でジャンプ、Xでボールを投げてバトルを開始します。","Klicke auf „Jetzt kostenlos spielen“. Das Spiel lädt im Browser. Nutze ← und → zum Laufen, Leertaste oder ↑ zum Springen und X, um einen Pokéball zu werfen und einen Kampf zu beginnen.","Clique em “Jogar grátis agora” para carregar o jogo. Use o teclado: ← e → para mover, Espaço ou ↑ para pular e X para lançar uma Poké Bola e iniciar uma batalha.","点击“立即免费游玩”加载游戏。使用键盘：← →移动，空格或↑跳跃，X扔出精灵球并开始战斗。","Clicca su “Gioca gratis ora” per caricare il gioco. Usa la tastiera: ← e → per muoverti, Spazio o ↑ per saltare e X per lanciare una Poké Ball e iniziare una lotta."],["web.q2","Can I play Pokémon games online for free?","¿Puedo jugar a juegos Pokémon gratis online?","Peut-on jouer gratuitement à des jeux Pokémon en ligne ?","無料のポケモンゲームをオンラインで遊べますか？","Kann ich Pokémon-Spiele kostenlos online spielen?","Posso jogar Pokémon online de graça?","可以免费在线玩宝可梦游戏吗？","Posso giocare ai giochi Pokémon online gratis?"],["web.a2","Yes. Poké-Mario is a free Pokémon game you can play online in your browser. Jump through varied levels, catch wild Pokémon and fight turn-based battles—no download or account needed.","Sí. Poké-Mario es un juego Pokémon gratis para jugar online en el navegador. Salta por niveles variados, captura Pokémon salvajes y lucha por turnos, sin descargas ni cuenta.","Oui. Poké-Mario est un jeu Pokémon gratuit jouable en ligne dans ton navigateur. Parcours des niveaux variés, capture des Pokémon sauvages et combats au tour par tour, sans téléchargement ni compte.","はい。Poké-Marioはブラウザで遊べる無料のポケモンゲームです。さまざまなステージを進み、野生のポケモンを捕まえてターン制バトルに挑戦できます。ダウンロードやアカウント登録は不要です。","Ja. Poké-Mario ist ein kostenloses Pokémon-Spiel im Browser. Springe durch abwechslungsreiche Level, fange wilde Pokémon und bestreite rundenbasierte Kämpfe – ohne Download oder Konto.","Sim. Poké-Mario é um jogo Pokémon grátis para jogar no navegador. Pule por fases variadas, capture Pokémon selvagens e lute por turnos, sem download nem conta.","可以。Poké-Mario是一款免费的宝可梦浏览器游戏。跳跃闯关、捕捉野生宝可梦、体验回合制战斗，无需下载或注册。","Sì. Poké-Mario è un gioco Pokémon gratuito da giocare online nel browser. Salta tra livelli vari, cattura Pokémon selvatici e lotta a turni, senza download né account."],["web.q3","How do I get through Cucumber Castle (Level 1-7)?","¿Cómo superar el Castillo Pepino (nivel 1-7)?","Comment traverser le Château Concombre (niveau 1-7) ?","ステージ1-7「キュウリ城」の進み方は？","Wie komme ich durch die Gurkenburg (Level 1-7)?","Como passar pelo Castelo do Pepino (fase 1-7)?","如何通过黄瓜城堡（第1-7关）？","Come supero il Castello dei cetrioli (livello 1-7)?"],["web.a3","Cucumber Castle is level seven. Jump across the dark castle platforms, collect cucumbers and press G to throw them at pumpkins blocking your way.","El Castillo Pepino es el nivel siete. Salta por las plataformas del castillo oscuro, recoge pepinos y pulsa G para lanzarlos contra las calabazas que bloquean el camino.","Le Château Concombre est le septième niveau. Saute sur les plateformes du château sombre, ramasse des concombres et appuie sur G pour les lancer sur les citrouilles qui bloquent le passage.","キュウリ城は7番目のステージです。暗い城の足場をジャンプで進み、キュウリを集めてGで投げ、道をふさぐカボチャをどかしましょう。","Gurkenburg ist das siebte Level. Springe über die Plattformen der dunklen Burg, sammle Gurken und wirf sie mit G, um Kürbisse aus dem Weg zu räumen.","O Castelo do Pepino é a sétima fase. Pule pelas plataformas do castelo escuro, colete pepinos e aperte G para lançá-los nas abóboras que bloqueiam o caminho.","黄瓜城堡是第七关。在黑暗城堡的平台间跳跃，收集黄瓜，按G扔向挡路的南瓜。","Il Castello dei cetrioli è il settimo livello. Salta sulle piattaforme del castello buio, raccogli cetrioli e premi G per lanciarli alle zucche che ti bloccano."],["web.q5","How do I catch wild Pokémon in Poké-Mario?","¿Cómo capturo Pokémon salvajes en Poké-Mario?","Comment capturer des Pokémon sauvages dans Poké-Mario ?","Poké-Marioで野生のポケモンを捕まえるには？","Wie fange ich wilde Pokémon in Poké-Mario?","Como capturar Pokémon selvagens em Poké-Mario?","如何在Poké-Mario中捕捉野生宝可梦？","Come catturo i Pokémon selvatici in Poké-Mario?"],["web.a5","Meet a wild Pokémon to start a turn-based battle. Weaken it with moves, then choose a Poké Ball from the battle menu to try to catch it.","Encuentra un Pokémon salvaje para iniciar un combate por turnos. Debilítalo con ataques y elige una Poké Ball en el menú de combate para intentar capturarlo.","Rencontre un Pokémon sauvage pour lancer un combat au tour par tour. Affaiblis-le avec des attaques, puis choisis une Poké Ball dans le menu de combat pour tenter de le capturer.","野生のポケモンに出会うとターン制バトルが始まります。技で弱らせ、バトルメニューからボールを選んで捕獲に挑戦しましょう。","Begegne einem wilden Pokémon, um einen rundenbasierten Kampf zu starten. Schwäche es mit Attacken und wähle im Kampfmenü einen Pokéball, um einen Fangversuch zu starten.","Encontre um Pokémon selvagem para iniciar uma batalha por turnos. Enfraqueça-o com ataques e escolha uma Poké Bola no menu da batalha para tentar capturá-lo.","遇见野生宝可梦即可开始回合制战斗。用招式削弱它，再从战斗菜单选择精灵球，尝试捕捉。","Incontra un Pokémon selvatico per iniziare una lotta a turni. Indeboliscilo con le mosse, poi scegli una Poké Ball dal menu per provare a catturarlo."],["web.q6","Which Pokémon game combines platforming with turn-based battles?","¿Qué juego Pokémon combina plataformas y combates por turnos?","Quel jeu Pokémon associe plateforme et combats au tour par tour ?","ジャンプアクションとターン制バトルを組み合わせたポケモンゲームは？","Welche Pokémon-Spielart verbindet Jump’n’Run und rundenbasierte Kämpfe?","Qual jogo Pokémon combina plataforma com batalhas por turnos?","哪款宝可梦游戏结合了平台跳跃和回合制战斗？","Quale gioco Pokémon unisce platform e lotte a turni?"],["web.a6","Poké-Mario combines classic platforming with catching Pokémon and turn-based battles. This free fan project runs right in your browser.","Poké-Mario combina plataformas clásicas con capturas de Pokémon y combates por turnos. Este proyecto gratuito de fans funciona directamente en el navegador.","Poké-Mario associe plateforme classique, capture de Pokémon et combats au tour par tour. Ce projet gratuit de fans se joue directement dans le navigateur.","Poké-Marioは昔ながらのプラットフォームアクションに、ポケモン捕獲とターン制バトルを組み合わせた無料のファン作品です。ブラウザですぐに遊べます。","Poké-Mario kombiniert ein klassisches Plattformspiel mit Pokémon-Fang und rundenbasierten Kämpfen. Das kostenlose Fanprojekt läuft direkt im Browser.","Poké-Mario combina plataforma clássica com captura de Pokémon e batalhas por turnos. Este projeto gratuito de fãs roda direto no navegador.","Poké-Mario结合了经典平台跳跃、宝可梦捕捉和回合制战斗。这款免费的同人游戏可直接在浏览器中游玩。","Poké-Mario unisce platform classico, cattura di Pokémon e lotte a turni. Questo progetto gratuito dei fan funziona direttamente nel browser."],["web.q4","Is my progress saved?","¿Se guarda mi progreso?","Ma progression est-elle sauvegardée ?","進行状況は保存されますか？","Wird mein Fortschritt gespeichert?","Meu progresso é salvo?","游戏进度会保存吗？","I miei progressi vengono salvati?"],["web.a4","Your profile is stored locally in your browser. It does not sync between devices. Clearing browser data also removes local saves.","Tu perfil se guarda localmente en el navegador. No se sincroniza entre dispositivos. Si borras los datos del navegador, se borran las partidas.","Ton profil reste dans ton navigateur, sans synchronisation entre appareils. Effacer les données du navigateur supprime aussi les sauvegardes.","プロフィールはブラウザ内に保存されます。別の端末とは同期されません。ブラウザのデータを消すとセーブデータも削除されます。","Der Spielstand wird lokal in deinem Browser abgelegt. Er wird nicht zwischen verschiedenen Geräten synchronisiert.","Seu perfil fica salvo no navegador. Ele não sincroniza entre dispositivos. Apagar os dados do navegador também remove os arquivos locais.","你的档案保存在当前浏览器中，不会在设备间同步。清除浏览器数据也会删除本地存档。","Il tuo profilo si salva nel browser e non si sincronizza tra dispositivi. Cancellare i dati del browser elimina anche i salvataggi locali."],["web.fanTitle","An unofficial fan project","Un proyecto de fans no oficial","Un projet de fans non officiel","非公式のファン作品","Ein inoffizielles Fanprojekt","Um projeto não oficial de fãs","非官方同人项目","Un progetto non ufficiale dei fan"],["web.fan","Poké-Mario is a free, non-commercial fan project, unaffiliated with Nintendo, Game Freak or The Pokémon Company. Pokémon and related names are trademarks of their respective owners.","Poké-Mario es un proyecto gratuito y no comercial de fans, sin relación con Nintendo, Game Freak ni The Pokémon Company. Pokémon y sus nombres relacionados son marcas de sus respectivos propietarios.","Poké-Mario est un projet de fans gratuit et non commercial, sans lien avec Nintendo, Game Freak ou The Pokémon Company. Pokémon et les noms associés sont des marques de leurs propriétaires respectifs.","Poké-Marioは無料・非営利のファン作品で、任天堂、ゲームフリーク、株式会社ポケモンとは関係ありません。ポケモンおよび関連名称は各権利者の商標です。","Poké-Mario ist ein kostenloses, nicht-kommerzielles Fanprojekt und steht in keiner Verbindung zu Nintendo, Game Freak oder The Pokémon Company. Pokémon und zugehörige Namen sind Marken ihrer jeweiligen Rechteinhaber.","Poké-Mario é um projeto gratuito e não comercial de fãs, sem vínculo com Nintendo, Game Freak ou The Pokémon Company. Pokémon e nomes relacionados são marcas de seus respectivos proprietários.","Poké-Mario是免费、非商业的同人项目，与任天堂、Game Freak及The Pokémon Company无关联。Pokémon及相关名称均为各自所有者的商标。","Poké-Mario è un progetto gratuito e non commerciale dei fan, senza affiliazione con Nintendo, Game Freak o The Pokémon Company. Pokémon e i nomi correlati sono marchi dei rispettivi proprietari."],["web.footer","Poké-Mario · Free fan-made platformer","Poké-Mario · Plataformas gratuito de fans","Poké-Mario · Plateforme gratuite de fans","Poké-Mario · 無料のファン制作アクション","Poké-Mario · Kostenloses Jump’n’Run-Fanprojekt","Poké-Mario · Jogo de plataforma gratuito de fãs","Poké-Mario · 免费同人平台游戏","Poké-Mario · Platform gratuito dei fan"],["ui.language","Language","Idioma","Langue","言語","Sprache","Idioma","语言","Lingua"],["ui.auto","Browser language","Idioma del navegador","Langue du navigateur","ブラウザの言語","Browsersprache","Idioma do navegador","浏览器语言","Lingua del browser"],["ui.loading","Loading game…","Cargando juego…","Chargement du jeu…","ゲームを読み込み中…","Spiel wird geladen …","Carregando jogo…","正在加载游戏……","Caricamento del gioco…"],["ui.error","The game could not load. Reload the page and try again.","No se pudo cargar el juego. Recarga la página e inténtalo de nuevo.","Le jeu n'a pas pu charger. Recharge la page et réessaie.","ゲームを読み込めませんでした。ページを再読み込みしてください。","Das Spiel konnte nicht geladen werden. Bitte Seite neu laden und erneut versuchen.","Não foi possível carregar o jogo. Recarregue a página e tente novamente.","无法加载游戏。请刷新页面后重试。","Impossibile caricare il gioco. Ricarica la pagina e riprova."],["ui.game","Poké-Mario game","Juego Poké-Mario","Jeu Poké-Mario","Poké-Mario ゲーム","Poké-Mario-Spiel","Jogo Poké-Mario","Poké-Mario游戏","Gioco Poké-Mario"],["ui.hint","← → move · Space / ↑ jump · X Poké Ball · 1–6 team · ↓ door/pipe · G cucumber · B hut (5 sticks) · L level · R menu. Battle: arrows to choose, Space/Enter to confirm, Esc to go back.","← → moverse · Espacio / ↑ saltar · X Poké Ball · 1–6 equipo · ↓ puerta/tubería · G pepino · B cabaña (5 palos) · L nivel · R menú. Combate: flechas elegir, Espacio/Enter confirmar, Esc volver.","← → bouger · Espace / ↑ sauter · X Poké Ball · 1–6 équipe · ↓ porte/tuyau · G concombre · B cabane (5 bâtons) · L niveau · R menu. Combat : flèches pour choisir, Espace/Entrée pour confirmer, Échap pour revenir.","← → 移動 · Space / ↑ ジャンプ · X ボール · 1–6 チーム · ↓ 扉/土管 · G キュウリ · B 小屋（枝5本）· L ステージ · R メニュー。バトル：矢印で選択、Space/Enterで決定、Escで戻る。","← → bewegen · Space / ↑ springen · X Pokéball · 1–6 Team · ↓ Tür/Rohr · G Gurke · B Stockhaus (5 Stöcke) · L Level · R Auswahl. Kampf: Pfeile Menü, Space/Enter bestätigen, Esc zurück.","← → mover · Espaço / ↑ pular · X Poké Bola · 1–6 equipe · ↓ porta/cano · G pepino · B cabana (5 gravetos) · L fase · R menu. Batalha: setas para escolher, Espaço/Enter para confirmar, Esc para voltar.","← →移动 · 空格/↑跳跃 · X精灵球 · 1–6队伍 · ↓门/水管 · G黄瓜 · B小屋（5根树枝）· L关卡 · R菜单。战斗：方向键选择，空格/Enter确认，Esc返回。","← → muovi · Spazio / ↑ salta · X Poké Ball · 1–6 squadra · ↓ porta/tubo · G cetriolo · B capanna (5 bastoni) · L livello · R menu. Lotta: frecce per scegliere, Spazio/Invio per confermare, Esc per tornare indietro."],["web.analyticsSettings","Analytics settings","Configuración de analíticas","Paramètres d’analyse","アクセス解析の設定","Analyse-Einstellungen","Configurações de análise","分析设置","Impostazioni di analisi"],["web.analyticsConsent","May we use Google Analytics to measure visits and understand how Poké-Mario is used? Data is sent to Google. Analytics starts only if you accept.","¿Podemos usar Google Analytics para medir las visitas y entender cómo se usa Poké-Mario? Se envían datos a Google. Las analíticas solo se activan si las aceptas.","Pouvons-nous utiliser Google Analytics pour mesurer les visites et comprendre l’utilisation de Poké-Mario ? Des données sont envoyées à Google. L’outil ne s’active qu’avec ton accord.","Google Analyticsを使ってアクセスを測定し、Poké-Marioの利用状況を把握してもよいですか？データはGoogleに送信されます。同意した場合のみ解析を有効にします。","Dürfen wir Google Analytics verwenden, um Besuche zu messen und zu verstehen, wie Poké-Mario genutzt wird? Dabei werden Daten an Google gesendet. Die Analyse wird erst nach deiner Zustimmung aktiviert.","Podemos usar o Google Analytics para medir visitas e entender como o Poké-Mario é usado? Os dados são enviados ao Google. A análise só começa se você aceitar.","我们可以使用Google Analytics统计访问量并了解Poké-Mario的使用情况吗？数据会发送给Google。只有在你同意后，才会启用分析。","Possiamo usare Google Analytics per misurare le visite e capire come viene usato Poké-Mario? I dati vengono inviati a Google. L'analisi si attiva solo se accetti."],["web.analyticsAccept","Accept analytics","Aceptar analíticas","Accepter","同意する","Zustimmen","Aceitar análise","同意分析","Accetta l'analisi"],["web.analyticsReject","Reject","Rechazar","Refuser","拒否する","Ablehnen","Recusar","拒绝","Rifiuta"],["group.button","Groups","Grupos","Groupes","グループ","Gruppen","Grupos","小组","Gruppi"],["group.profile","Profile","Perfil","Profil","プロフィール","Profil","Perfil","档案","Profilo"],["group.yourGroups","Your groups","Tus grupos","Tes groupes","あなたのグループ","Deine Gruppen","Seus grupos","你的小组","I tuoi gruppi"],["group.joinTitle","Join a group","Unirse a un grupo","Rejoindre un groupe","グループに参加","Gruppe beitreten","Entrar em um grupo","加入小组","Unisciti a un gruppo"],["group.createTitle","Create a group","Crear un grupo","Créer un groupe","グループを作成","Gruppe erstellen","Criar um grupo","创建小组","Crea un gruppo"],["group.codePlaceholder","Enter code","Introducir código","Saisir le code","コードを入力","Code eingeben","Digite o código","输入代码","Inserisci il codice"],["group.namePlaceholder","Group name","Nombre del grupo","Nom du groupe","グループ名","Gruppenname","Nome do grupo","小组名称","Nome del gruppo"],["group.join","Join","Unirse","Rejoindre","参加","Beitreten","Entrar","加入","Unisciti"],["group.create","Create","Crear","Créer","作成","Erstellen","Criar","创建","Crea"],["group.view","View","Ver","Voir","表示","Anzeigen","Ver","查看","Visualizza"],["group.leave","Leave","Salir","Quitter","退出","Verlassen","Sair","退出","Esci"],["group.share","Share link","Compartir enlace","Partager le lien","リンクを共有","Link teilen","Compartilhar link","分享链接","Condividi il link"],["group.copy","Copy","Copiar","Copier","コピー","Kopieren","Copiar","复制","Copia"],["group.copied","Copied!","¡Copiado!","Copié !","コピーしました","Kopiert!","Copiado!","已复制！","Copiato!"],["group.name","Name","Nombre","Nom","名前","Name","Nome","名字","Nome"],["group.score","Score","Puntos","Score","スコア","Punkte","Pontos","得分","Punti"],["group.level","Level","Nivel","Niveau","レベル","Level","Fase","关卡","Livello"],["group.caught","Caught","Capturados","Capturés","捕獲数","Gefangen","Capturados","已捕捉","Catturati"],["group.empty","No groups yet.","Aún no hay grupos.","Pas encore de groupes.","まだグループはありません。","Noch keine Gruppen.","Nenhum grupo ainda.","还没有小组。","Nessun gruppo ancora."],["group.notFound","Group not found.","Grupo no encontrado.","Groupe introuvable.","グループが見つかりません。","Gruppe nicht gefunden.","Grupo não encontrado.","未找到小组。","Gruppo non trovato."],["group.alreadyMember","Already a member of this group.","Ya eres miembro de este grupo.","Tu es déjà dans ce groupe.","すでにこのグループに参加しています。","Du bist schon in dieser Gruppe.","Você já está neste grupo.","你已是该小组成员。","Fai già parte di questo gruppo."],["group.full","Group is full (max 30).","El grupo está lleno (máx. 30).","Le groupe est plein (max 30).","グループが満員です（最大30人）。","Gruppe ist voll (max. 30).","O grupo está cheio (máx. 30).","小组已满（最多30人）。","Il gruppo è pieno (max 30)."],["group.invalidCode","Please enter a valid code.","Introduce un código válido.","Saisis un code valide.","有効なコードを入力してください。","Bitte einen gültigen Code eingeben.","Digite um código válido.","请输入有效代码。","Inserisci un codice valido."],["group.needName","Please enter a group name.","Introduce un nombre de grupo.","Saisis un nom de groupe.","グループ名を入力してください。","Bitte einen Gruppennamen eingeben.","Digite um nome para o grupo.","请输入小组名称。","Inserisci un nome per il gruppo."],["group.created","Group created! Code:","¡Grupo creado! Código:","Groupe créé ! Code :","グループを作成しました！コード:","Gruppe erstellt! Code:","Grupo criado! Código:","小组已创建！代码：","Gruppo creato! Codice:"],["group.createError","Could not create group.","No se pudo crear el grupo.","Impossible de créer le groupe.","グループを作成できませんでした。","Erstellen fehlgeschlagen.","Não foi possível criar o grupo.","无法创建小组。","Impossibile creare il gruppo."],["group.joinError","Could not join group.","No se pudo unir al grupo.","Impossible de rejoindre le groupe.","グループに参加できませんでした。","Beitreten fehlgeschlagen.","Não foi possível entrar no grupo.","无法加入小组。","Impossibile unirsi al gruppo."],["auth.signIn","Sign in","Iniciar sesión","Se connecter","ログイン","Anmelden","Entrar","登录","Accedi"],["auth.signOut","Sign out","Cerrar sesión","Se déconnecter","ログアウト","Abmelden","Sair","退出登录","Esci"],["auth.google","Sign in with Google","Iniciar sesión con Google","Se connecter avec Google","Googleでログイン","Mit Google anmelden","Entrar com o Google","使用Google登录","Accedi con Google"],["auth.or","or","o","ou","または","oder","ou","或","oppure"],["auth.displayName","Display name","Nombre visible","Nom affiché","表示名","Anzeigename","Nome de exibição","显示名称","Nome visualizzato"],["auth.email","Email","Correo electrónico","E-mail","メールアドレス","E-Mail","E-mail","电子邮箱","Email"],["auth.password","Password","Contraseña","Mot de passe","パスワード","Passwort","Senha","密码","Password"],["auth.createAccount","Create account","Crear cuenta","Créer un compte","アカウントを作成","Konto erstellen","Criar conta","创建账号","Crea un account"],["auth.alreadyRegistered","Already have an account? Sign in","¿Ya tienes cuenta? Inicia sesión","Déjà un compte ? Se connecter","アカウントをお持ちですか？ログイン","Schon ein Konto? Anmelden","Já tem uma conta? Entre","已有账号？登录","Hai già un account? Accedi"],["auth.emailInUse","This email is already registered. Try signing in.","Este correo ya está registrado. Intenta iniciar sesión.","Cet e-mail est déjà enregistré. Essaie de te connecter.","このメールアドレスは登録済みです。ログインしてください。","Diese E-Mail ist bereits registriert. Versuche dich anzumelden.","Este e-mail já está cadastrado. Tente entrar.","此邮箱已注册，请尝试登录。","Questa email è già registrata. Prova ad accedere."],["auth.invalidEmail","Please enter a valid email address.","Introduce un correo válido.","Saisis une adresse e-mail valide.","有効なメールアドレスを入力してください。","Bitte gib eine gültige E-Mail-Adresse ein.","Digite um e-mail válido.","请输入有效的电子邮箱地址。","Inserisci un indirizzo email valido."],["auth.weakPassword","Password must be at least 6 characters.","La contraseña debe tener al menos 6 caracteres.","Le mot de passe doit avoir au moins 6 caractères.","パスワードは6文字以上で入力してください。","Das Passwort muss mindestens 6 Zeichen haben.","A senha deve ter pelo menos 6 caracteres.","密码至少需要6个字符。","La password deve contenere almeno 6 caratteri."],["auth.noAccount","No account found with this email.","No hay una cuenta con este correo.","Aucun compte trouvé avec cet e-mail.","このメールアドレスのアカウントが見つかりません。","Zu dieser E-Mail wurde kein Konto gefunden.","Nenhuma conta encontrada com este e-mail.","未找到使用此邮箱的账号。","Nessun account trovato con questa email."],["auth.wrongPassword","Incorrect password.","Contraseña incorrecta.","Mot de passe incorrect.","パスワードが違います。","Falsches Passwort.","Senha incorreta.","密码错误。","Password errata."],["auth.invalidCredential","Incorrect email or password.","Correo o contraseña incorrectos.","E-mail ou mot de passe incorrect.","メールアドレスまたはパスワードが違います。","E-Mail oder Passwort ist falsch.","E-mail ou senha incorretos.","邮箱或密码错误。","Email o password errati."],["auth.tooManyRequests","Too many attempts. Please try again later.","Demasiados intentos. Inténtalo más tarde.","Trop de tentatives. Réessaie plus tard.","試行回数が多すぎます。しばらくしてから再試行してください。","Zu viele Versuche. Bitte versuche es später erneut.","Muitas tentativas. Tente novamente mais tarde.","尝试次数过多，请稍后重试。","Troppi tentativi. Riprova più tardi."],["auth.cancelled","Sign-in cancelled.","Inicio de sesión cancelado.","Connexion annulée.","ログインをキャンセルしました。","Anmeldung abgebrochen.","Login cancelado.","已取消登录。","Accesso annullato."],["auth.failed","Sign-in failed. Please try again.","No se pudo iniciar sesión. Inténtalo de nuevo.","Échec de la connexion. Réessaie.","ログインに失敗しました。再試行してください。","Anmeldung fehlgeschlagen. Bitte versuche es erneut.","Falha no login. Tente novamente.","登录失败，请重试。","Accesso non riuscito. Riprova."],["Leichter","Easy","Fácil","Facile","かんたん","Leichter","Fácil","简单","Facile"],["Schwerer","Hard","Difícil","Difficile","むずかしい","Schwerer","Difícil","困难","Difficile"],["leichter","easy","fácil","facile","かんたん","leichter","fácil","简单","facile"],["schwerer","hard","difícil","difficile","むずかしい","schwerer","difícil","困难","difficile"],["5 Leben, 5 Pokébälle","5 lives, 5 Poké Balls","5 vidas, 5 Poké Balls","5 vies, 5 Poké Balls","残り5回・ボール5個","5 Leben, 5 Pokébälle","5 vidas, 5 Poké Bolas","5条命，5个精灵球","5 vite, 5 Poké Ball"],["Gegner etwas schwächer","Weaker opponents","Rivales más débiles","Adversaires plus faibles","相手が少し弱い","Gegner etwas schwächer","Adversários mais fracos","对手稍弱","Avversari più deboli"],["Du machst mehr Schaden","Deal more damage","Infliges más daño","Dégâts infligés accrus","与えるダメージ増加","Du machst mehr Schaden","Cause mais dano","造成更多伤害","Infliggi più danni"],["Fangen klappt leichter","Easier catches","Capturas más fáciles","Captures plus faciles","捕まえやすい","Fangen klappt leichter","Capturas mais fáceis","更容易捕捉","Catture più facili"],["Pokébälle heilen 50 %","Balls restore 50% HP","Las bolas curan un 50 %","Les balls soignent 50 %","ボールでHP50％回復","Pokébälle heilen 50 %","Bolas recuperam 50% dos PS","精灵球恢复50%体力","Le Ball ripristinano il 50% dei PS"],["3 Leben, 2 Pokébälle","3 lives, 2 Poké Balls","3 vidas, 2 Poké Balls","3 vies, 2 Poké Balls","残り3回・ボール2個","3 Leben, 2 Pokébälle","3 vidas, 2 Poké Bolas","3条命，2个精灵球","3 vite, 2 Poké Ball"],["Gegner stärker & schneller","Stronger, faster foes","Rivales fuertes y rápidos","Ennemis forts et rapides","相手が強くて速い","Gegner stärker & schneller","Inimigos mais fortes e rápidos","对手更强、更快","Nemici più forti e veloci"],["Gegner machen mehr Schaden","Foes deal more damage","Recibes más daño","Dégâts ennemis accrus","受けるダメージ増加","Gegner machen mehr Schaden","Inimigos causam mais dano","对手造成更多伤害","I nemici infliggono più danni"],["Fangen ist schwerer","Harder catches","Capturas más difíciles","Captures plus difficiles","捕まえにくい","Fangen ist schwerer","Capturas mais difíceis","更难捕捉","Catture più difficili"],["Pokébälle heilen nur 10 %","Balls restore 10% HP","Las bolas curan un 10 %","Les balls soignent 10 %","ボールでHP10％回復","Pokébälle heilen nur 10 %","Bolas recuperam só 10% dos PS","精灵球只恢复10%体力","Le Ball ripristinano solo il 10% dei PS"],["Wer spielt? Wähle deine Schwierigkeit","Choose your difficulty","Elige la dificultad","Choisis la difficulté","難易度を選んでね","Wer spielt? Wähle deine Schwierigkeit","Escolha a dificuldade","选择难度","Scegli la difficoltà"],["Erstelle dein erstes Profil!","Create your first profile!","¡Crea tu primer perfil!","Crée ton premier profil !","最初のプロフィールを作ろう！","Erstelle dein erstes Profil!","Crie seu primeiro perfil!","创建你的第一个档案！","Crea il tuo primo profilo!"],["Profil wählen","Choose a profile","Elige un perfil","Choisis un profil","プロフィールを選択","Profil wählen","Escolha um perfil","选择档案","Scegli un profilo"],["Neues Profil","New profile","Nuevo perfil","Nouveau profil","新しく作る","Neues Profil","Novo perfil","新建档案","Nuovo profilo"],["> WEITER \u003c","> CONTINUE \u003c","> SEGUIR \u003c","> CONTINUER \u003c","> つづける \u003c","> WEITER \u003c","> CONTINUAR \u003c","> 继续 \u003c","> CONTINUA \u003c"],["AUSWÄHLEN","SELECT","ELEGIR","CHOISIR","選ぶ","AUSWÄHLEN","SELECIONAR","选择","SELEZIONA"],["{0} Pkt","{0} pts","{0} pts","{0} pts","{0}点","{0} Pkt","{0} pts","{0}分","{0} punti"],["\u003c- -> wählen   Space: auswählen   Del: löschen","← → choose   Space: select   Del: delete","← → elegir   Espacio: seleccionar   Supr: borrar","← → choisir   Espace : sélectionner   Suppr : supprimer","← → 選択   Space：決定   Delete：削除","\u003c- -> wählen   Space: auswählen   Del: löschen","← → escolher   Espaço: selecionar   Del: excluir","← →选择　空格：确认　Del：删除","← → scegli   Spazio: seleziona   Canc: elimina"],["Space: Neues Profil erstellen","Space: create a profile","Espacio: crear un perfil","Espace : créer un profil","Space：プロフィールを作成","Space: Neues Profil erstellen","Espaço: criar um perfil","空格：创建档案","Spazio: crea un profilo"],["Wie heisst du?","What's your name?","¿Cómo te llamas?","Comment t'appelles-tu ?","名前を教えてね","Wie heisst du?","Qual é o seu nome?","你叫什么名字？","Come ti chiami?"],["Buchstaben eingeben (max. 14)   Enter: weiter   Esc: zurück","Type a name (max. 14)   Enter: continue   Esc: back","Escribe tu nombre (máx. 14)   Enter: seguir   Esc: volver","Nom (14 caractères max.)   Entrée : suite   Échap : retour","名前を入力（14文字まで）   Enter：次へ   Esc：戻る","Buchstaben eingeben (max. 14)   Enter: weiter   Esc: zurück","Digite um nome (máx. 14)   Enter: continuar   Esc: voltar","输入名字（最多14个字符）　Enter：继续　Esc：返回","Scrivi un nome (max 14)   Invio: continua   Esc: indietro"],["Schwierigkeit für {0!} wählen","Choose difficulty for {0}","Elige la dificultad de {0}","Difficulté pour {0}","{0}の難易度を選択","Schwierigkeit für {0!} wählen","Escolha a dificuldade para {0}","为{0}选择难度","Scegli la difficoltà per {0}"],["> Los geht's! \u003c","> Let's go! \u003c","> ¡A jugar! \u003c","> C'est parti ! \u003c","> はじめよう！ \u003c","> Los geht's! \u003c","> Vamos lá! \u003c","> 出发！ \u003c","> Si parte! \u003c"],["▶ Los geht's! ◀","▶ Let's go! ◀","▶ ¡A jugar! ◀","▶ C'est parti ! ◀","▶ はじめよう！ ◀","▶ Los geht's! ◀","▶ Vamos lá! ◀","▶ 出发！ ◀","▶ Si parte! ◀"],["\u003c- ->: wählen   Space/Enter: weiter   Esc: zurück","← → choose   Space/Enter: continue   Esc: back","← → elegir   Espacio/Enter: seguir   Esc: volver","← → choisir   Espace/Entrée : suite   Échap : retour","← → 選択   Space/Enter：次へ   Esc：戻る","\u003c- ->: wählen   Space/Enter: weiter   Esc: zurück","← → escolher   Espaço/Enter: continuar   Esc: voltar","← →选择　空格/Enter：继续　Esc：返回","← → scegli   Spazio/Invio: continua   Esc: indietro"],["← →  oder Klick: wählen      Space / Enter: starten      1 / 2: direkt wählen","← → or click: choose   Space/Enter: start   1/2: choose","← → o clic: elegir   Espacio/Enter: jugar   1/2: elegir","← → ou clic : choisir   Espace/Entrée : jouer   1/2 : choisir","← →・クリック：選択   Space/Enter：開始   1/2：直接選択","← →  oder Klick: wählen      Space / Enter: starten      1 / 2: direkt wählen","← → ou clique: escolher   Espaço/Enter: iniciar   1/2: escolher","← →或点击：选择　空格/Enter：开始　1/2：选择","← → o clic: scegli   Spazio/Invio: inizia   1/2: scegli"],["Level wählen","Choose a level","Elige un nivel","Choisis un niveau","ステージを選択","Level wählen","Escolha uma fase","选择关卡","Scegli un livello"],["Level wählen – {0!}","Choose a level – {0}","Elige un nivel – {0}","Choisis un niveau – {0}","ステージを選択 – {0}","Level wählen – {0!}","Escolha uma fase – {0}","选择关卡 – {0}","Scegli un livello – {0}"],["> Start \u003c","> Start \u003c","> Jugar \u003c","> Jouer \u003c","> スタート \u003c","> Start \u003c","> Iniciar \u003c","> 开始 \u003c","> Inizia \u003c"],["Space/Enter: starten   Pfeile: navigieren","Space/Enter: start   Arrows: navigate","Espacio/Enter: jugar   Flechas: navegar","Espace/Entrée : jouer   Flèches : naviguer","Space/Enter：開始   矢印：移動","Space/Enter: starten   Pfeile: navigieren","Espaço/Enter: iniciar   Setas: navegar","空格/Enter：开始　方向键：选择","Spazio/Invio: inizia   Frecce: naviga"],["N: Fortschritt löschen","N: reset progress","N: borrar progreso","N : effacer la progression","N：進行状況をリセット","N: Fortschritt löschen","N: reiniciar progresso","N：重置进度","N: azzera i progressi"],["Fortschritt von {0!} zurückgesetzt.","Progress reset for {0}.","Progreso de {0} reiniciado.","Progression de {0} réinitialisée.","{0}の進行状況をリセットしました。","Fortschritt von {0!} zurückgesetzt.","Progresso de {0} reiniciado.","已重置{0}的进度。","Progressi di {0} azzerati."],["KAMPF","FIGHT","LUCHAR","COMBAT","たたかう","KAMPF","LUTAR","战斗","LOTTA"],["POKÉBALL","POKÉ BALL","POKÉ BALL","POKÉ BALL","ボール","POKÉBALL","POKÉ BOLA","精灵球","POKÉ BALL"],["WECHSELN","SWITCH","CAMBIAR","CHANGER","いれかえ","WECHSELN","TROCAR","替换","CAMBIA"],["FLUCHT","RUN","HUIR","FUITE","にげる","FLUCHT","FUGIR","逃跑","FUGA"],["Esc: zurück","Esc: back","Esc: volver","Échap : retour","Esc：戻る","Esc: zurück","Esc: voltar","Esc：返回","Esc: indietro"],["KP","HP","PS","PV","HP","KP","PS","体力","PS"],["EP","XP","EXP","EXP","経験値","EP","EXP","经验","ESP"],["PUNKTE","SCORE","PUNTOS","SCORE","スコア","PUNKTE","PONTOS","得分","PUNTI"],["LUFT","AIR","AIRE","AIR","空気","LUFT","AR","氧气","ARIA"],["Krone!","Crown!","¡Corona!","Couronne !","王冠！","Krone!","Coroa!","王冠！","Corona!"],["Pause im Stockhaus... Zzz","Resting in the hut... Zzz","Descansando en la cabaña... Zzz","Repos dans la cabane... Zzz","小屋でひと休み… Zzz","Pause im Stockhaus... Zzz","Descansando na cabana... Zzz","正在小屋里休息……呼呼","Riposo nella capanna... Zzz"],["Dein Team erholt sich vollständig.","Your team is fully healed.","Tu equipo se recupera por completo.","Ton équipe retrouve toute sa santé.","チームのHPが全回復します。","Dein Team erholt sich vollständig.","Sua equipe está totalmente curada.","你的队伍已完全恢复。","La tua squadra è completamente guarita."],["Checkpoint gesetzt: Hier geht es nach einem verlorenen Leben weiter.","Checkpoint set: return here after losing a life.","Punto de control: volverás aquí si pierdes una vida.","Point de contrôle : tu reviendras ici après avoir perdu une vie.","チェックポイント設定。ミスしたらここから再開。","Checkpoint gesetzt: Hier geht es nach einem verlorenen Leben weiter.","Ponto de controle: você volta aqui ao perder uma vida.","已设置检查点：失去一条命后会回到这里。","Checkpoint impostato: tornerai qui dopo aver perso una vita."],["GEHEIMES ZIEL GEFUNDEN!","SECRET GOAL FOUND!","¡META SECRETA ENCONTRADA!","ARRIVÉE SECRÈTE TROUVÉE !","秘密のゴールを発見！","GEHEIMES ZIEL GEFUNDEN!","OBJETIVO SECRETO ENCONTRADO!","发现秘密终点！","TRAGUARDO SEGRETO TROVATO!"],["LEVEL GESCHAFFT!","LEVEL COMPLETE!","¡NIVEL SUPERADO!","NIVEAU TERMINÉ !","ステージクリア！","LEVEL GESCHAFFT!","FASE CONCLUÍDA!","关卡完成！","LIVELLO COMPLETATO!"],["GAME OVER","GAME OVER","FIN DEL JUEGO","PARTIE TERMINÉE","ゲームオーバー","GAME OVER","FIM DE JOGO","游戏结束","GAME OVER"],["Modus: {0}   Punkte: {1}   Kämpfe: {2}   Gefangen: {3}   Entwicklungen: {4}","Mode: {0}   Score: {1}   Battles: {2}   Caught: {3}   Evolutions: {4}","Modo: {0}   Puntos: {1}   Combates: {2}   Capturas: {3}   Evoluciones: {4}","Mode : {0}   Score : {1}   Combats : {2}   Captures : {3}   Évolutions : {4}","難易度：{0}   点数：{1}   戦闘：{2}   捕獲：{3}   進化：{4}","Modus: {0}   Punkte: {1}   Kämpfe: {2}   Gefangen: {3}   Entwicklungen: {4}","Modo: {0}   Pontos: {1}   Batalhas: {2}   Capturas: {3}   Evoluções: {4}","模式：{0}　得分：{1}　战斗：{2}　捕捉：{3}　进化：{4}","Modalità: {0}   Punti: {1}   Lotte: {2}   Catture: {3}   Evoluzioni: {4}"],["★ Geheimnisse gefunden: {0} von {1}","★ Secrets found: {0} of {1}","★ Secretos: {0} de {1}","★ Secrets trouvés : {0} sur {1}","★ 発見した秘密：{0}/{1}","★ Geheimnisse gefunden: {0} von {1}","★ Segredos encontrados: {0} de {1}","★ 已发现秘密：{0}/{1}","★ Segreti trovati: {0} su {1}"],["Dein Team:","Your team:","Tu equipo:","Ton équipe :","あなたのチーム：","Dein Team:","Sua equipe:","你的队伍：","La tua squadra:"],["Space/Enter: weiter zu Level {0}","Space/Enter: next level {0}","Espacio/Enter: siguiente nivel {0}","Espace/Entrée : niveau suivant {0}","Space/Enter：次のステージ {0}","Space/Enter: weiter zu Level {0}","Espaço/Enter: próxima fase {0}","空格/Enter：下一关{0}","Spazio/Invio: prossimo livello {0}"],["Du hast alle Level geschafft!","You completed every level!","¡Has superado todos los niveles!","Tu as terminé tous les niveaux !","全ステージクリア！","Du hast alle Level geschafft!","Você concluiu todas as fases!","你完成了所有关卡！","Hai completato tutti i livelli!"],["R: zurück zur Auswahl   L: Level wechseln","R: back to selection   L: change level","R: volver al menú   L: cambiar nivel","R : retour au menu   L : changer de niveau","R：選択に戻る   L：ステージ変更","R: zurück zur Auswahl   L: Level wechseln","R: voltar à seleção   L: mudar de fase","R：返回选择界面　L：切换关卡","R: torna alla selezione   L: cambia livello"],["Level {0}  ·  Modus: {1}","Level {0}  ·  Mode: {1}","Nivel {0}  ·  Modo: {1}","Niveau {0}  ·  Mode : {1}","ステージ {0}  ·  難易度：{1}","Level {0}  ·  Modus: {1}","Fase {0}  ·  Modo: {1}","关卡{0} · 模式：{1}","Livello {0}  ·  Modalità: {1}"],["Level {0}","Level {0}","Nivel {0}","Niveau {0}","ステージ {0}","Level {0}","Fase {0}","关卡{0}","Livello {0}"],["Keine Luft mehr!","Out of air!","¡Sin aire!","Plus d'air !","空気がなくなった！","Keine Luft mehr!","Acabou o ar!","氧气耗尽了！","Aria esaurita!"],["Keine Gurken! Sammle grüne Gurken im Level.","No cucumbers! Collect some in the level.","¡Sin pepinos! Recoge los verdes del nivel.","Plus de concombres ! Ramasses-en dans le niveau.","キュウリがない！ステージで集めよう。","Keine Gurken! Sammle grüne Gurken im Level.","Sem pepinos! Colete alguns na fase.","没有黄瓜！先在关卡中收集一些。","Niente cetrioli! Raccogline nel livello."],["{0} übernimmt die Führung!","{0} takes the lead!","¡{0} lidera el equipo!","{0} prend la tête !","{0}が先頭になった！","{0} übernimmt die Führung!","{0} assume a liderança!","{0}成为领队！","{0} prende il comando!"],["{0} ist kampfunfähig!","{0} has fainted!","¡{0} está debilitado!","{0} est K.O. !","{0}は戦えない！","{0} ist kampfunfähig!","{0} desmaiou!","{0}倒下了！","{0} è esausto!"],["Du brauchst 5 Stöcke für ein Stockhaus ({0}/5)","You need 5 sticks for a hut ({0}/5)","Necesitas 5 palos para una cabaña ({0}/5)","Il faut 5 bâtons pour une cabane ({0}/5)","小屋には木の枝が5本必要（{0}/5）","Du brauchst 5 Stöcke für ein Stockhaus ({0}/5)","Você precisa de 5 gravetos para uma cabana ({0}/5)","建造小屋需要5根树枝（{0}/5）","Servono 5 bastoni per una capanna ({0}/5)"],["Zum Bauen auf dem Boden stehen","Stand on the ground to build","Ponte en el suelo para construir","Reste au sol pour construire","地面に立ってから建てよう","Zum Bauen auf dem Boden stehen","Fique no chão para construir","站在地面上才能建造","Resta a terra per costruire"],["Du fliegst mit dem Ballon! ↑ ↓ lenken, Space abspringen","Flying! ↑ ↓ steer, Space to jump off","¡A volar! ↑ ↓ dirigir, Espacio para saltar","En vol ! ↑ ↓ diriger, Espace pour sauter","気球に乗った！↑ ↓ 操作、Spaceで降りる","Du fliegst mit dem Ballon! ↑ ↓ lenken, Space abspringen","Voando! ↑ ↓ pilotar, Espaço para saltar","飞起来了！↑ ↓操控，空格跳下","In volo! ↑ ↓ guida, Spazio per scendere"],["Ein verborgener Raum wird sichtbar!","A hidden room is revealed!","¡Una sala oculta aparece!","Une salle cachée apparaît !","隠し部屋を発見！","Ein verborgener Raum wird sichtbar!","Uma sala escondida foi revelada!","发现了隐藏房间！","Una stanza nascosta è stata rivelata!"],["Der goldene Schlüssel passt! Das Tor öffnet sich.","The golden key fits! The gate opens.","¡La llave dorada encaja! La puerta se abre.","La clé dorée convient ! La porte s'ouvre.","金のカギがぴったり！門が開いた。","Der goldene Schlüssel passt! Das Tor öffnet sich.","A chave dourada encaixa! O portão se abre.","金钥匙正合适！大门打开了。","La chiave d'oro funziona! Il cancello si apre."],["Fünf Sterne! Du trägst jetzt eine Krone. {0} steigt von Level {1} auf {2}!","Five stars! A crown for you. {0} rises from level {1} to {2}!","¡Cinco estrellas! Tienes una corona. ¡{0} sube del nivel {1} al {2}!","Cinq étoiles ! À toi la couronne. {0} passe du niveau {1} au {2} !","星5個で王冠を獲得！{0}がレベル{1}から{2}に！","Fünf Sterne! Du trägst jetzt eine Krone. {0} steigt von Level {1} auf {2}!","Cinco estrelas! Uma coroa para você. {0} sobe do nível {1} para {2}!","五颗星！送你一顶王冠。{0}从{1}级升到{2}级！","Cinque stelle! Una corona per te. {0} sale dal livello {1} al {2}!"],["Stern {0}/5 gesammelt!","Star {0}/5 collected!","¡Estrella {0}/5 recogida!","Étoile {0}/5 ramassée !","星を獲得！{0}/5","Stern {0}/5 gesammelt!","Estrela {0}/5 coletada!","已收集星星{0}/5！","Stella {0}/5 raccolta!"],["Noch ein Stern ({0})!","Another star ({0})!","¡Otra estrella ({0})!","Une autre étoile ({0}) !","また星をゲット（{0}個）！","Noch ein Stern ({0})!","Mais uma estrela ({0})!","又一颗星（{0}）！","Un'altra stella ({0})!"],["+1 Gurke ({0}). Wirf sie mit G auf Kürbisse!","+1 cucumber ({0}). Press G to throw at pumpkins!","+1 pepino ({0}). ¡Lánzalo a las calabazas con G!","+1 concombre ({0}). Lance-le sur les citrouilles avec G !","キュウリ+1（{0}個）。Gでカボチャに投げよう！","+1 Gurke ({0}). Wirf sie mit G auf Kürbisse!","+1 pepino ({0}). Aperte G para lançar nas abóboras!","+1黄瓜（{0}）。按G扔向南瓜！","+1 cetriolo ({0}). Premi G per lanciarlo alle zucche!"],["+1 Stock ({0}) – drücke B für ein Stockhaus!","+1 stick ({0}) – press B to build a hut!","+1 palo ({0}) – ¡pulsa B para una cabaña!","+1 bâton ({0}) – appuie sur B pour une cabane !","木の枝+1（{0}本）。Bで小屋を建てよう！","+1 Stock ({0}) – drücke B für ein Stockhaus!","+1 graveto ({0}) – aperte B para construir uma cabana!","+1树枝（{0}）——按B建造小屋！","+1 bastone ({0}) – premi B per costruire una capanna!"],["+1 Stock ({0}/5)","+1 stick ({0}/5)","+1 palo ({0}/5)","+1 bâton ({0}/5)","木の枝+1（{0}/5）","+1 Stock ({0}/5)","+1 graveto ({0}/5)","+1树枝（{0}/5）","+1 bastone ({0}/5)"],["MEISTERBALL! Fängt jedes Pokémon garantiert.","MASTER BALL! A guaranteed catch.","¡MASTER BALL! Captura garantizada.","MASTER BALL ! Capture garantie.","マスターボール！必ず捕まえられる。","MEISTERBALL! Fängt jedes Pokémon garantiert.","MASTER BOLA! Captura garantida.","大师球！保证捕捉成功。","MASTER BALL! Cattura garantita."],["+1 Pokéball, Team +{0}% KP","+1 Poké Ball, team +{0}% HP","+1 Poké Ball, equipo +{0}% PS","+1 Poké Ball, équipe +{0} % PV","ボール+1、チームのHPが{0}％回復","+1 Pokéball, Team +{0}% KP","+1 Poké Bola, equipe +{0}% PS","+1精灵球，队伍恢复{0}%体力","+1 Poké Ball, squadra +{0}% PS"],["{0} ist aufgewacht!","{0} woke up!","¡{0} se ha despertado!","{0} se réveille !","{0}が目を覚ました！","{0} ist aufgewacht!","{0} acordou!","{0}醒来了！","{0} si è svegliato!"],["Iiih, eine Gurke! Der Kürbis flitzt davon.","Eek, a cucumber! The pumpkin runs away.","¡Ah, un pepino! La calabaza sale corriendo.","Ah, un concombre ! La citrouille s'enfuit.","キュウリだ！カボチャが逃げていった。","Iiih, eine Gurke! Der Kürbis flitzt davon.","Ah, um pepino! A abóbora foge.","呀，黄瓜！南瓜逃跑了。","Ah, un cetriolo! La zucca scappa."],["Buh! Der Kürbis schubst dich weg. Wirf eine Gurke (G)!","Boo! The pumpkin shoves you. Throw a cucumber (G)!","¡Buu! La calabaza te empuja. ¡Lanza un pepino (G)!","Bouh ! La citrouille te pousse. Lance un concombre (G) !","わっ！カボチャに押された。Gでキュウリを投げよう！","Buh! Der Kürbis schubst dich weg. Wirf eine Gurke (G)!","Bu! A abóbora empurra você. Lance um pepino (G)!","呜！南瓜推开了你。扔根黄瓜吧（G）！","Buh! La zucca ti spinge. Lancia un cetriolo (G)!"],["Ein Trank! Team vollständig geheilt. +1 Pokéball","A potion! Team fully healed. +1 Poké Ball","¡Una poción! Equipo curado. +1 Poké Ball","Une potion ! Équipe soignée. +1 Poké Ball","キズぐすり！チーム全回復。ボール+1","Ein Trank! Team vollständig geheilt. +1 Pokéball","Uma poção! Equipe curada. +1 Poké Bola","一瓶药水！队伍完全恢复。+1精灵球","Una pozione! Squadra guarita. +1 Poké Ball"],["★ {0} ({1}/{2} Geheimnisse)","★ {0} ({1}/{2} secrets)","★ {0} ({1}/{2} secretos)","★ {0} ({1}/{2} secrets)","★ {0}（秘密 {1}/{2}）","★ {0} ({1}/{2} Geheimnisse)","★ {0} ({1}/{2} segredos)","★ {0}（{1}/{2}个秘密）","★ {0} ({1}/{2} segreti)"],["Die Kürbisse versperren die Tür! Verscheuche sie mit Gurken (Taste G).","Pumpkins block the door! Scare them off with cucumbers (G).","¡Las calabazas bloquean la puerta! Espántalas con pepinos (G).","Les citrouilles bloquent la porte ! Chasse-les avec des concombres (G).","カボチャが扉をふさいでいる！Gでキュウリを投げよう。","Die Kürbisse versperren die Tür! Verscheuche sie mit Gurken (Taste G).","As abóboras bloqueiam a porta! Afaste-as com pepinos (G).","南瓜挡住了门！用黄瓜赶走它们（G）。","Le zucche bloccano la porta! Scacciale con i cetrioli (G)."],["{0} +{1} EP","{0} +{1} XP","{0} +{1} EXP","{0} +{1} EXP","{0} 経験値+{1}","{0} +{1} EP","{0} +{1} EXP","{0} +{1}经验","{0} +{1} ESP"],["{0} erreicht Level {1}!","{0} reached level {1}!","¡{0} alcanza el nivel {1}!","{0} atteint le niveau {1} !","{0}はレベル{1}になった！","{0} erreicht Level {1}!","{0} chegou ao nível {1}!","{0}升到了{1}级！","{0} ha raggiunto il livello {1}!"],["{0} hat sich zu {1} entwickelt!","{0} evolved into {1}!","¡{0} ha evolucionado a {1}!","{0} a évolué en {1} !","{0}は{1}に進化した！","{0} hat sich zu {1} entwickelt!","{0} evoluiu para {1}!","{0}进化成了{1}！","{0} si è evoluto in {1}!"],["Geheimtür benutzt!","Secret door used!","¡Puerta secreta usada!","Porte secrète empruntée !","秘密の扉を通った！","Geheimtür benutzt!","Porta secreta usada!","通过了秘密门！","Porta segreta usata!"],["Durch das Gemälde gesprungen!","Jumped through the painting!","¡Has cruzado el cuadro!","Tableau traversé !","絵の中を通り抜けた！","Durch das Gemälde gesprungen!","Você atravessou a pintura!","穿过了画作！","Hai attraversato il dipinto!"],["Unsichtbarer Block entdeckt!","Hidden block found!","¡Bloque invisible descubierto!","Bloc invisible trouvé !","見えないブロックを発見！","Unsichtbarer Block entdeckt!","Bloco escondido encontrado!","发现了隐藏方块！","Blocco nascosto trovato!"],["Geheimgang entdeckt!","Secret passage found!","¡Pasadizo secreto descubierto!","Passage secret trouvé !","秘密の通路を発見！","Geheimgang entdeckt!","Passagem secreta encontrada!","发现了秘密通道！","Passaggio segreto trovato!"],["Welches Pokémon soll kämpfen?","Which Pokémon should battle?","¿Qué Pokémon debe luchar?","Quel Pokémon doit combattre ?","どのポケモンで戦う？","Welches Pokémon soll kämpfen?","Qual Pokémon vai lutar?","派哪只宝可梦出战？","Quale Pokémon deve lottare?"],["Was soll {0} tun?","What should {0} do?","¿Qué debe hacer {0}?","Que doit faire {0} ?","{0}はどうする？","Was soll {0} tun?","O que {0} deve fazer?","{0}要做什么？","Cosa deve fare {0}?"],["Kein anderes Pokémon einsatzbereit!","No other Pokémon can battle!","¡No hay más Pokémon listos!","Aucun autre Pokémon disponible !","ほかに戦えるポケモンがいない！","Kein anderes Pokémon einsatzbereit!","Nenhum outro Pokémon pode lutar!","没有其他能战斗的宝可梦！","Nessun altro Pokémon può lottare!"],["Komm zurück, {0}!","Come back, {0}!","¡Vuelve, {0}!","Reviens, {0} !","戻れ、{0}！","Komm zurück, {0}!","Volte, {0}!","回来吧，{0}！","Torna, {0}!"],["Los, {0}!","Go, {0}!","¡Adelante, {0}!","À toi, {0} !","いけ、{0}！","Los, {0}!","Vai, {0}!","去吧，{0}！","Vai, {0}!"],["Wildes {0} setzt {1} ein!","Wild {0} used {1}!","¡{0} salvaje usa {1}!","{0} sauvage utilise {1} !","野生の{0}の{1}！","Wildes {0} setzt {1} ein!","{0} selvagem usou {1}!","野生的{0}使出了{1}！","{0} selvatico usa {1}!"],["{0} setzt {1} ein!","{0} used {1}!","¡{0} usa {1}!","{0} utilise {1} !","{0}の{1}！","{0} setzt {1} ein!","{0} usou {1}!","{0}使出了{1}！","{0} usa {1}!"],["Aber nichts passiert!","But nothing happened!","¡Pero no pasa nada!","Mais rien ne se passe !","しかし何も起きなかった！","Aber nichts passiert!","Mas nada aconteceu!","但是什么都没有发生！","Ma non succede nulla!"],["Ein Volltreffer!","A critical hit!","¡Un golpe crítico!","Un coup critique !","急所に当たった！","Ein Volltreffer!","Acerto crítico!","击中要害！","Brutto colpo!"],["Es hat keine Wirkung!","It has no effect!","¡No tiene efecto!","Cela n'a aucun effet !","効果がないようだ！","Es hat keine Wirkung!","Não tem efeito!","没有效果！","Non ha effetto!"],["Das ist sehr effektiv!","It's super effective!","¡Es supereficaz!","C'est super efficace !","効果は抜群だ！","Das ist sehr effektiv!","É supereficaz!","效果绝佳！","È superefficace!"],["Das ist nicht sehr effektiv...","It's not very effective...","No es muy eficaz...","Ce n'est pas très efficace…","効果はいまひとつ…","Das ist nicht sehr effektiv...","Não é muito eficaz...","效果不太好……","Non è molto efficace..."],["Das wilde {0} schläft tief und fest... Zzz","Wild {0} is fast asleep... Zzz","{0} salvaje duerme profundamente... Zzz","{0} sauvage dort profondément… Zzz","野生の{0}はぐっすり眠っている… Zzz","Das wilde {0} schläft tief und fest... Zzz","{0} selvagem está dormindo... Zzz","野生的{0}睡得正香……呼呼","{0} selvatico dorme profondamente... Zzz"],["{0} ist besiegt! Der Weg ist frei.","{0} is defeated! The path is clear.","¡{0} está derrotado! El camino está libre.","{0} est vaincu ! La voie est libre.","{0}を倒した！道が開けた。","{0} ist besiegt! Der Weg ist frei.","{0} foi derrotado! O caminho está livre.","打败了{0}！道路畅通了。","{0} è stato sconfitto! La strada è libera."],["Mew lächelt, winkt dir zu und verschwindet in den Wolken...","Mew smiles, waves and disappears into the clouds...","Mew sonríe, saluda y desaparece entre las nubes...","Mew sourit, te salue et disparaît dans les nuages…","ミュウはにっこり手を振り、雲の中へ消えていった…","Mew lächelt, winkt dir zu und verschwindet in den Wolken...","Mew sorri, acena e desaparece nas nuvens...","梦幻微笑着挥挥手，消失在云中……","Mew sorride, saluta e scompare tra le nuvole..."],["Das wilde {0} wurde besiegt!","Wild {0} was defeated!","¡{0} salvaje ha sido derrotado!","{0} sauvage est vaincu !","野生の{0}を倒した！","Das wilde {0} wurde besiegt!","{0} selvagem foi derrotado!","打败了野生的{0}！","{0} selvatico è stato sconfitto!"],["{0} erhält {1} Erfahrungspunkte!","{0} gained {1} experience points!","¡{0} gana {1} puntos de experiencia!","{0} gagne {1} points d'expérience !","{0}は経験値を{1}獲得！","{0} erhält {1} Erfahrungspunkte!","{0} ganhou {1} pontos de experiência!","{0}获得了{1}点经验！","{0} ha ottenuto {1} punti esperienza!"],["Was? {0} entwickelt sich!","What? {0} is evolving!","¿Qué? ¡{0} está evolucionando!","Quoi ? {0} évolue !","おや？{0}の様子が…！","Was? {0} entwickelt sich!","O quê? {0} está evoluindo!","咦？{0}正在进化！","Cosa? {0} si sta evolvendo!"],["Glückwunsch! Dein {0} hat sich zu {1} entwickelt!","Congratulations! Your {0} evolved into {1}!","¡Felicidades! ¡Tu {0} ha evolucionado a {1}!","Félicitations ! Ton {0} a évolué en {1} !","おめでとう！{0}は{1}に進化した！","Glückwunsch! Dein {0} hat sich zu {1} entwickelt!","Parabéns! Seu {0} evoluiu para {1}!","恭喜！你的{0}进化成了{1}！","Complimenti! Il tuo {0} si è evoluto in {1}!"],["{0} wurde besiegt!","{0} was defeated!","¡{0} ha sido derrotado!","{0} est vaincu !","{0}は倒れた！","{0} wurde besiegt!","{0} foi derrotado!","{0}被打败了！","{0} è stato sconfitto!"],["Dir sind die Pokémon ausgegangen! Du fliehst zurück...","No Pokémon left! You retreat...","¡No te quedan Pokémon! Te retiras...","Tu n'as plus de Pokémon ! Tu bats en retraite…","戦えるポケモンがいない！いったん戻ろう…","Dir sind die Pokémon ausgegangen! Du fliehst zurück...","Sem Pokémon disponíveis! Você recua...","没有能战斗的宝可梦了！你撤退了……","Non hai più Pokémon! Ti ritiri..."],["Du hast keine Pokébälle mehr! Sammle welche im Level.","No Poké Balls left! Collect more in the level.","¡No quedan Poké Balls! Recoge más en el nivel.","Plus de Poké Balls ! Ramasses-en dans le niveau.","ボールがない！ステージで集めよう。","Du hast keine Pokébälle mehr! Sammle welche im Level.","Acabaram as Poké Bolas! Colete mais na fase.","没有精灵球了！在关卡里再收集一些。","Poké Ball esaurite! Raccogline altre nel livello."],["Dein Team ist voll (6 Pokémon)!","Your team is full (6 Pokémon)!","¡Tu equipo está lleno (6 Pokémon)!","Ton équipe est complète (6 Pokémon) !","チームはいっぱい（6匹）！","Dein Team ist voll (6 Pokémon)!","Sua equipe está cheia (6 Pokémon)!","你的队伍已满（6只宝可梦）！","La tua squadra è al completo (6 Pokémon)!"],["Du wirfst den MEISTERBALL!","You throw the MASTER BALL!","¡Lanzas la MASTER BALL!","Tu lances la MASTER BALL !","マスターボールを投げた！","Du wirfst den MEISTERBALL!","Você lança a MASTER BOLA!","你扔出了大师球！","Lanci la MASTER BALL!"],["Du wirfst einen Pokéball!","You throw a Poké Ball!","¡Lanzas una Poké Ball!","Tu lances une Poké Ball !","モンスターボールを投げた！","Du wirfst einen Pokéball!","Você lança uma Poké Bola!","你扔出了精灵球！","Lanci una Poké Ball!"],["Toll! {0} wurde gefangen!","Great! {0} was caught!","¡Genial! ¡Has capturado a {0}!","Super ! {0} est capturé !","やった！{0}を捕まえた！","Toll! {0} wurde gefangen!","Ótimo! {0} foi capturado!","太好了！捉到了{0}！","Ottimo! {0} è stato catturato!"],["{0} ist jetzt in deinem Team (Platz {1}).","{0} joined your team (slot {1}).","{0} se une a tu equipo (puesto {1}).","{0} rejoint ton équipe (place {1}).","{0}がチームに加わった（{1}匹目）。","{0} ist jetzt in deinem Team (Platz {1}).","{0} entrou na equipe (posição {1}).","{0}加入了你的队伍（第{1}位）。","{0} è nella tua squadra (posto {1})."],["Oh nein! Das Pokémon ist sofort ausgebrochen!","Oh no! The Pokémon broke free at once!","¡Oh, no! ¡El Pokémon se ha escapado enseguida!","Oh non ! Le Pokémon s'est libéré tout de suite !","あっ！すぐに逃げられた！","Oh nein! Das Pokémon ist sofort ausgebrochen!","Ah, não! O Pokémon escapou na hora!","糟糕！宝可梦立刻挣脱了！","Oh no! Il Pokémon è uscito subito!"],["Mist! Fast hätte es geklappt!","So close! Almost had it!","¡Qué lástima! ¡Casi lo tenías!","Dommage ! C'était presque réussi !","惜しい！もう少しだった！","Mist! Fast hätte es geklappt!","Por pouco! Quase pegou!","差一点！就快捉到了！","Per un pelo! C'eri quasi!"],["Argh! So knapp daneben!","Argh! So close!","¡Ah! ¡Por muy poco!","Argh ! À un rien près !","あと一歩だったのに！","Argh! So knapp daneben!","Ah! Faltou pouco!","啊！就差一点！","Argh! Per un soffio!"],["Du bist entkommen!","You got away!","¡Has escapado!","Tu as réussi à fuir !","うまく逃げられた！","Du bist entkommen!","Você conseguiu fugir!","成功逃跑了！","Sei riuscito a scappare!"],["Flucht gescheitert!","Couldn't escape!","¡No has podido escapar!","Impossible de fuir !","逃げられなかった！","Flucht gescheitert!","Não conseguiu fugir!","逃跑失败！","Non riesci a fuggire!"],["Ein wildes {0} (Lv. {1}) erscheint!","A wild {0} (Lv. {1}) appeared!","¡Aparece {0} salvaje (Nv. {1})!","Un {0} sauvage (Niv. {1}) apparaît !","野生の{0}（Lv.{1}）が現れた！","Ein wildes {0} (Lv. {1}) erscheint!","Um {0} selvagem (Nv. {1}) apareceu!","野生的{0}（{1}级）出现了！","È apparso un {0} selvatico (Lv. {1})!"],["Ein wildes {0} (Lv. {1}) schläft hier... Zzz","A wild {0} (Lv. {1}) is asleep... Zzz","{0} salvaje (Nv. {1}) duerme aquí... Zzz","Un {0} sauvage (Niv. {1}) dort ici… Zzz","野生の{0}（Lv.{1}）が眠っている… Zzz","Ein wildes {0} (Lv. {1}) schläft hier... Zzz","Um {0} selvagem (Nv. {1}) está dormindo... Zzz","野生的{0}（{1}级）正在睡觉……呼呼","Un {0} selvatico (Lv. {1}) dorme... Zzz"],["Das wilde {0} greift überraschend an!","Wild {0} attacks by surprise!","¡{0} salvaje ataca por sorpresa!","{0} sauvage attaque par surprise !","野生の{0}の不意打ち！","Das wilde {0} greift überraschend an!","{0} selvagem ataca de surpresa!","野生的{0}突然发起攻击！","{0} selvatico attacca di sorpresa!"],["Ein wildes MEW (Lv. {0}) schwebt vor dir! Es sieht dich neugierig an...","A wild MEW (Lv. {0}) floats before you, watching curiously...","¡Un MEW salvaje (Nv. {0}) flota ante ti y te mira con curiosidad!","Un MEW sauvage (Niv. {0}) flotte devant toi et t'observe…","野生のミュウ（Lv.{0}）が浮かんでいる！興味深そうに見ている…","Ein wildes MEW (Lv. {0}) schwebt vor dir! Es sieht dich neugierig an...","Um MEW selvagem (Nv. {0}) flutua à sua frente, olhando com curiosidade...","野生的梦幻（{0}级）漂浮在你面前，好奇地打量着你……","Un MEW selvatico (Lv. {0}) fluttua davanti a te e ti osserva curioso..."],["Tipp: Wähle POKÉBALL, dein Meisterball fängt es garantiert!","Tip: choose POKÉ BALL. Your Master Ball always catches it!","Consejo: elige POKÉ BALL. ¡La Master Ball nunca falla!","Astuce : choisis POKÉ BALL. La Master Ball ne rate jamais !","ヒント：「ボール」を選ぼう。マスターボールなら必ず捕まる！","Tipp: Wähle POKÉBALL, dein Meisterball fängt es garantiert!","Dica: escolha POKÉ BOLA. Sua Master Bola sempre captura!","提示：选择精灵球。大师球一定能捉到它！","Consiglio: scegli POKÉ BALL. La Master Ball lo cattura sempre!"],["Tipp: Hol dir zuerst den lila Meisterball am Start!","Tip: get the purple Master Ball near the start first!","Consejo: ¡recoge primero la Master Ball morada al inicio!","Astuce : prends d'abord la Master Ball violette au départ !","ヒント：スタート地点の紫のマスターボールを拾おう！","Tipp: Hol dir zuerst den lila Meisterball am Start!","Dica: pegue primeiro a Master Bola roxa perto do início!","提示：先拿到起点附近的紫色大师球！","Consiglio: raccogli prima la Master Ball viola vicino all'inizio!"],["{0} (Lv. {1}) versperrt dir den Weg!{2}","{0} (Lv. {1}) blocks your path!{2}","¡{0} (Nv. {1}) bloquea tu camino!{2}","{0} (Niv. {1}) bloque le passage !{2}","{0}（Lv.{1}）が道をふさいでいる！{2}","{0} (Lv. {1}) versperrt dir den Weg!{2}","{0} (Nv. {1}) bloqueia o caminho!{2}","{0}（{1}级）挡住了去路！{2}","{0} (Lv. {1}) ti blocca la strada!{2}"],["{0} (Lv. {1}) versperrt dir den Weg!","{0} (Lv. {1}) blocks your path!","¡{0} (Nv. {1}) bloquea tu camino!","{0} (Niv. {1}) bloque le passage !","{0}（Lv.{1}）が道をふさいでいる！","{0} (Lv. {1}) versperrt dir den Weg!","{0} (Nv. {1}) bloqueia o caminho!","{0}（{1}级）挡住了去路！","{0} (Lv. {1}) ti blocca la strada!"],["Es schnarcht laut... Zzz","It snores loudly... Zzz","Ronca fuerte... Zzz","Il ronfle fort… Zzz","大きないびき… Zzz","Es schnarcht laut... Zzz","Ronca bem alto... Zzz","它鼾声如雷……呼呼","Russa forte... Zzz"],["Es gähnt gelangweilt...","It yawns lazily...","Bosteza sin interés...","Il bâille d'ennui…","退屈そうにあくびをしている…","Es gähnt gelangweilt...","Boceja sem pressa...","它懒洋洋地打了个哈欠……","Sbadiglia pigramente..."],["Es mustert dich klug.","It watches you shrewdly.","Te observa con astucia.","Il te regarde avec malice.","賢そうな目で見ている。","Es mustert dich klug.","Observa você com astúcia.","它机警地注视着你。","Ti osserva con astuzia."],["Es gleitet singend aus der Tiefe herauf.","It rises from the depths, singing.","Asciende cantando desde el fondo.","Il remonte des profondeurs en chantant.","歌いながら水底から現れた。","Es gleitet singend aus der Tiefe herauf.","Surge das profundezas cantando.","它从深处浮起，唱着歌。","Sale dalle profondità, cantando."],["Eisiger Wind weht dir entgegen!","An icy wind blows toward you!","¡Sopla un viento helado!","Un vent glacial souffle vers toi !","冷たい風が吹いてくる！","Eisiger Wind weht dir entgegen!","Um vento gelado sopra na sua direção!","一阵寒风向你吹来！","Un vento gelido soffia verso di te!"],["Es kichert aus dem Schatten: Buh!","It giggles from the shadows: Boo!","Se ríe desde las sombras: ¡Buu!","Il ricane dans l'ombre : Bouh !","影から笑い声…わっ！","Es kichert aus dem Schatten: Buh!","Ri nas sombras: Bu!","它在阴影中窃笑：呜！","Ridacchia nell'ombra: Buh!"],["Es schwebt schweigend vor dem letzten Saal.","It floats silently before the final hall.","Flota en silencio ante la última sala.","Il flotte en silence devant la dernière salle.","最後の部屋の前に静かに浮かんでいる。","Es schwebt schweigend vor dem letzten Saal.","Flutua em silêncio diante do salão final.","它静静地漂浮在最后的大厅前。","Fluttua in silenzio davanti alla sala finale."],["Mew kichert und schwebt neugierig um dich herum!","Mew giggles and floats curiously around you!","¡Mew se ríe y flota a tu alrededor con curiosidad!","Mew rit et flotte autour de toi avec curiosité !","ミュウは笑いながら、周りをふわふわ飛んでいる！","Mew kichert und schwebt neugierig um dich herum!","Mew ri e flutua ao seu redor com curiosidade!","梦幻咯咯笑着，好奇地绕着你漂浮！","Mew ridacchia e ti fluttua attorno curioso!"],["Karpador platscht nur hilflos herum!","Magikarp just splashes helplessly!","¡Magikarp solo salpica sin hacer nada!","Magicarpe ne fait que s'agiter !","コイキングはただはねている！","Karpador platscht nur hilflos herum!","Magikarp só se debate sem jeito!","鲤鱼王只能无助地跃起！","Magikarp si agita senza risultato!"],["1-1 Wiese","1-1 Meadow","1-1 Pradera","1-1 Prairie","1-1 草原","1-1 Wiese","1-1 Prado","1-1 草地","1-1 Prato"],["1-2 Wolken","1-2 Clouds","1-2 Nubes","1-2 Nuages","1-2 雲","1-2 Wolken","1-2 Nuvens","1-2 云端","1-2 Nuvole"],["1-3 Tempel","1-3 Temple","1-3 Templo","1-3 Temple","1-3 神殿","1-3 Tempel","1-3 Templo","1-3 神殿","1-3 Tempio"],["1-4 Dschungel","1-4 Jungle","1-4 Jungla","1-4 Jungle","1-4 ジャングル","1-4 Dschungel","1-4 Selva","1-4 丛林","1-4 Giungla"],["1-5 Stadt","1-5 City","1-5 Ciudad","1-5 Ville","1-5 街","1-5 Stadt","1-5 Cidade","1-5 城市","1-5 Città"],["1-6 Tauchsee & Gipfel","1-6 Lake & Summit","1-6 Lago y cima","1-6 Lac et sommet","1-6 湖と山頂","1-6 Tauchsee & Gipfel","1-6 Lago e Pico","1-6 湖泊与山巅","1-6 Lago e vetta"],["1-7 Gurkenburg","1-7 Cucumber Castle","1-7 Castillo Pepino","1-7 Château Concombre","1-7 キュウリ城","1-7 Gurkenburg","1-7 Castelo do Pepino","1-7 黄瓜城堡","1-7 Castello dei cetrioli"],["1-8 Kunstmuseum","1-8 Art Museum","1-8 Museo de arte","1-8 Musée d'art","1-8 美術館","1-8 Kunstmuseum","1-8 Museu de Arte","1-8 美术馆","1-8 Museo d'arte"],["Pikachu, ich wähle dich!","Pikachu, I choose you!","¡Pikachu, te elijo a ti!","Pikachu, je te choisis !","ピカチュウ、きみにきめた！","Pikachu, ich wähle dich!","Pikachu, eu escolho você!","皮卡丘，就决定是你了！","Pikachu, scelgo te!"],["X wirft einen Pokéball auf wilde Pokémon und startet einen Kampf.","Press X to throw a Poké Ball at wild Pokémon and start a battle.","Pulsa X para lanzar una Poké Ball a un Pokémon e iniciar un combate.","X lance une Poké Ball sur un Pokémon sauvage pour lancer un combat.","Xで野生のポケモンにボールを投げるとバトル開始。","X wirft einen Pokéball auf wilde Pokémon und startet einen Kampf.","Aperte X para lançar uma Poké Bola em um Pokémon selvagem e iniciar uma batalha.","按X向野生宝可梦扔出精灵球，开始战斗。","Premi X per lanciare una Poké Ball a un Pokémon selvatico e iniziare una lotta."],["Im Kampf: Schwächen, dann Pokéball werfen und fangen!","In battle: weaken it, then throw a Poké Ball to catch it!","En combate: ¡debilítalo y lanza una Poké Ball para capturarlo!","En combat : affaiblis-le, puis lance une Poké Ball pour le capturer !","バトルで弱らせて、ボールで捕まえよう！","Im Kampf: Schwächen, dann Pokéball werfen und fangen!","Na batalha: enfraqueça e lance uma Poké Bola para capturar!","战斗时先削弱对手，再扔出精灵球捕捉！","In lotta: indeboliscilo, poi lancia una Poké Ball per catturarlo!"],["Wolkenlevel!","Cloud level!","¡Nivel de las nubes!","Niveau des nuages !","雲のステージ！","Wolkenlevel!","Fase das nuvens!","云端关卡！","Livello delle nuvole!"],["Hol dir den lila MEISTERBALL und fang damit das MEW am Start.","Get the purple MASTER BALL and catch MEW near the start.","Recoge la MASTER BALL morada y captura a MEW al inicio.","Prends la MASTER BALL violette pour capturer MEW au départ.","紫のマスターボールでスタート近くのミュウを捕まえよう。","Hol dir den lila MEISTERBALL und fang damit das MEW am Start.","Pegue a MASTER BOLA roxa e capture o MEW perto do início.","拿到紫色大师球，捉住起点附近的梦幻。","Prendi la MASTER BALL viola e cattura MEW vicino all'inizio."],["Im Kampf: POKÉBALL wählen, der Meisterball trifft immer!","In battle: choose POKÉ BALL. The Master Ball never fails!","En combate: elige POKÉ BALL. ¡La Master Ball nunca falla!","En combat : choisis POKÉ BALL. La Master Ball ne rate jamais !","バトルで「ボール」を選ぶと、マスターボールで必ず捕まる！","Im Kampf: POKÉBALL wählen, der Meisterball trifft immer!","Na batalha: escolha POKÉ BOLA. A Master Bola nunca falha!","战斗时选择精灵球。大师球绝不失手！","In lotta: scegli POKÉ BALL. La Master Ball non fallisce mai!"],["Tempelwelt!","Temple world!","¡Mundo del templo!","Monde du temple !","神殿の世界！","Tempelwelt!","Mundo do templo!","神殿世界！","Mondo del tempio!"],["Vorsicht vor Stacheln und Lava. Elektro wirkt nicht gegen Boden-Pokémon!","Watch out for spikes and lava. Electric moves cannot hit Ground Pokémon!","Cuidado con pinchos y lava. ¡El tipo Eléctrico no afecta al tipo Tierra!","Attention aux pics et à la lave. L'Électrik n'affecte pas le type Sol !","トゲと溶岩に注意。じめんタイプにでんき技は効かない！","Vorsicht vor Stacheln und Lava. Elektro wirkt nicht gegen Boden-Pokémon!","Cuidado com espinhos e lava. Ataques elétricos não atingem Pokémon de Terra!","小心尖刺和熔岩。电属性招式对地面属性宝可梦无效！","Attento a spine e lava. Le mosse Elettro non colpiscono i Pokémon Terra!"],["Am Ende wartet der Tempelwächter ONIX. Wasser und Pflanze sind sehr effektiv!","ONIX guards the temple exit. Water and Grass moves are super effective!","ONIX guarda la salida. ¡Agua y Planta son supereficaces!","ONIX garde la sortie. L'Eau et la Plante sont super efficaces !","出口の番人はイワーク。みず・くさ技が効果抜群！","Am Ende wartet der Tempelwächter ONIX. Wasser und Pflanze sind sehr effektiv!","ONIX guarda a saída do templo. Ataques de Água e Planta são supereficazes!","大岩蛇守着神殿出口。水和草属性招式效果绝佳！","ONIX sorveglia l'uscita del tempio. Le mosse Acqua ed Erba sono superefficaci!"],["Dschungelwelt!","Jungle world!","¡Mundo de la jungla!","Monde de la jungle !","ジャングルの世界！","Dschungelwelt!","Mundo da selva!","丛林世界！","Mondo della giungla!"],["Viele Pokémon schlafen hier: leise vorbei oder im Schlaf fangen. Sammle Stöcke!","Many Pokémon sleep here: sneak past or catch them asleep. Collect sticks!","Muchos Pokémon duermen: pasa sin ruido o captúralos dormidos. ¡Recoge palos!","Des Pokémon dorment : passe discrètement ou capture-les. Ramasse des bâtons !","眠るポケモンのそばを静かに通るか、寝ている間に捕まえよう。木の枝も集めよう！","Viele Pokémon schlafen hier: leise vorbei oder im Schlaf fangen. Sammle Stöcke!","Muitos Pokémon dormem aqui: passe em silêncio ou capture-os dormindo. Colete gravetos!","这里有很多睡着的宝可梦：悄悄绕过或趁睡着时捕捉。别忘了收集树枝！","Molti Pokémon dormono qui: passa di nascosto o catturali nel sonno. Raccogli bastoni!"],["5 Stöcke + Taste B = Stockhaus: Pause, volle Heilung und Checkpoint.","5 sticks + B = a hut: rest, full healing and a checkpoint.","5 palos + B = cabaña: descanso, curación y punto de control.","5 bâtons + B = cabane : repos, soins complets et point de contrôle.","木の枝5本＋Bで小屋。ひと休み・全回復・チェックポイント！","5 Stöcke + Taste B = Stockhaus: Pause, volle Heilung und Checkpoint.","5 gravetos + B = cabana: descanso, cura total e ponto de controle.","5根树枝+B键=小屋：休息、完全恢复并设置检查点。","5 bastoni + B = capanna: riposo, cura completa e checkpoint."],["Stadtwelt!","City world!","¡Mundo de la ciudad!","Monde de la ville !","街の世界！","Stadtwelt!","Mundo da cidade!","城市世界！","Mondo della città!"],["Türen mit ↓ betreten, unsichtbare Blöcke anspringen, manche Wände sind nur Fassade.","Enter doors with ↓, jump into hidden blocks; some walls hide passages.","Entra por puertas con ↓, salta a bloques invisibles: algunas paredes ocultan caminos.","Entre avec ↓, saute dans les blocs invisibles : certains murs cachent des passages.","↓で扉へ。見えないブロックを探そう。通り抜けられる壁もある！","Türen mit ↓ betreten, unsichtbare Blöcke anspringen, manche Wände sind nur Fassade.","Entre nas portas com ↓, pule nos blocos invisíveis; algumas paredes escondem passagens.","按↓进入门，跳起撞出隐藏方块；有些墙后藏着通道。","Entra nelle porte con ↓, salta nei blocchi nascosti; alcuni muri celano passaggi."],["In der Mitte wartet LAMUS, am Ende der Stadtkönig LASHU KING. Finde alle ★ Geheimnisse!","SLOWBRO waits halfway, SLOWKING at the end. Find every ★ secret!","SLOWBRO espera a mitad de camino y SLOWKING al final. ¡Busca los secretos ★!","FLAGADOSS t'attend à mi-chemin, ROIGADA à la fin. Trouve tous les secrets ★ !","途中にヤドラン、最後にヤドキング。★の秘密を全部見つけよう！","In der Mitte wartet LAMUS, am Ende der Stadtkönig LASHU KING. Finde alle ★ Geheimnisse!","SLOWBRO espera no meio, SLOWKING no fim. Encontre todos os segredos ★!","呆壳兽守在中途，呆呆王守在终点。找到所有★秘密！","SLOWBRO ti aspetta a metà strada, SLOWKING alla fine. Trova tutti i segreti ★!"],["Tauchsee & Gipfel!","Diving Lake & Summit!","¡Lago y cima!","Lac et sommet !","湖にもぐって山頂へ！","Tauchsee & Gipfel!","Lago de Mergulho e Pico!","潜水湖与山巅！","Lago sommerso e vetta!"],["Tauchen: Space schwimmt nach oben, achte auf die Luft. Rohre mit ↓ betreten.","Dive: Space swims upward; watch your air. Enter pipes with ↓.","Bucea: Espacio para subir; vigila el aire. Entra en tuberías con ↓.","Plongée : Espace pour remonter, surveille l'air. Entre dans les tuyaux avec ↓.","Spaceで上に泳ぐ。空気に注意。↓で土管に入ろう。","Tauchen: Space schwimmt nach oben, achte auf die Luft. Rohre mit ↓ betreten.","Mergulho: Espaço para subir; cuide do ar. Entre nos canos com ↓.","潜水：空格向上游，注意氧气。按↓进入水管。","In acqua: Spazio per nuotare in alto; controlla l'aria. Entra nei tubi con ↓."],["Garados bewacht den See, Arktos den Gipfel. Baue aus Stöcken ein Haus, klettere über bewegte Blöcke oder fliege mit dem Ballon zum Tor!","Lapras guards the lake, Articuno the summit. Build a hut, climb moving blocks or fly to the gate by balloon!","Lapras guarda el lago y Articuno la cima. ¡Construye, sube a bloques móviles o vuela en globo hasta la puerta!","Lokhlass garde le lac, Artikodin le sommet. Construis une cabane, grimpe sur les blocs ou vole en ballon !","ラプラスが湖を、フリーザーが山頂を守る。小屋を建てたり、動く足場や気球で門を目指そう！","Garados bewacht den See, Arktos den Gipfel. Baue aus Stöcken ein Haus, klettere über bewegte Blöcke oder fliege mit dem Ballon zum Tor!","Lapras guarda o lago, Articuno o pico. Construa uma cabana, suba em blocos móveis ou voe de balão até o portão!","拉普拉斯守着湖泊，急冻鸟守着山巅。建造小屋、爬上移动方块，或乘气球飞向大门！","Lapras sorveglia il lago, Articuno la vetta. Costruisci una capanna, sali sui blocchi mobili o vola al cancello in mongolfiera!"],["Eine geheime Luftkammer! Vorsicht, Seeigel: Spring drüber, dahinter liegt der goldene Schlüssel.","A secret air pocket! Jump over the sea urchins to reach the golden key.","¡Una cámara de aire secreta! Salta sobre los erizos para llegar a la llave dorada.","Une poche d'air secrète ! Saute par-dessus les oursins pour trouver la clé dorée.","秘密の空気部屋！ウニを飛び越えた先に金のカギがある。","Eine geheime Luftkammer! Vorsicht, Seeigel: Spring drüber, dahinter liegt der goldene Schlüssel.","Uma bolsa de ar secreta! Pule os ouriços-do-mar para alcançar a chave dourada.","秘密气室！跳过海胆，拿到后面的金钥匙。","Una sacca d'aria segreta! Salta i ricci di mare per raggiungere la chiave d'oro."],["Der Wald! Irgendwo hier führt ein Rohr in einen verborgenen Raum.","The forest! A pipe around here leads to a hidden room.","¡El bosque! Una tubería lleva a una sala oculta.","La forêt ! Un tuyau mène à une salle cachée.","森だ！どこかの土管が隠し部屋につながっている。","Der Wald! Irgendwo hier führt ein Rohr in einen verborgenen Raum.","A floresta! Um cano por aqui leva a uma sala escondida.","森林！这附近有根水管通向隐藏房间。","La foresta! Un tubo qui vicino conduce a una stanza nascosta."],["Der Ballon fliegt mit ↑ und ↓, links und rechts lenken, Space zum Abspringen.","Balloon: ↑ ↓ to rise and fall, ← → to steer, Space to jump off.","Globo: ↑ ↓ para subir y bajar, ← → para dirigir, Espacio para saltar.","Ballon : ↑ ↓ pour monter et descendre, ← → pour diriger, Espace pour sauter.","気球は↑ ↓で上下、← →で移動、Spaceで飛び降りる。","Der Ballon fliegt mit ↑ und ↓, links und rechts lenken, Space zum Abspringen.","Balão: ↑ ↓ para subir e descer, ← → para pilotar, Espaço para saltar.","气球：↑ ↓升降，← →转向，空格跳下。","Mongolfiera: ↑ ↓ per salire e scendere, ← → per guidare, Spazio per saltare giù."],["Der Gipfelwächter bewacht das Tor. Dahinter wartet das Ziel, der Schlüssel liegt tief unter Wasser...","The summit guardian blocks the gate. The goal lies beyond; the key is deep underwater...","El guardián protege la puerta. Detrás está la meta; la llave está bajo el agua...","Le gardien protège la porte. L'arrivée est derrière ; la clé est au fond de l'eau…","山頂の番人が門を守っている。その先がゴール。カギは深い水の中…","Der Gipfelwächter bewacht das Tor. Dahinter wartet das Ziel, der Schlüssel liegt tief unter Wasser...","O guardião do pico bloqueia o portão. O objetivo fica além; a chave está nas profundezas...","山巅守卫挡住了大门。终点在门后，钥匙则藏在深水中……","Il guardiano della vetta blocca il cancello. Il traguardo è oltre; la chiave è in fondo al lago..."],["Gruselige Gurkenburg! Buh!","Spooky Cucumber Castle! Boo!","¡Castillo Pepino encantado! ¡Buu!","L'effrayant Château Concombre ! Bouh !","不気味なキュウリ城！わっ！","Gruselige Gurkenburg! Buh!","Castelo do Pepino assombrado! Bu!","阴森的黄瓜城堡！呜！","Castello dei cetrioli stregato! Buh!"],["Kürbisse versperren die Türen: Sammle Gurken und wirf sie mit G, dann flitzen die Kürbisse davon.","Pumpkins block the doors: collect cucumbers and throw with G to scare them off.","Las calabazas bloquean las puertas: recoge pepinos y lánzalos con G para espantarlas.","Les citrouilles bloquent les portes : ramasse des concombres et lance-les avec G.","扉をふさぐカボチャには、集めたキュウリをGで投げよう！","Kürbisse versperren die Türen: Sammle Gurken und wirf sie mit G, dann flitzen die Kürbisse davon.","Abóboras bloqueiam as portas: colete pepinos e lance com G para espantá-las.","南瓜挡住了门：收集黄瓜，按G扔出，把它们吓跑。","Le zucche bloccano le porte: raccogli cetrioli e lanciali con G per scacciarle."],["Der geheime Eingang oben ist nur mit dem Heißluftballon zu erreichen.","Reach the secret entrance above using the hot-air balloon.","Solo puedes llegar a la entrada secreta de arriba en globo.","L'entrée secrète en hauteur n'est accessible qu'en montgolfière.","高いところの秘密の入口には気球でしか行けない。","Der geheime Eingang oben ist nur mit dem Heißluftballon zu erreichen.","Alcance a entrada secreta lá em cima usando o balão de ar quente.","乘坐热气球，到达高处的秘密入口。","Raggiungi l'ingresso segreto in alto con la mongolfiera."],["Der geheime Eingang liegt hoch oben in der Luft. Nimm den Ballon und vergiss die Gurken nicht!","The secret entrance is high in the air. Take the balloon and bring cucumbers!","La entrada secreta está muy arriba. ¡Sube al globo y lleva pepinos!","L'entrée secrète est tout en haut. Prends le ballon et des concombres !","秘密の入口は空高く。キュウリを忘れずに気球へ！","Der geheime Eingang liegt hoch oben in der Luft. Nimm den Ballon und vergiss die Gurken nicht!","A entrada secreta está no alto. Pegue o balão e leve pepinos!","秘密入口在高空中。坐上气球，别忘了带黄瓜！","L'ingresso segreto è in alto. Prendi la mongolfiera e porta dei cetrioli!"],["Kunstmuseum auf drei Stockwerken!","An art museum on three floors!","¡Un museo de arte de tres plantas!","Un musée d'art sur trois étages !","3階建ての美術館！","Kunstmuseum auf drei Stockwerken!","Um museu de arte com três andares!","三层楼的美术馆！","Un museo d'arte su tre piani!"],["Originale von Künstlerinnen aus 900 Jahren. Leuchtende Gemälde sind Portale, einige führen in geheime Kabinette.","Art by women across 900 years. Glowing paintings are portals to secret galleries.","Arte de mujeres de 900 años. Los cuadros luminosos llevan a galerías secretas.","900 ans d'art au féminin. Les tableaux lumineux mènent à des salles secrètes.","900年にわたる女性画家の作品。光る絵は秘密の部屋への入口。","Originale von Künstlerinnen aus 900 Jahren. Leuchtende Gemälde sind Portale, einige führen in geheime Kabinette.","Arte de mulheres ao longo de 900 anos. Quadros brilhantes são portais para galerias secretas.","跨越900年的女性艺术作品。发光的画作是通向秘密展厅的传送门。","Arte di donne lungo 900 anni. I dipinti luminosi sono portali verso gallerie segrete."],["Sammle 5 goldene Sterne: Dann bekommt deine Figur eine Krone und 5 Level dazu!","Collect 5 golden stars for a crown and 5 bonus levels!","¡Consigue 5 estrellas doradas para una corona y 5 niveles extra!","Ramasse 5 étoiles dorées pour une couronne et 5 niveaux bonus !","金の星を5個集めると王冠とレベル+5を獲得！","Sammle 5 goldene Sterne: Dann bekommt deine Figur eine Krone und 5 Level dazu!","Colete 5 estrelas douradas para ganhar uma coroa e 5 níveis extras!","收集5颗金星，获得王冠并提升5级！","Raccogli 5 stelle d'oro per una corona e 5 livelli bonus!"],["Willkommen im Museum auf drei Stockwerken! Vor leuchtenden Gemälden ↓ drücken: Sie sind Portale, manche führen in verborgene Kabinette. Sammle 5 Sterne für die Krone!","Welcome to the three-floor museum! Press ↓ by glowing paintings to enter portals. Find hidden galleries and collect 5 stars for a crown!","¡Bienvenido al museo! Pulsa ↓ ante cuadros luminosos: son portales a salas ocultas. ¡Recoge 5 estrellas para una corona!","Bienvenue au musée ! Appuie sur ↓ devant les tableaux lumineux : ce sont des portails. Trouve 5 étoiles pour la couronne !","3階建ての美術館へようこそ！光る絵の前で↓を押すと隠し部屋へ。星5個で王冠を手に入れよう！","Willkommen im Museum auf drei Stockwerken! Vor leuchtenden Gemälden ↓ drücken: Sie sind Portale, manche führen in verborgene Kabinette. Sammle 5 Sterne für die Krone!","Bem-vindo ao museu de três andares! Aperte ↓ perto dos quadros brilhantes para entrar nos portais. Ache galerias secretas e colete 5 estrelas para ganhar uma coroa!","欢迎来到三层美术馆！在发光的画作旁按↓进入传送门。寻找隐藏展厅，收集5颗星星获得王冠！","Benvenuto nel museo su tre piani! Premi ↓ vicino ai dipinti luminosi per entrare nei portali. Trova le gallerie segrete e raccogli 5 stelle per una corona!"],["Der Tempelwächter","The temple guardian","El guardián del templo","Le gardien du temple","神殿の番人","Der Tempelwächter","O guardião do templo","神殿守卫","Il guardiano del tempio"],["Der schlafende Riese","The sleeping giant","El gigante dormido","Le géant endormi","眠れる巨人","Der schlafende Riese","O gigante adormecido","沉睡的巨人","Il gigante addormentato"],["Der Dschungelkönig","The jungle king","El rey de la jungla","Le roi de la jungle","ジャングルの王","Der Dschungelkönig","O rei da selva","丛林之王","Il re della giungla"],["Der Stadtwächter","The city guardian","El guardián de la ciudad","Le gardien de la ville","街の番人","Der Stadtwächter","O guardião da cidade","城市守卫","Il guardiano della città"],["Der Stadtkönig","The city king","El rey de la ciudad","Le roi de la ville","街の王","Der Stadtkönig","O rei da cidade","城市之王","Il re della città"],["Der Seewächter","The lake guardian","El guardián del lago","Le gardien du lac","湖の番人","Der Seewächter","O guardião do lago","湖泊守卫","Il guardiano del lago"],["Der Gipfelwächter","The summit guardian","El guardián de la cima","Le gardien du sommet","山頂の番人","Der Gipfelwächter","O guardião do pico","山巅守卫","Il guardiano della vetta"],["Der Burggeist","The castle ghost","El fantasma del castillo","Le fantôme du château","城の幽霊","Der Burggeist","O fantasma do castelo","城堡幽灵","Il fantasma del castello"],["Der Museumswächter","The museum guardian","El guardián del museo","Le gardien du musée","美術館の番人","Der Museumswächter","O guardião do museu","美术馆守卫","Il guardiano del museo"],["Tipp: Wasser- und Pflanzen-Attacken sind sehr effektiv gegen Gestein. Elektro wirkt nur schwach.","Tip: Water and Grass moves are super effective against Rock. Onix's Ground type blocks Electric moves.","Consejo: Agua y Planta son supereficaces contra Roca. El tipo Tierra de Onix bloquea Eléctrico.","Astuce : l'Eau et la Plante sont efficaces contre Roche. Le type Sol d'Onix bloque l'Électrik.","ヒント：いわにはみず・くさ技が効果抜群。イワークはじめんタイプでもあるので、でんき技は無効。","Tipp: Wasser- und Pflanzen-Attacken sind sehr effektiv gegen Gestein. Elektro wirkt nur schwach.","Dica: Água e Planta são supereficazes contra Pedra. O tipo Terra de Onix bloqueia ataques elétricos.","提示：水和草属性招式对岩石属性效果绝佳。大岩蛇的地面属性使电属性招式无效。","Consiglio: Acqua ed Erba sono superefficaci contro Roccia. Il tipo Terra di Onix blocca le mosse Elettro."],["Tipp: Relaxo schläft noch ein paar Runden. Schlafende Pokémon lassen sich leichter fangen!","Tip: Snorlax will sleep for a few turns. Sleeping Pokémon are easier to catch!","Consejo: Snorlax dormirá unos turnos. ¡Los Pokémon dormidos son más fáciles de capturar!","Astuce : Ronflex dort encore quelques tours. Les Pokémon endormis sont plus faciles à capturer !","ヒント：カビゴンは数ターン眠っている。眠るポケモンは捕まえやすい！","Tipp: Relaxo schläft noch ein paar Runden. Schlafende Pokémon lassen sich leichter fangen!","Dica: Snorlax dorme por alguns turnos. Pokémon dormindo são mais fáceis de capturar!","提示：卡比兽会睡上几个回合。睡着的宝可梦更容易捕捉！","Consiglio: Snorlax dormirà per qualche turno. I Pokémon addormentati sono più facili da catturare!"],["Tipp: Feuer- und Flug-Attacken sind sehr effektiv gegen Pflanze!","Tip: Fire and Flying moves are super effective against Grass!","Consejo: ¡Fuego y Volador son supereficaces contra Planta!","Astuce : le Feu et le Vol sont super efficaces contre Plante !","ヒント：くさタイプにはほのお・ひこう技が効果抜群！","Tipp: Feuer- und Flug-Attacken sind sehr effektiv gegen Pflanze!","Dica: Fogo e Voador são supereficazes contra Planta!","提示：火和飞行属性招式对草属性效果绝佳！","Consiglio: Fuoco e Volante sono superefficaci contro Erba!"],["Tipp: Lahmus ist Wasser und Psycho, ein Muschas hängt an seinem Schwanz. Elektro und Pflanze treffen doppelt, oder finde den Geheimgang vorbei!","Tip: Slowbro is Water/Psychic with a Shellder on its tail. Use Electric or Grass moves, or find a secret passage!","Consejo: Slowbro es Agua/Psíquico. Usa Eléctrico o Planta, ¡o busca un pasadizo para evitarlo!","Astuce : Flagadoss est Eau/Psy. Utilise l'Électrik ou la Plante, ou trouve un passage secret !","ヒント：ヤドランはみず・エスパー。でんき・くさ技を使うか、秘密の通路を探そう！","Tipp: Lahmus ist Wasser und Psycho, ein Muschas hängt an seinem Schwanz. Elektro und Pflanze treffen doppelt, oder finde den Geheimgang vorbei!","Dica: Slowbro é Água/Psíquico, com um Shellder na cauda. Use Elétrico ou Planta, ou procure uma passagem secreta!","提示：呆壳兽是水/超能力属性，尾巴上咬着大舌贝。使用电或草属性招式，或寻找秘密通道！","Consiglio: Slowbro è Acqua/Psico, con uno Shellder sulla coda. Usa Elettro o Erba, oppure cerca un passaggio segreto!"],["Tipp: Laschoking trägt das Muschas als Krone und ist klug und zäh. Elektro- und Pflanzen-Attacken sind sehr effektiv!","Tip: Slowking is clever and tough. Electric and Grass moves are super effective!","Consejo: Slowking es listo y resistente. ¡Eléctrico y Planta son supereficaces!","Astuce : Roigada est malin et coriace. L'Électrik et la Plante sont super efficaces !","ヒント：ヤドキングは賢くて手強い。でんき・くさ技が効果抜群！","Tipp: Laschoking trägt das Muschas als Krone und ist klug und zäh. Elektro- und Pflanzen-Attacken sind sehr effektiv!","Dica: Slowking é esperto e resistente. Elétrico e Planta são supereficazes!","提示：呆呆王聪明又强壮。电和草属性招式效果绝佳！","Consiglio: Slowking è furbo e resistente. Elettro ed Erba sono superefficaci!"],["Tipp: Lapras ist Wasser und Eis. Elektro, Pflanze und Gestein treffen doppelt! Oder finde das Rohr, das am Wächter vorbeiführt.","Tip: Lapras is Water/Ice. Use Electric, Grass or Rock, or find a pipe around the guardian.","Consejo: Lapras es Agua/Hielo. Usa Eléctrico, Planta o Roca, o busca una tubería para evitarlo.","Astuce : Lokhlass est Eau/Glace. Utilise l'Électrik, la Plante ou Roche, ou contourne-le par un tuyau.","ヒント：ラプラスはみず・こおり。でんき・くさ・いわ技が有効。土管で回り道もできる。","Tipp: Lapras ist Wasser und Eis. Elektro, Pflanze und Gestein treffen doppelt! Oder finde das Rohr, das am Wächter vorbeiführt.","Dica: Lapras é Água/Gelo. Use Elétrico, Planta ou Pedra, ou encontre um cano para passar pelo guardião.","提示：拉普拉斯是水/冰属性。使用电、草或岩石属性招式，或寻找水管绕过守卫。","Consiglio: Lapras è Acqua/Ghiaccio. Usa Elettro, Erba o Roccia, oppure cerca un tubo per aggirarlo."],["Tipp: Arktos ist Eis und Flug. Feuer- und Gestein-Attacken sind sehr effektiv!","Tip: Articuno is Ice/Flying. Fire and Rock moves are super effective!","Consejo: Articuno es Hielo/Volador. ¡Fuego y Roca son supereficaces!","Astuce : Artikodin est Glace/Vol. Le Feu et Roche sont super efficaces !","ヒント：フリーザーはこおり・ひこう。ほのお・いわ技が効果抜群！","Tipp: Arktos ist Eis und Flug. Feuer- und Gestein-Attacken sind sehr effektiv!","Dica: Articuno é Gelo/Voador. Fogo e Pedra são supereficazes!","提示：急冻鸟是冰/飞行属性。火和岩石属性招式效果绝佳！","Consiglio: Articuno è Ghiaccio/Volante. Fuoco e Roccia sono superefficaci!"],["Tipp: Gengar ist Geist und Gift. Normale Attacken wirken gar nicht, Psycho- und Geist-Attacken treffen doppelt!","Tip: Gengar is Ghost/Poison. Normal moves fail; Psychic and Ghost moves deal double damage!","Consejo: Gengar es Fantasma/Veneno. ¡Normal no le afecta; Psíquico y Fantasma hacen el doble!","Astuce : Ectoplasma est Spectre/Poison. Normal échoue ; Psy et Spectre font le double de dégâts !","ヒント：ゲンガーはゴースト・どく。ノーマル技は無効。エスパー・ゴースト技が効果抜群！","Tipp: Gengar ist Geist und Gift. Normale Attacken wirken gar nicht, Psycho- und Geist-Attacken treffen doppelt!","Dica: Gengar é Fantasma/Veneno. Normal não funciona; Psíquico e Fantasma causam dano dobrado!","提示：耿鬼是幽灵/毒属性。一般属性招式无效；超能力和幽灵属性造成双倍伤害！","Consiglio: Gengar è Spettro/Veleno. Normale non funziona; Psico e Spettro infliggono danni doppi!"],["Tipp: Mewtu ist ein Psycho-Pokémon. Geist-Attacken (zum Beispiel von Nebulak) treffen doppelt!","Tip: Mewtwo is Psychic. Ghost moves, such as Gastly's, deal double damage!","Consejo: Mewtwo es Psíquico. ¡Los ataques Fantasma, como los de Gastly, hacen el doble!","Astuce : Mewtwo est Psy. Les attaques Spectre, comme celles de Fantominus, font le double !","ヒント：ミュウツーはエスパー。ゴースなどのゴースト技が効果抜群！","Tipp: Mewtu ist ein Psycho-Pokémon. Geist-Attacken (zum Beispiel von Nebulak) treffen doppelt!","Dica: Mewtwo é Psíquico. Ataques Fantasma, como os de Gastly, causam dano dobrado!","提示：超梦是超能力属性。幽灵属性招式（例如鬼斯的招式）造成双倍伤害！","Consiglio: Mewtwo è Psico. Le mosse Spettro, come quelle di Gastly, infliggono danni doppi!"],["Mittelalter","Middle Ages","Edad Media","Moyen Âge","中世","Mittelalter","Idade Média","中世纪","Medioevo"],["Renaissance","Renaissance","Renacimiento","Renaissance","ルネサンス","Renaissance","Renascimento","文艺复兴","Rinascimento"],["Kabinett","Gallery","Gabinete","Cabinet","小展示室","Kabinett","Galeria","展厅","Galleria"],["Rokoko & Klassizismus","Rococo & Neoclassicism","Rococó y Neoclasicismo","Rococo et néoclassicisme","ロココと新古典主義","Rokoko & Klassizismus","Rococó e Neoclassicismo","洛可可与新古典主义","Rococò e Neoclassicismo"],["Barock","Baroque","Barroco","Baroque","バロック","Barock","Barroco","巴洛克","Barocco"],["19. Jahrhundert","19th century","Siglo XIX","XIXe siècle","19世紀","19. Jahrhundert","Século XIX","19世纪","XIX secolo"],["Moderne","Modern art","Arte moderno","Art moderne","近代美術","Moderne","Arte moderna","现代艺术","Arte moderna"],["Rokoko","Rococo","Rococó","Rococo","ロココ","Rokoko","Rococó","洛可可","Rococò"],["Klassizismus","Neoclassicism","Neoclasicismo","Néoclassicisme","新古典主義","Klassizismus","Neoclassicismo","新古典主义","Neoclassicismo"],["Realismus","Realism","Realismo","Réalisme","写実主義","Realismus","Realismo","现实主义","Realismo"],["Impressionismus","Impressionism","Impresionismo","Impressionnisme","印象派","Impressionismus","Impressionismo","印象派","Impressionismo"],["Expressionismus","Expressionism","Expresionismo","Expressionnisme","表現主義","Expressionismus","Expressionismo","表现主义","Espressionismo"],["Moderne (Abstraktion)","Modern art (abstract)","Arte moderno (abstracción)","Art moderne (abstraction)","近代美術（抽象）","Moderne (Abstraktion)","Arte moderna (abstrata)","现代艺术（抽象）","Arte moderna (astratta)"],["nur durch ein Gemälde erreichbar","enter through a painting","entra por un cuadro","entrée par un tableau","絵を通って入る","nur durch ein Gemälde erreichbar","entre por uma pintura","从画作进入","entra attraverso un dipinto"],["Werke von Künstlerinnen","Art by women","Obras de mujeres artistas","Œuvres d'artistes femmes","女性画家の作品","Werke von Künstlerinnen","Arte de mulheres","女性艺术家作品","Arte di donne"],["Kunstwerk","Artwork","Obra de arte","Œuvre d'art","美術作品","Kunstwerk","Obra de arte","艺术作品","Opera d'arte"],["Hildegard empfängt eine Vision (Scivias)","Hildegard receives a vision (Scivias)","Hildegarda recibe una visión (Scivias)","Hildegarde reçoit une vision (Scivias)","幻視を受けるヒルデガルト（スキヴィアス）","Hildegard empfängt eine Vision (Scivias)","Hildegard recebe uma visão (Scivias)","希尔德加德领受异象（Scivias）","Ildegarda riceve una visione (Scivias)"],["Das Schachspiel","The Chess Game","La partida de ajedrez","La Partie d'échecs","チェスをする姉妹","Das Schachspiel","O Jogo de Xadrez","国际象棋游戏","La partita a scacchi"],["Selbstbildnis am Spinett","Self-Portrait at the Spinet","Autorretrato con espineta","Autoportrait à l'épinette","スピネットを弾く自画像","Selbstbildnis am Spinett","Autorretrato à Espineta","斯皮内琴前的自画像","Autoritratto alla spinetta"],["Selbstbildnis als Allegorie der Malerei","Self-Portrait as the Allegory of Painting","Autorretrato como alegoría de la pintura","Autoportrait en allégorie de la peinture","絵画の寓意としての自画像","Selbstbildnis als Allegorie der Malerei","Autorretrato como Alegoria da Pintura","绘画寓言自画像","Autoritratto come allegoria della pittura"],["Selbstbildnis","Self-Portrait","Autorretrato","Autoportrait","自画像","Selbstbildnis","Autorretrato","自画像","Autoritratto"],["Stillleben mit Käse, Mandeln und Brezeln","Still Life with Cheeses, Almonds and Pretzels","Bodegón con quesos, almendras y pretzels","Nature morte aux fromages, amandes et bretzels","チーズ、アーモンド、プレッツェルの静物","Stillleben mit Käse, Mandeln und Brezeln","Natureza-morta com Queijos, Amêndoas e Pretzels","奶酪、杏仁和椒盐卷饼静物","Natura morta con formaggi, mandorle e pretzel"],["Blumen in einer Vase","Flowers in a Vase","Flores en un jarrón","Fleurs dans un vase","花瓶の花","Blumen in einer Vase","Flores em um Vaso","瓶花","Fiori in un vaso"],["Selbstbildnis mit Strohhut","Self-Portrait in a Straw Hat","Autorretrato con sombrero de paja","Autoportrait au chapeau de paille","麦わら帽子の自画像","Selbstbildnis mit Strohhut","Autorretrato com Chapéu de Palha","戴草帽的自画像","Autoritratto con cappello di paglia"],["Selbstbildnis am Scheideweg zwischen Musik und Malerei","Self-Portrait between Music and Painting","Autorretrato entre la música y la pintura","Autoportrait entre la musique et la peinture","音楽と絵画の間でためらう自画像","Selbstbildnis am Scheideweg zwischen Musik und Malerei","Autorretrato entre a Música e a Pintura","音乐与绘画之间的自画像","Autoritratto tra la musica e la pittura"],["Der Pferdemarkt","The Horse Fair","La feria de caballos","Le Marché aux chevaux","馬市","Der Pferdemarkt","A Feira de Cavalos","马市","La fiera dei cavalli"],["Die Wiege","The Cradle","La cuna","Le Berceau","ゆりかご","Die Wiege","O Berço","摇篮","La culla"],["Das Bad des Kindes","The Child's Bath","El baño del niño","Le Bain de l'enfant","子どもの入浴","Das Bad des Kindes","O Banho da Criança","儿童沐浴","Il bagno del bambino"],["Im Atelier","In the Studio","En el estudio","Dans l'atelier","アトリエにて","Im Atelier","No Ateliê","画室内","Nello studio"],["Selbstbildnis mit Hut und Schleier","Self-Portrait with Hat and Veil","Autorretrato con sombrero y velo","Autoportrait au chapeau et au voile","帽子とベールの自画像","Selbstbildnis mit Hut und Schleier","Autorretrato com Chapéu e Véu","戴帽子和面纱的自画像","Autoritratto con cappello e velo"],["Selbstbildnis (Lithografie)","Self-Portrait (lithograph)","Autorretrato (litografía)","Autoportrait (lithographie)","自画像（リトグラフ）","Selbstbildnis (Lithografie)","Autorretrato (litografia)","自画像（石版画）","Autoritratto (litografia)"],["Die zehn Größten, Nr. 9, Das Alter","The Ten Largest, No. 9, Old Age","Los diez mayores, n.º 9, La vejez","Les Dix Plus Grands, n° 9, La Vieillesse","10点の大型作品 No.9 老年期","Die zehn Größten, Nr. 9, Das Alter","Os Dez Maiores, Nº 9, Velhice","最大的十幅，第9号，老年","I dieci più grandi, n. 9, Vecchiaia"],["Das blaue Zimmer","The Blue Room","La habitación azul","La Chambre bleue","青い部屋","Das blaue Zimmer","O Quarto Azul","蓝色房间","La stanza blu"],["um {0}","c. {0}","hacia {0}","vers {0}","{0}年頃","um {0}","c. {0}","约{0}年","ca. {0}"],["Geheimgang durch die Fassade!","Secret passage through the wall!","¡Pasadizo secreto en la fachada!","Passage secret dans la façade !","壁の中に秘密の通路！","Geheimgang durch die Fassade!","Passagem secreta pela parede!","穿墙秘密通道！","Passaggio segreto nel muro!"],["Geheimes Ziel erreicht!","Secret goal reached!","¡Meta secreta alcanzada!","Arrivée secrète atteinte !","秘密のゴールに到着！","Geheimes Ziel erreicht!","Objetivo secreto alcançado!","到达秘密终点！","Traguardo segreto raggiunto!"],["Du hast den goldenen Schlüssel gefunden!","You found the golden key!","¡Has encontrado la llave dorada!","Tu as trouvé la clé dorée !","金のカギを見つけた！","Du hast den goldenen Schlüssel gefunden!","Você achou a chave dourada!","你找到了金钥匙！","Hai trovato la chiave d'oro!"],["Versteckter Block!","Hidden block!","¡Bloque oculto!","Bloc caché !","隠しブロック！","Versteckter Block!","Bloco escondido!","隐藏方块！","Blocco nascosto!"],["Lv{0}","Lv{0}","Nv{0}","Niv{0}","Lv{0}","Lv{0}","Nv{0}","{0}级","Lv{0}"],["um","c.","hacia","vers","頃","um","c.","约","ca."],["1-9 Elektrizitätswerk","1-9 Power Plant","1-9 Central eléctrica","1-9 Centrale électrique","1-9 発電所","1-9 Elektrizitätswerk","1-9 Usina Elétrica","1-9 发电厂","1-9 Centrale elettrica"],["Team Rakete hat das Elektrizitätswerk übernommen!","Team Rocket has taken over the power plant!","¡El Team Rocket ha tomado la central eléctrica!","La Team Rocket a pris la centrale électrique !","ロケット団が発電所を占拠した！","Team Rakete hat das Elektrizitätswerk übernommen!","A Equipe Rocket tomou a usina elétrica!","火箭队占领了发电厂！","Il Team Rocket ha occupato la centrale elettrica!"],["Drücke E an einem Terminal ⚡, um den Strom einzuschalten und die Gittertore zu öffnen.","Press E at a terminal ⚡ to turn on the power and open the gates.","Pulsa E junto a un terminal ⚡ para activar la corriente y abrir las rejas.","Appuie sur E près d'un terminal ⚡ pour rétablir le courant et ouvrir les grilles.","端末⚡の近くでEを押すと電源が入り、ゲートが開く。","Drücke E an einem Terminal ⚡, um den Strom einzuschalten und die Gittertore zu öffnen.","Aperte E em um terminal ⚡ para ligar a energia e abrir os portões.","在终端⚡旁按E，接通电源并打开栅栏门。","Premi E vicino a un terminale ⚡ per accendere la corrente e aprire i cancelli."],["Am Ende lauert Giovanni, der Chef von Team Rakete. Boden- und Kampf-Attacken treffen ihn schwer!","Giovanni, Team Rocket's boss, waits at the end. Ground and Fighting moves hit him hard!","Al final espera Giovanni, jefe del Team Rocket. ¡Los ataques Tierra y Lucha lo golpean fuerte!","Giovanni, le chef de la Team Rocket, attend à la fin. Les attaques Sol et Combat le frappent fort !","最後にはロケット団のボス、サカキが待つ。じめん・かくとう技で大ダメージ！","Am Ende lauert Giovanni, der Chef von Team Rakete. Boden- und Kampf-Attacken treffen ihn schwer!","Giovanni, chefe da Equipe Rocket, espera no fim. Ataques de Terra e Lutador acertam forte!","火箭队首领坂木在终点等着。地面和格斗属性招式能重创他！","Alla fine ti aspetta Giovanni, il capo del Team Rocket. Le mosse Terra e Lotta lo colpiscono duramente!"],["Strom eingeschaltet! Gittertore geöffnet.","Power on! Gates opened.","¡Corriente activada! Rejas abiertas.","Courant rétabli ! Grilles ouvertes.","電源オン！ゲートが開いた。","Strom eingeschaltet! Gittertore geöffnet.","Energia ligada! Portões abertos.","电源已接通！栅栏门打开了。","Corrente accesa! Cancelli aperti."],["Dieser Schalter ist bereits an.","This switch is already on.","Este interruptor ya está activado.","Cet interrupteur est déjà allumé.","このスイッチはもう入っている。","Dieser Schalter ist bereits an.","Este interruptor já está ligado.","这个开关已经打开了。","Questo interruttore è già acceso."],["Giovanni – Chef von Team Rakete","Giovanni – Team Rocket's boss","Giovanni – Jefe del Team Rocket","Giovanni – Chef de la Team Rocket","サカキ – ロケット団のボス","Giovanni – Chef von Team Rakete","Giovanni – Chefe da Equipe Rocket","坂木 – 火箭队首领","Giovanni – Capo del Team Rocket"],["Tipp: Giovanni ist Boden-Typ. Wasser- und Pflanzangriffe treffen ihn doppelt, Elektro-Attacken wirken gar nicht!","Tip: Giovanni is Ground type. Water and Grass deal double damage; Electric moves have no effect!","Consejo: Giovanni es de tipo Tierra. ¡Agua y Planta hacen daño doble; Eléctrico no tiene efecto!","Astuce : Giovanni est de type Sol. Eau et Plante infligent le double de dégâts ; Électrik est sans effet !","ヒント：サカキはじめんタイプ。みず・くさ技はダメージ2倍、でんき技は無効！","Tipp: Giovanni ist Boden-Typ. Wasser- und Pflanzangriffe treffen ihn doppelt, Elektro-Attacken wirken gar nicht!","Dica: Giovanni é do tipo Terra. Água e Planta causam dano dobrado; Elétrico não tem efeito!","提示：坂木是地面属性。水和草属性造成双倍伤害；电属性无效！","Consiglio: Giovanni è di tipo Terra. Acqua ed Erba fanno danni doppi; Elettro non ha effetto!"],["G: Gruppen","G: groups","G: grupos","G : groupes","G：グループ","G: Gruppen","G: grupos","G：小组","G: gruppi"],["Gruppen — {0!}","Groups — {0}","Grupos — {0}","Groupes — {0}","グループ — {0}","Gruppen — {0!}","Grupos — {0}","小组 — {0}","Gruppi — {0}"],["> Anzeigen \u003c","> View \u003c","> Ver \u003c","> Voir \u003c","> 表示 \u003c","> Anzeigen \u003c","> Ver \u003c","> 查看 \u003c","> Visualizza \u003c"],["Noch keine Gruppen.","No groups yet.","Todavía no hay grupos.","Pas encore de groupes.","まだグループはありません。","Noch keine Gruppen.","Nenhum grupo ainda.","还没有小组。","Nessun gruppo ancora."],["BEITRETEN","JOIN","UNIRSE","REJOINDRE","参加","BEITRETEN","ENTRAR","加入","UNISCITI"],["ERSTELLEN","CREATE","CREAR","CRÉER","作成","ERSTELLEN","CRIAR","创建","CREA"],["Code eingeben, Enter bestätigen","Enter code, press Enter","Escribe el código y pulsa Enter","Saisis le code, puis Entrée","コードを入力してEnter","Code eingeben, Enter bestätigen","Digite o código e aperte Enter","输入代码，按Enter确认","Scrivi il codice, premi Invio"],["Name, Enter bestätigen","Name, press Enter","Nombre, pulsa Enter","Nom, puis Entrée","名前を入力してEnter","Name, Enter bestätigen","Nome, aperte Enter","输入名称，按Enter确认","Nome, premi Invio"],["> Öffnen \u003c","> Open \u003c","> Abrir \u003c","> Ouvrir \u003c","> 開く \u003c","> Öffnen \u003c","> Abrir \u003c","> 打开 \u003c","> Apri \u003c"],["Laden","Loading","Cargando","Chargement","読み込み中","Laden","Carregando","加载中","Caricamento"],["Enter: bestätigen   Esc: abbrechen","Enter: confirm   Esc: cancel","Enter: confirmar   Esc: cancelar","Entrée : confirmer   Esc : annuler","Enter：決定　Esc：キャンセル","Enter: bestätigen   Esc: abbrechen","Enter: confirmar   Esc: cancelar","Enter：确认　Esc：取消","Invio: conferma   Esc: annulla"],["↑↓: navigieren   Space: öffnen   Del: verlassen   Esc: zurück","↑↓: navigate   Space: open   Del: leave   Esc: back","↑↓: navegar   Espacio: abrir   Supr: salir   Esc: volver","↑↓ : naviguer   Espace : ouvrir   Suppr : quitter   Esc : retour","↑↓：選択　Space：開く　Del：退出　Esc：戻る","↑↓: navigieren   Space: öffnen   Del: verlassen   Esc: zurück","↑↓: navegar   Espaço: abrir   Del: sair   Esc: voltar","↑↓：选择　空格：打开　Del：退出　Esc：返回","↑↓: naviga   Spazio: apri   Canc: esci   Esc: indietro"],["NAME","NAME","NOMBRE","NOM","名前","NAME","NOME","名字","NOME"],["LEVEL","LEVEL","NIVEL","NIVEAU","ステージ","LEVEL","FASE","关卡","LIVELLO"],["GEFANGEN","CAUGHT","CAPTURADOS","CAPTURÉS","捕まえた数","GEFANGEN","CAPTURADOS","已捕捉","CATTURATI"],["... und {0} weitere","... and {0} more","... y {0} más","... et {0} autres","…ほか{0}人","... und {0} weitere","... e mais {0}","……以及另外{0}人","... e altri {0}"],["Noch keine Mitglieder.","No members yet.","Todavía no hay miembros.","Pas encore de membres.","まだメンバーはいません。","Noch keine Mitglieder.","Nenhum membro ainda.","还没有成员。","Nessun membro ancora."],["Link kopiert!","Link copied!","¡Enlace copiado!","Lien copié !","リンクをコピーしました！","Link kopiert!","Link copiado!","链接已复制！","Link copiato!"],["Space: Link kopieren   Del: verlassen   Esc: zurück","Space: copy link   Del: leave   Esc: back","Espacio: copiar enlace   Supr: salir   Esc: volver","Espace : copier le lien   Suppr : quitter   Esc : retour","Space：リンクをコピー　Del：退出　Esc：戻る","Space: Link kopieren   Del: verlassen   Esc: zurück","Espaço: copiar link   Del: sair   Esc: voltar","空格：复制链接　Del：退出　Esc：返回","Spazio: copia link   Canc: esci   Esc: indietro"],["Beigetreten!","Joined!","¡Te has unido!","Groupe rejoint !","参加しました！","Beigetreten!","Você entrou!","加入成功！","Partecipazione riuscita!"],["Gruppe nicht gefunden.","Group not found.","Grupo no encontrado.","Groupe introuvable.","グループが見つかりません。","Gruppe nicht gefunden.","Grupo não encontrado.","未找到小组。","Gruppo non trovato."],["Schon Mitglied.","Already a member.","Ya eres miembro.","Déjà membre.","すでにメンバーです。","Schon Mitglied.","Você já é membro.","已经是成员了。","Sei già un membro."],["Gruppe ist voll.","Group is full.","El grupo está lleno.","Le groupe est complet.","グループは満員です。","Gruppe ist voll.","O grupo está cheio.","小组已满。","Il gruppo è pieno."],["Fehler beim Beitreten.","Could not join group.","No se pudo unir al grupo.","Impossible de rejoindre le groupe.","参加できませんでした。","Fehler beim Beitreten.","Não foi possível entrar no grupo.","无法加入小组。","Impossibile unirsi al gruppo."],["Erstellt! Code: {0!}","Created! Code: {0}","¡Creado! Código: {0}","Créé ! Code : {0}","作成しました！コード：{0}","Erstellt! Code: {0!}","Criado! Código: {0}","已创建！代码：{0}","Creato! Codice: {0}"],["Erstellen fehlgeschlagen.","Could not create group.","No se pudo crear el grupo.","Impossible de créer le groupe.","作成できませんでした。","Erstellen fehlgeschlagen.","Não foi possível criar o grupo.","无法创建小组。","Impossibile creare il gruppo."],["Laden fehlgeschlagen.","Loading failed.","Error al cargar.","Échec du chargement.","読み込みに失敗しました。","Laden fehlgeschlagen.","Falha ao carregar.","加载失败。","Caricamento non riuscito."],["Verlassen.","Left the group.","Has salido del grupo.","Groupe quitté.","グループを退出しました。","Verlassen.","Você saiu do grupo.","已退出小组。","Hai lasciato il gruppo."],["Verlassen fehlgeschlagen.","Could not leave group.","No se pudo salir del grupo.","Impossible de quitter le groupe.","退出できませんでした。","Verlassen fehlgeschlagen.","Não foi possível sair do grupo.","无法退出小组。","Impossibile lasciare il gruppo."],["Pikachu","Pikachu","Pikachu","Pikachu","ピカチュウ","Pikachu","Pikachu","皮卡丘","Pikachu"],["PIKACHU","PIKACHU","PIKACHU","PIKACHU","ピカチュウ","PIKACHU","PIKACHU","皮卡丘","PIKACHU"],["Raichu","Raichu","Raichu","Raichu","ライチュウ","Raichu","Raichu","雷丘","Raichu"],["RAICHU","RAICHU","RAICHU","RAICHU","ライチュウ","RAICHU","RAICHU","雷丘","RAICHU"],["Glumanda","Charmander","Charmander","Salamèche","ヒトカゲ","Glumanda","Charmander","小火龙","Charmander"],["GLUMANDA","CHARMANDER","CHARMANDER","SALAMÈCHE","ヒトカゲ","GLUMANDA","CHARMANDER","小火龙","CHARMANDER"],["Glutexo","Charmeleon","Charmeleon","Reptincel","リザード","Glutexo","Charmeleon","火恐龙","Charmeleon"],["GLUTEXO","CHARMELEON","CHARMELEON","REPTINCEL","リザード","GLUTEXO","CHARMELEON","火恐龙","CHARMELEON"],["Glurak","Charizard","Charizard","Dracaufeu","リザードン","Glurak","Charizard","喷火龙","Charizard"],["GLURAK","CHARIZARD","CHARIZARD","DRACAUFEU","リザードン","GLURAK","CHARIZARD","喷火龙","CHARIZARD"],["Zubat","Zubat","Zubat","Nosferapti","ズバット","Zubat","Zubat","超音蝠","Zubat"],["ZUBAT","ZUBAT","ZUBAT","NOSFERAPTI","ズバット","ZUBAT","ZUBAT","超音蝠","ZUBAT"],["Golbat","Golbat","Golbat","Nosferalto","ゴルバット","Golbat","Golbat","大嘴蝠","Golbat"],["GOLBAT","GOLBAT","GOLBAT","NOSFERALTO","ゴルバット","GOLBAT","GOLBAT","大嘴蝠","GOLBAT"],["Schiggy","Squirtle","Squirtle","Carapuce","ゼニガメ","Schiggy","Squirtle","杰尼龟","Squirtle"],["SCHIGGY","SQUIRTLE","SQUIRTLE","CARAPUCE","ゼニガメ","SCHIGGY","SQUIRTLE","杰尼龟","SQUIRTLE"],["Schillok","Wartortle","Wartortle","Carabaffe","カメール","Schillok","Wartortle","卡咪龟","Wartortle"],["SCHILLOK","WARTORTLE","WARTORTLE","CARABAFFE","カメール","SCHILLOK","WARTORTLE","卡咪龟","WARTORTLE"],["Turtok","Blastoise","Blastoise","Tortank","カメックス","Turtok","Blastoise","水箭龟","Blastoise"],["TURTOK","BLASTOISE","BLASTOISE","TORTANK","カメックス","TURTOK","BLASTOISE","水箭龟","BLASTOISE"],["Bisasam","Bulbasaur","Bulbasaur","Bulbizarre","フシギダネ","Bisasam","Bulbasaur","妙蛙种子","Bulbasaur"],["BISASAM","BULBASAUR","BULBASAUR","BULBIZARRE","フシギダネ","BISASAM","BULBASAUR","妙蛙种子","BULBASAUR"],["Bisaknosp","Ivysaur","Ivysaur","Herbizarre","フシギソウ","Bisaknosp","Ivysaur","妙蛙草","Ivysaur"],["BISAKNOSP","IVYSAUR","IVYSAUR","HERBIZARRE","フシギソウ","BISAKNOSP","IVYSAUR","妙蛙草","IVYSAUR"],["Bisaflor","Venusaur","Venusaur","Florizarre","フシギバナ","Bisaflor","Venusaur","妙蛙花","Venusaur"],["BISAFLOR","VENUSAUR","VENUSAUR","FLORIZARRE","フシギバナ","BISAFLOR","VENUSAUR","妙蛙花","VENUSAUR"],["Pummeluff","Jigglypuff","Jigglypuff","Rondoudou","プリン","Pummeluff","Jigglypuff","胖丁","Jigglypuff"],["PUMMELUFF","JIGGLYPUFF","JIGGLYPUFF","RONDOUDOU","プリン","PUMMELUFF","JIGGLYPUFF","胖丁","JIGGLYPUFF"],["Knuddeluff","Wigglytuff","Wigglytuff","Grodoudou","プクリン","Knuddeluff","Wigglytuff","胖可丁","Wigglytuff"],["KNUDDELUFF","WIGGLYTUFF","WIGGLYTUFF","GRODOUDOU","プクリン","KNUDDELUFF","WIGGLYTUFF","胖可丁","WIGGLYTUFF"],["Mew","Mew","Mew","Mew","ミュウ","Mew","Mew","梦幻","Mew"],["MEW","MEW","MEW","MEW","ミュウ","MEW","MEW","梦幻","MEW"],["Kleinstein","Geodude","Geodude","Racaillou","イシツブテ","Kleinstein","Geodude","小拳石","Geodude"],["KLEINSTEIN","GEODUDE","GEODUDE","RACAILLOU","イシツブテ","KLEINSTEIN","GEODUDE","小拳石","GEODUDE"],["Georok","Graveler","Graveler","Gravalanch","ゴローン","Georok","Graveler","隆隆石","Graveler"],["GEOROK","GRAVELER","GRAVELER","GRAVALANCH","ゴローン","GEOROK","GRAVELER","隆隆石","GRAVELER"],["Sandan","Sandshrew","Sandshrew","Sabelette","サンド","Sandan","Sandshrew","穿山鼠","Sandshrew"],["SANDAN","SANDSHREW","SANDSHREW","SABELETTE","サンド","SANDAN","SANDSHREW","穿山鼠","SANDSHREW"],["Sandamer","Sandslash","Sandslash","Sablaireau","サンドパン","Sandamer","Sandslash","穿山王","Sandslash"],["SANDAMER","SANDSLASH","SANDSLASH","SABLAIREAU","サンドパン","SANDAMER","SANDSLASH","穿山王","SANDSLASH"],["Onix","Onix","Onix","Onix","イワーク","Onix","Onix","大岩蛇","Onix"],["ONIX","ONIX","ONIX","ONIX","イワーク","ONIX","ONIX","大岩蛇","ONIX"],["Relaxo","Snorlax","Snorlax","Ronflex","カビゴン","Relaxo","Snorlax","卡比兽","Snorlax"],["RELAXO","SNORLAX","SNORLAX","RONFLEX","カビゴン","RELAXO","SNORLAX","卡比兽","SNORLAX"],["Rattfratz","Rattata","Rattata","Rattata","コラッタ","Rattfratz","Rattata","小拉达","Rattata"],["RATTFRATZ","RATTATA","RATTATA","RATTATA","コラッタ","RATTFRATZ","RATTATA","小拉达","RATTATA"],["Rattikarl","Raticate","Raticate","Rattatac","ラッタ","Rattikarl","Raticate","拉达","Raticate"],["RATTIKARL","RATICATE","RATICATE","RATTATAC","ラッタ","RATTIKARL","RATICATE","拉达","RATICATE"],["Taubsi","Pidgey","Pidgey","Roucool","ポッポ","Taubsi","Pidgey","波波","Pidgey"],["TAUBSI","PIDGEY","PIDGEY","ROUCOOL","ポッポ","TAUBSI","PIDGEY","波波","PIDGEY"],["Tauboga","Pidgeotto","Pidgeotto","Roucoups","ピジョン","Tauboga","Pidgeotto","比比鸟","Pidgeotto"],["TAUBOGA","PIDGEOTTO","PIDGEOTTO","ROUCOUPS","ピジョン","TAUBOGA","PIDGEOTTO","比比鸟","PIDGEOTTO"],["Flegmon","Slowpoke","Slowpoke","Ramoloss","ヤドン","Flegmon","Slowpoke","呆呆兽","Slowpoke"],["FLEGMON","SLOWPOKE","SLOWPOKE","RAMOLOSS","ヤドン","FLEGMON","SLOWPOKE","呆呆兽","SLOWPOKE"],["Lahmus","Slowbro","Slowbro","Flagadoss","ヤドラン","Lahmus","Slowbro","呆壳兽","Slowbro"],["LAHMUS","SLOWBRO","SLOWBRO","FLAGADOSS","ヤドラン","LAHMUS","SLOWBRO","呆壳兽","SLOWBRO"],["Laschoking","Slowking","Slowking","Roigada","ヤドキング","Laschoking","Slowking","呆呆王","Slowking"],["LASCHOKING","SLOWKING","SLOWKING","ROIGADA","ヤドキング","LASCHOKING","SLOWKING","呆呆王","SLOWKING"],["Karpador","Magikarp","Magikarp","Magicarpe","コイキング","Karpador","Magikarp","鲤鱼王","Magikarp"],["KARPADOR","MAGIKARP","MAGIKARP","MAGICARPE","コイキング","KARPADOR","MAGIKARP","鲤鱼王","MAGIKARP"],["Garados","Gyarados","Gyarados","Léviator","ギャラドス","Garados","Gyarados","暴鲤龙","Gyarados"],["GARADOS","GYARADOS","GYARADOS","LÉVIATOR","ギャラドス","GARADOS","GYARADOS","暴鲤龙","GYARADOS"],["Tentacha","Tentacool","Tentacool","Tentacool","メノクラゲ","Tentacha","Tentacool","玛瑙水母","Tentacool"],["TENTACHA","TENTACOOL","TENTACOOL","TENTACOOL","メノクラゲ","TENTACHA","TENTACOOL","玛瑙水母","TENTACOOL"],["Tentoxa","Tentacruel","Tentacruel","Tentacruel","ドククラゲ","Tentoxa","Tentacruel","毒刺水母","Tentacruel"],["TENTOXA","TENTACRUEL","TENTACRUEL","TENTACRUEL","ドククラゲ","TENTOXA","TENTACRUEL","毒刺水母","TENTACRUEL"],["Lapras","Lapras","Lapras","Lokhlass","ラプラス","Lapras","Lapras","拉普拉斯","Lapras"],["LAPRAS","LAPRAS","LAPRAS","LOKHLASS","ラプラス","LAPRAS","LAPRAS","拉普拉斯","LAPRAS"],["Nebulak","Gastly","Gastly","Fantominus","ゴース","Nebulak","Gastly","鬼斯","Gastly"],["NEBULAK","GASTLY","GASTLY","FANTOMINUS","ゴース","NEBULAK","GASTLY","鬼斯","GASTLY"],["Alpollo","Haunter","Haunter","Spectrum","ゴースト","Alpollo","Haunter","鬼斯通","Haunter"],["ALPOLLO","HAUNTER","HAUNTER","SPECTRUM","ゴースト","ALPOLLO","HAUNTER","鬼斯通","HAUNTER"],["Gengar","Gengar","Gengar","Ectoplasma","ゲンガー","Gengar","Gengar","耿鬼","Gengar"],["GENGAR","GENGAR","GENGAR","ECTOPLASMA","ゲンガー","GENGAR","GENGAR","耿鬼","GENGAR"],["Mewtu","Mewtwo","Mewtwo","Mewtwo","ミュウツー","Mewtu","Mewtwo","超梦","Mewtwo"],["MEWTU","MEWTWO","MEWTWO","MEWTWO","ミュウツー","MEWTU","MEWTWO","超梦","MEWTWO"],["Arktos","Articuno","Articuno","Artikodin","フリーザー","Arktos","Articuno","急冻鸟","Articuno"],["ARKTOS","ARTICUNO","ARTICUNO","ARTIKODIN","フリーザー","ARKTOS","ARTICUNO","急冻鸟","ARTICUNO"],["Tackle","Tackle","Placaje","Charge","たいあたり","Tackle","Investida","撞击","Azione"],["Biss","Bite","Mordisco","Morsure","かみつく","Biss","Mordida","咬住","Morso"],["Donnerschock","Thunder Shock","Impactrueno","Éclair","でんきショック","Donnerschock","Choque do Trovão","电击","Tuonoshock"],["Donner","Thunder","Trueno","Fatal-Foudre","かみなり","Donner","Trovão","打雷","Tuono"],["Glut","Ember","Ascuas","Flammèche","ひのこ","Glut","Brasa","火花","Braciere"],["Flammenwurf","Flamethrower","Lanzallamas","Lance-Flammes","かえんほうしゃ","Flammenwurf","Lança-Chamas","喷射火焰","Lanciafiamme"],["Aquaknarre","Water Gun","Pistola Agua","Pistolet à O","みずでっぽう","Aquaknarre","Jato d'Água","水枪","Pistolacqua"],["Hydropumpe","Hydro Pump","Hidrobomba","Hydrocanon","ハイドロポンプ","Hydropumpe","Hidrobomba","水炮","Idropompa"],["Rankenhieb","Vine Whip","Látigo Cepa","Fouet Lianes","つるのムチ","Rankenhieb","Chicote de Cipó","藤鞭","Frustata"],["Solarstrahl","Solar Beam","Rayo Solar","Lance-Soleil","ソーラービーム","Solarstrahl","Raio Solar","日光束","Solarraggio"],["Giftstachel","Poison Sting","Picotazo Veneno","Dard-Venin","どくばり","Giftstachel","Picada Venenosa","毒针","Velenospina"],["Windstoß","Gust","Tornado","Tornade","かぜおこし","Windstoß","Rajada","起风","Raffica"],["Flügelschlag","Wing Attack","Ataque Ala","Cru-Ailes","つばさでうつ","Flügelschlag","Ataque de Asa","翅膀攻击","Attacco d’Ala"],["Psychokinese","Psychic","Psíquico","Psyko","サイコキネシス","Psychokinese","Psíquico","精神强念","Psichico"],["Steinwurf","Rock Throw","Lanzarrocas","Jet-Pierres","いわおとし","Steinwurf","Lançamento de Pedra","落石","Sassata"],["Schaufler","Dig","Excavar","Tunnel","あなをほる","Schaufler","Cavar","挖洞","Fossa"],["Kratzer","Scratch","Arañazo","Griffe","ひっかく","Kratzer","Arranhão","抓","Graffio"],["Bodyslam","Body Slam","Golpe Cuerpo","Plaquage","のしかかり","Bodyslam","Pancada Corporal","泰山压顶","Corposcontro"],["Schnarcher","Snore","Ronquido","Ronflement","いびき","Schnarcher","Ronco","打鼾","Russare"],["Laubklinge","Leaf Blade","Hoja Aguda","Lame Feuille","リーフブレード","Laubklinge","Lâmina de Folha","叶刃","Fendifoglia"],["Platscher","Splash","Salpicadura","Trempette","はねる","Platscher","Borrifada","跃起","Splash"],["Eissturm","Icy Wind","Viento Hielo","Vent Glace","こごえるかぜ","Eissturm","Vento Gelado","冰冻之风","Ventogelato"],["Nachtnebel","Night Shade","Tinieblas","Ombre Nocturne","ナイトヘッド","Nachtnebel","Sombra Noturna","黑夜魔影","Ombra Notturna"],["NORMAL","NORMAL","NORMAL","NORMAL","ノーマル","NORMAL","NORMAL","一般","NORMALE"],["FLUG","FLYING","VOLADOR","VOL","ひこう","FLUG","VOADOR","飞行","VOLANTE"],["GIFT","POISON","VENENO","POISON","どく","GIFT","VENENO","毒","VELENO"],["BODEN","GROUND","TIERRA","SOL","じめん","BODEN","TERRA","地面","TERRA"],["GESTEIN","ROCK","ROCA","ROCHE","いわ","GESTEIN","PEDRA","岩石","ROCCIA"],["GEIST","GHOST","FANTASMA","SPECTRE","ゴースト","GEIST","FANTASMA","幽灵","SPETTRO"],["FEUER","FIRE","FUEGO","FEU","ほのお","FEUER","FOGO","火","FUOCO"],["WASSER","WATER","AGUA","EAU","みず","WASSER","ÁGUA","水","ACQUA"],["PFLANZE","GRASS","PLANTA","PLANTE","くさ","PFLANZE","PLANTA","草","ERBA"],["ELEKTRO","ELECTRIC","ELÉCTRICO","ÉLECTRIK","でんき","ELEKTRO","ELÉTRICO","电","ELETTRO"],["PSYCHO","PSYCHIC","PSÍQUICO","PSY","エスパー","PSYCHO","PSÍQUICO","超能力","PSICO"],["EIS","ICE","HIELO","GLACE","こおり","EIS","GELO","冰","GHIACCIO"],["Chimpex","Chimpex","Chimpex","Chimpex","チンペックス","Chimpex","Chimpex","奇姆佩克斯","Chimpex"],["CHIMPEX","CHIMPEX","CHIMPEX","CHIMPEX","チンペックス","CHIMPEX","CHIMPEX","奇姆佩克斯","CHIMPEX"],["Pfund","Pound","Destructor","Écras'Face","はたく","Pfund","Pancada","拍击","Botta"],["Kichern","Giggle","Risita","Ricanement","くすくす笑い","Kichern","Risadinha","窃笑","Risatina"],["Faustschlag","Punch","Puñetazo","Coup de poing","パンチ","Faustschlag","Soco","拳击","Pugno"],["Spucke","Spit","Escupitajo","Crachat","つば","Spucke","Cusparada","吐口水","Sputo"],["Huftritt","Hoof Kick","Coz","Coup de sabot","ひづめキック","Huftritt","Coice","蹄击","Calcio di zoccolo"],["Feuerpranke","Fire Claw","Garra de fuego","Griffe de feu","ほのおのツメ","Feuerpranke","Garra de Fogo","火焰爪","Artiglio di fuoco"],["Königsbrüller","Royal Roar","Rugido real","Rugissement royal","王のほうこう","Königsbrüller","Rugido Real","王者咆哮","Ruggito regale"],["Wasserwirbel","Whirlpool","Torbellino","Siphon","うずしお","Wasserwirbel","Redemoinho","潮旋","Mulinello"],["Schattenball","Shadow Ball","Bola Sombra","Ball'Ombre","シャドーボール","Schattenball","Bola Sombria","暗影球","Palla Ombra"],["Zungenschlag","Tongue Strike","Lengüetazo","Coup de langue","したうち","Zungenschlag","Golpe de Língua","舌击","Colpo di lingua"],["Elektabuzz","Electabuzz","Electabuzz","Élektek","エレブー","Elektabuzz","Electabuzz","电击兽","Electabuzz"],["ELEKTABUZZ","ELECTABUZZ","ELECTABUZZ","ÉLEKTEK","エレブー","ELEKTABUZZ","ELECTABUZZ","电击兽","ELECTABUZZ"],["Koffing","Koffing","Koffing","Smogo","ドガース","Koffing","Koffing","瓦斯弹","Koffing"],["KOFFING","KOFFING","KOFFING","SMOGO","ドガース","KOFFING","KOFFING","瓦斯弹","KOFFING"],["Rocket-Rüpel","Rocket Grunt","Recluta Rocket","Sbire Rocket","ロケット団員","Rocket-Rüpel","Recruta Rocket","火箭队手下","Recluta Rocket"],["ROCKET-RÜPEL","ROCKET GRUNT","RECLUTA ROCKET","SBIRE ROCKET","ロケット団員","ROCKET-RÜPEL","RECRUTA ROCKET","火箭队手下","RECLUTA ROCKET"],["Giovanni","Giovanni","Giovanni","Giovanni","サカキ","Giovanni","Giovanni","坂木","Giovanni"],["GIOVANNI","GIOVANNI","GIOVANNI","GIOVANNI","サカキ","GIOVANNI","GIOVANNI","坂木","GIOVANNI"],["Blitz","Flash","Destello","Flash","フラッシュ","Blitz","Clarão","闪光","Flash"],["Giftnebel","Poison Mist","Niebla venenosa","Brume toxique","どくのきり","Giftnebel","Névoa Venenosa","毒雾","Nebbia velenosa"],["Stampfer","Stomp","Pisotón","Écrasement","ふみつけ","Stampfer","Pisoteio","踩踏","Pestone"]]);

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
  blitz:        { name: "Blitz",          type: "elektro", power: 65 },
  giftnebel:    { name: "Giftnebel",      type: "gift",    power: 45 },
  stampfer:     { name: "Stampfer",       type: "normal",  power: 60 },
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
  elektabuzz:{ name: "Elektabuzz", type: "elektro", hp: 65, atk: 85, def: 57, moves: ["blitz", "donnerschock"],
               look: { body: "#f8c820", dark: "#b06c10", size: 1.1, ears: "small", stripes: true, cheeks: "#f8a030" } },
  koffing:   { name: "Koffing",    type: "gift",    hp: 40, atk: 65, def: 95, moves: ["giftstachel", "giftnebel"],
               look: { kind: "jelly", body: "#8868b8", dark: "#c03060", size: 1.2 } },
  grunt:     { name: "Rocket-Rüpel", type: "normal", hp: 35, atk: 50, def: 35, moves: ["tackle", "stampfer"],
               look: { kind: "grunt", body: "#f0d0a8", dark: "#1a1a2a", size: 1 } },
  giovanni:  { name: "Giovanni",   type: "boden",   hp: 85, atk: 90, def: 70, moves: ["stampfer", "schaufler"],
               look: { kind: "giovanni", body: "#f0d0a8", dark: "#1a1a2a", size: 1.5 } },
};
const DIFFS = {
  leichter: { key: "leichter", name: "Leichter", label: "leichter", color: "#2e8b57", mascot: "pikachu", lives: 5, balls: 5, lvl: -1, dmgTaken: 0.7, dmgDealt: 1.15, catchBonus: 0.15, pickupHeal: 0.5, enemySpeed: 1,
              info: ["5 Leben, 5 Pokébälle", "Gegner etwas schwächer", "Du machst mehr Schaden", "Fangen klappt leichter", "Pokébälle heilen 50 %"] },
  schwerer: { key: "schwerer", name: "Schwerer", label: "schwerer", color: "#c0392b", mascot: "glurak", lives: 3, balls: 2, lvl: 1, dmgTaken: 1.25, dmgDealt: 1, catchBonus: -0.1, pickupHeal: 0.1, enemySpeed: 1.35,
              info: ["3 Leben, 2 Pokébälle", "Gegner stärker & schneller", "Gegner machen mehr Schaden", "Fangen ist schwerer", "Pokébälle heilen nur 10 %"] },
};
let diff = DIFFS.leichter, titleSel = 0;
let titleStep = "profile"; // "profile" | "newname" | "newdiff" | "levelpick" | "groups" | "leaderboard"
let profiles = [], activeProfileIdx = -1, nameInput = "";
// Groups state
let groupSel = 0, groupInput = "", groupInputMode = null; // "join" | "create"
let groupData = null, groupLoading = false, groupError = "", groupSuccess = "", groupCopied = 0;
const WILD_TILES = { g: "glumanda", z: "zubat", w: "schiggy", b: "bisasam", j: "pummeluff", m: "mew", k: "kleinstein", d: "sandan", r: "rattfratz", u: "flegmon", x: "elektabuzz", R: "grunt" };
const FLYER_TILES = { z: "zubat", a: "taubsi", n: "nebulak", N: "koffing" };
const SWIMMER_TILES = { q: "karpador", e: "tentacha" };
const AIR_MAX = 14 * 60;
// Gemeinfreie Werke von Künstlerinnen (Wikimedia Commons), als Daten-URLs eingebettet
const ART = [
  { id: "hildegard", artist: "Hildegard von Bingen", title: "Hildegard empfängt eine Vision (Scivias)", year: "um 1151", epoch: "Mittelalter", source: "Hildegard von Bingen.jpg",
    data: new URL("assets/museum.2609aa40c19ec8b0.jpg", globalThis.PokeI18n.assetBase).href },
  { id: "anguissola", artist: "Sofonisba Anguissola", title: "Das Schachspiel", year: "1555", epoch: "Renaissance", source: "The Chess Game (Sofonisba Anguissola) 1555 (4096x3236px).jpg",
    data: new URL("assets/museum.5787909895489415.jpg", globalThis.PokeI18n.assetBase).href },
  { id: "fontana", artist: "Lavinia Fontana", title: "Selbstbildnis am Spinett", year: "1577", epoch: "Renaissance", source: "Lavinia Fontana - Self-Portrait at the Spinet - WGA07985.jpg",
    data: new URL("assets/museum.4e3bc847843f2e3c.jpg", globalThis.PokeI18n.assetBase).href },
  { id: "gentileschi", artist: "Artemisia Gentileschi", title: "Selbstbildnis als Allegorie der Malerei", year: "1638", epoch: "Barock", source: "Self-portrait as the Allegory of Painting (La Pittura) - Artemisia Gentileschi.jpg",
    data: new URL("assets/museum.c12dc2f37324a74d.jpg", globalThis.PokeI18n.assetBase).href },
  { id: "leyster", artist: "Judith Leyster", title: "Selbstbildnis", year: "um 1630", epoch: "Barock", source: "Judith Leyster - Self-Portrait - Google Art Project.jpg",
    data: new URL("assets/museum.7e76730f15485609.jpg", globalThis.PokeI18n.assetBase).href },
  { id: "peeters", artist: "Clara Peeters", title: "Stillleben mit Käse, Mandeln und Brezeln", year: "um 1615", epoch: "Barock", source: "Clara Peeters - Still Life with Cheeses, Almonds and Pretzels.jpg",
    data: new URL("assets/museum.5849366641246c2f.jpg", globalThis.PokeI18n.assetBase).href },
  { id: "ruysch", artist: "Rachel Ruysch", title: "Blumen in einer Vase", year: "um 1685", epoch: "Barock", source: "Rachel Ruysch - Flowers in a vase - NG 6425.jpg",
    data: new URL("assets/museum.89d2aa404b3740e8.jpg", globalThis.PokeI18n.assetBase).href },
  { id: "vigee", artist: "Élisabeth Vigée Le Brun", title: "Selbstbildnis mit Strohhut", year: "1782", epoch: "Rokoko", source: "Self-portrait in a Straw Hat by Elisabeth-Louise Vigée-Lebrun.jpg",
    data: new URL("assets/museum.8d0778c26e9ac944.jpg", globalThis.PokeI18n.assetBase).href },
  { id: "kauffmann", artist: "Angelika Kauffmann", title: "Selbstbildnis am Scheideweg zwischen Musik und Malerei", year: "1794", epoch: "Klassizismus", source: "Angelica Kauffmann (1741-1807) - Self Portrait of the Artist Hesitating between the Arts of Music and Painting - 960079 - National Trust.jpg",
    data: new URL("assets/museum.7c5ce0cbc5ef5a85.jpg", globalThis.PokeI18n.assetBase).href },
  { id: "bonheur", artist: "Rosa Bonheur", title: "Der Pferdemarkt", year: "1855", epoch: "Realismus", source: "Rosa Bonheur, The Horse Fair, 1852–55.jpg",
    data: new URL("assets/museum.d71fe940f1a7f559.jpg", globalThis.PokeI18n.assetBase).href },
  { id: "morisot", artist: "Berthe Morisot", title: "Die Wiege", year: "1872", epoch: "Impressionismus", source: "Berthe Morisot - The Cradle - Google Art Project.jpg",
    data: new URL("assets/museum.852781767baffdb6.jpg", globalThis.PokeI18n.assetBase).href },
  { id: "cassatt", artist: "Mary Cassatt", title: "Das Bad des Kindes", year: "1893", epoch: "Impressionismus", source: "Mary Cassatt - The Child's Bath - Google Art Project.jpg",
    data: new URL("assets/museum.9a55917669171cce.jpg", globalThis.PokeI18n.assetBase).href },
  { id: "bashkirtseff", artist: "Marie Bashkirtseff", title: "Im Atelier", year: "1881", epoch: "Realismus", source: "Bashkirtseff - In the Studio.jpg",
    data: new URL("assets/museum.b071145074702963.jpg", globalThis.PokeI18n.assetBase).href },
  { id: "modersohn", artist: "Paula Modersohn-Becker", title: "Selbstbildnis mit Hut und Schleier", year: "1906", epoch: "Expressionismus", source: "Paula Modersohn-Becker - Self-portrait with hat and veil - Google Art Project.jpg",
    data: new URL("assets/museum.a76ae90a91d75dcb.jpg", globalThis.PokeI18n.assetBase).href },
  { id: "kollwitz", artist: "Käthe Kollwitz", title: "Selbstbildnis (Lithografie)", year: "1924", epoch: "Expressionismus", source: "Käthe Kollwitz - Selbstbildnis (Self-portrait). Lithograph, 1924.jpg",
    data: new URL("assets/museum.98bfacd79849f160.jpg", globalThis.PokeI18n.assetBase).href },
  { id: "afklint", artist: "Hilma af Klint", title: "Die zehn Größten, Nr. 9, Das Alter", year: "1907", epoch: "Moderne (Abstraktion)", source: "Hilma af Klint - The Ten Largest No. 9 - 1907.jpg",
    data: new URL("assets/museum.c8115b667de4279b.jpg", globalThis.PokeI18n.assetBase).href },
  { id: "valadon", artist: "Suzanne Valadon", title: "Das blaue Zimmer", year: "1923", epoch: "Moderne", source: "(Barcelona) La chambre bleue - Suzanne Valadon.jpg",
    data: new URL("assets/museum.f04427e218abee82.jpg", globalThis.PokeI18n.assetBase).href }
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

// Localize at the presentation boundary. Queued battle messages, saved profiles,
// species keys, type rules and difficulty IDs keep their original values.
const tr = value => globalThis.PokeI18n.t(value);
function uiText(text, x, y, maxWidth) {
  const available = maxWidth ?? (ctx.textAlign === 'center' ? Math.min(x, W - x) * 2 - 20 : ctx.textAlign === 'right' ? x - 8 : W - x - 8);
  ctx.fillText(tr(text), x, y, Math.max(20, available));
}
function uiMeasure(text) { return ctx.measureText(tr(text)); }
function textLines(text, maxWidth) {
  const localized = tr(text), lines = [];
  // Chinese and Japanese wrap between characters; long words also need an emergency wrap.
  const tokens = ['ja', 'zh'].includes(globalThis.PokeI18n.language) ? Array.from(localized) : localized.match(/\S+\s*|\s+/g) || [''];
  let line = '';
  for (const token of tokens) {
    if (line && ctx.measureText(line + token).width > maxWidth) { lines.push(line.trimEnd()); line = ''; }
    for (const char of token) {
      if (line && ctx.measureText(line + char).width > maxWidth) { lines.push(line.trimEnd()); line = ''; }
      line += char;
    }
  }
  if (line || !lines.length) lines.push(line.trimEnd());
  return lines;
}
function refreshGameLanguage() {
  const hint = document.getElementById('hint');
  if (hint) hint.textContent = tr('ui.hint');
  canvas.setAttribute?.('aria-label', tr('ui.game'));
  const selector = document.getElementById('language');
  if (selector) selector.value = globalThis.PokeI18n.language;
  const label = document.getElementById('language-label');
  if (label) label.textContent = tr('ui.language');
  if (document.documentElement) document.documentElement.lang = globalThis.PokeI18n.language;
}
globalThis.PokeI18n.onChange(refreshGameLanguage);
// The website owns its selector; the self-contained HTML owns this one.
const standaloneLanguage = document.getElementById('standalone-language');
if (standaloneLanguage?.querySelector?.('select')) {
  standaloneLanguage.querySelector('select').addEventListener('change', event => {
    globalThis.PokeI18n.setLanguage(event.target.value);
    event.target.blur();
  });
}
refreshGameLanguage();

// Native input enables Japanese IME, accented names, paste and screen readers.
// The existing profile flow still owns validation, difficulty and persistence.
let profileNameField;
function syncProfileNameField() {
  if (!document.body?.append) return;
  const visible = state === 'title' && titleStep === 'newname';
  if (!visible) { if (profileNameField && !profileNameField.hidden) { profileNameField.blur(); profileNameField.hidden = true; canvas?.focus?.({ preventScroll: true }); } return; }
  if (!profileNameField) {
    profileNameField = document.createElement('input');
    profileNameField.type = 'text'; profileNameField.autocomplete = 'off'; profileNameField.spellcheck = false;
    profileNameField.style.cssText = 'position:fixed;z-index:5;box-sizing:border-box;text-align:center;color:#222;background:#fff;border:2px solid #ffde00;border-radius:4px;font-family:system-ui,sans-serif;';
    profileNameField.addEventListener('input', event => {
      if (event.isComposing) return;
      nameInput = Array.from(profileNameField.value).slice(0, 14).join('');
      profileNameField.value = nameInput;
    });
    profileNameField.addEventListener('compositionend', () => {
      nameInput = Array.from(profileNameField.value).slice(0, 14).join('');
      profileNameField.value = nameInput;
    });
    profileNameField.addEventListener('keydown', event => {
      if (event.isComposing || event.keyCode === 229) return;
      if (event.key === 'Enter' && nameInput.trim()) { titleStep = 'newdiff'; titleSel = 0; }
      else if (event.key === 'Escape') { titleStep = 'profile'; titleSel = 0; }
      else return;
      event.preventDefault(); profileNameField.hidden = true; canvas.focus?.();
    });
    document.body.append(profileNameField);
    profileNameField.hidden = true;
  }
  const rect = canvas.getBoundingClientRect(), style = profileNameField.style;
  style.left = rect.left + rect.width * .25 + 4 + 'px';
  style.top = rect.top + rect.height * 148 / H + 4 + 'px';
  style.width = rect.width * .5 - 8 + 'px'; style.height = rect.height * 70 / H - 8 + 'px';
  style.fontSize = Math.max(16, rect.width * 28 / W) + 'px';
  profileNameField.setAttribute('aria-label', tr('Wie heisst du?'));
  if (profileNameField.hidden) {
    profileNameField.value = nameInput; profileNameField.hidden = false;
    for (const key in keys) keys[key] = false;
    profileNameField.focus({ preventScroll: true });
  }
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
  { name: "1-9 Elektrizitätswerk", theme: { ground: "powerplant", sky: ["#0a0e1a", "#1a2a3a"], hills: false, levelBonus: 9,
      intro: ["Team Rakete hat das Elektrizitätswerk übernommen!", "Drücke E an einem Terminal ⚡, um den Strom einzuschalten und die Gittertore zu öffnen.", "Am Ende lauert Giovanni, der Chef von Team Rakete. Boden- und Kampf-Attacken treffen ihn schwer!"] },
    map: [
"                                                                                                   ",
"                                                                                                   ",
"                                                                                                   ",
"                                                                                                   ",
"          ====                                            ====                           p  p      ",
"   p p          ?      E  p               ?  p                E  p            ?          p p       ",
"   ===   x   =====   x  === JJ ===    x   ===   x   =====   x  === JJ ===    x    x           x    ",
"       R       R  R      R  JJ  N    R  N       R      R  R     N  JJ  N    R   N   R   N      F   ",
"  S       x        x        JJ   x      x       x        x         JJ   x       x         V    F   ",
"#####  ########  ######  ##########  ########  ########  ################  ########  ##############",
"################################  #########  ######################################################",
"################################  #########  ######################################################"
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
  if (e.isComposing || /^(SELECT|INPUT|TEXTAREA|BUTTON|A)$/.test(e.target?.tagName) || e.target?.isContentEditable) return;
  if (!keys[e.code]) pressed[e.code] = true;
  keys[e.code] = true;
  if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) e.preventDefault();
  if (e.code === "KeyR" && state !== "title") { saveCurrentProfile(); state = "title"; titleStep = "profile"; titleSel = 0; }
  if (state === "title" && titleStep === "newname" && !e.ctrlKey && !e.metaKey && e.key.length === 1 && e.key !== " " && nameInput.length < 14) nameInput += e.key;
  if (state === "title" && (titleStep === "groups" || titleStep === "leaderboard") && groupInputMode && !e.ctrlKey && !e.metaKey && e.key.length === 1 && e.key !== " ") {
    if (groupInputMode === "join" && groupInput.length < 6) groupInput += e.key.toUpperCase();
    else if (groupInputMode === "create" && groupInput.length < 24) groupInput += e.key;
  }
});
addEventListener("keyup", e => keys[e.code] = false);
canvas.addEventListener("click", e => {
  if (state !== "title") return;
  const r = canvas.getBoundingClientRect(), x = (e.clientX - r.left) * W / r.width, y = (e.clientY - r.top) * H / r.height;
  handleTitleClick(x, y);
});
const confirmPressed = () => pressed.Space || pressed.Enter || pressed.KeyX;
const backPressed = () => pressed.Escape || pressed.Backspace;

function tileAt(col, row) { if (col < 0 || col >= COLS) return "#"; if (row < 0 || row >= ROWS) return " "; return LEVEL[row][col]; }
const SOLID = new Set(["#", "B", "=", "~", "?", "U", "G", "J"]);
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
let analyticsLevelStartedAt = 0, analyticsDeathsThisLevel = 0;
function trackGameEvent(name, params = {}) {
  if (typeof window.gtag !== "function") return;
  const language = globalThis.PokeI18n?.language;
  const difficulty = typeof diff !== "undefined" && diff.key === "schwerer" ? "hard" : "easy";
  window.gtag("event", name, {
    level_id: String(levelIdx + 1),
    difficulty,
    ...(language ? { language } : {}),
    ...params
  });
}
function trackLevelStart() {
  analyticsLevelStartedAt = Date.now();
  analyticsDeathsThisLevel = 0;
  trackGameEvent("level_start");
}
function trackLevelComplete() {
  const duration = analyticsLevelStartedAt ? Math.max(0, Math.floor((Date.now() - analyticsLevelStartedAt) / 1000)) : undefined;
  trackGameEvent("level_complete", {
    ...(duration !== undefined ? { duration_seconds: duration } : {}),
    deaths: analyticsDeathsThisLevel
  });
  if (levelIdx === LEVELS.length - 1) trackGameEvent("game_complete", { levels_completed: LEVELS.length });
}
const lerpX = o => (o.px === undefined ? o.x : o.px + (o.x - o.px) * renderAlpha);
const lerpY = o => (o.py === undefined ? o.y : o.py + (o.y - o.py) * renderAlpha);

function loadProfiles() {
  if (globalThis.PokeStorage) { profiles = globalThis.PokeStorage.loadProfiles(); }
  else { try { profiles = JSON.parse(localStorage.getItem("pokemario.profiles") || "[]"); } catch(e) { profiles = []; } }
}
function persistProfiles() {
  if (globalThis.PokeStorage) globalThis.PokeStorage.saveProfiles(profiles);
  else localStorage.setItem("pokemario.profiles", JSON.stringify(profiles));
}
function saveCurrentProfile() {
  if (activeProfileIdx < 0 || activeProfileIdx >= profiles.length) return;
  const p = profiles[activeProfileIdx];
  p.diff = diff.key; p.levelIdx = levelIdx; p.score = score; p.lives = lives;
  p.pokeballs = pokeballs; p.masterBalls = masterBalls; p.sticks = sticks;
  p.cucumbers = cucumbers; p.stars = stars; p.crowned = crowned;
  p.team = team ? team.map(m => ({ ...m })) : null;
  p.progress = progress ? { ...progress, huts: [...(progress.huts||[])], bossesDone: [...(progress.bossesDone||[])], secrets: [...(progress.secrets||[])], roomsSeen: [...(progress.roomsSeen||[])], electric: [...(progress.electric||[])] } : null;
  p.stats = stats ? { ...stats } : { battles: 0, caught: 0, evolutions: 0 }; p.lastPlayed = Date.now();
  persistProfiles();
}
function deleteProfile(idx) {
  profiles.splice(idx, 1);
  persistProfiles();
  if (activeProfileIdx === idx) activeProfileIdx = -1;
  else if (activeProfileIdx > idx) activeProfileIdx--;
}
function loadProfileIntoState() {
  const p = profiles[activeProfileIdx];
  if (!p) return;
  diff = DIFFS[p.diff] || DIFFS.leichter;
  score = p.score || 0; lives = p.lives || diff.lives; pokeballs = p.pokeballs != null ? p.pokeballs : diff.balls;
  masterBalls = p.masterBalls || 0; sticks = p.sticks || 0; cucumbers = p.cucumbers || 0;
  stars = p.stars || 0; crowned = p.crowned || false;
  team = p.team && p.team.length ? p.team.map(m => ({ ...m })) : [makeMon("pikachu", 5)];
  leadIdx = 0; stats = p.stats ? { ...p.stats } : { battles: 0, caught: 0, evolutions: 0 };
  progress = p.progress ? { ...p.progress, huts: [...(p.progress.huts||[])], bossesDone: [...(p.progress.bossesDone||[])], secrets: [...(p.progress.secrets||[])], roomsSeen: [...(p.progress.roomsSeen||[])], electric: [...(p.progress.electric||[])] } : null;
}
function init(keepProgress) {
  solidMap = LEVEL.map(r => r.split(""));
  enemies = []; items = []; particles = []; projectiles = []; toasts = [];
  activeSign = null; camX = 0; prevCamX = undefined; camY = 0; prevCamY = undefined; time = 0; flagX = 0; battle = null; state = "play";
  air = AIR_MAX; movers = []; balloon = null; winSecret = false; flagTop = 99; flagBase = 0; pumpkins = []; pumpkinToast = 0;
  if (!keepProgress) {
    score = 0; pokeballs = diff.balls; masterBalls = 0; lives = diff.lives; sticks = 0; cucumbers = 0; stars = 0; crowned = false;
    team = [makeMon("pikachu", 5)]; leadIdx = 0;
    stats = { battles: 0, caught: 0, evolutions: 0 };
  } else if (keepProgress === "profile") {
    loadProfileIntoState();
  } else {
    for (const m of team) m.hp = m.maxHp;
  }
  if (!keepProgress || !progress || progress.level !== levelIdx) progress = { level: levelIdx, huts: [], checkpoint: null, bossesDone: [], secrets: [], roomsSeen: [], electric: [] };
  if (progress.electricOn) { progress.electric = progress.electric || []; progress.electric.push("all"); delete progress.electricOn; }
  if (progress.electric) for (const key of progress.electric) { openGatesNear(key === "all" ? -1 : parseInt(key)); }
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
    else if (t === "O" || t === "X" || t === "C" || t === "L" || t === "K" || t === "Y" || t === "A" || t === "Q" || t === "T" || t === "V") {
      const bossDef = { O: { key: "onix", lvl: 10, w: 40, h: 110, title: "Der Tempelwächter", tip: "Tipp: Wasser- und Pflanzen-Attacken sind sehr effektiv gegen Gestein. Elektro wirkt nur schwach." },
                        X: { key: "relaxo", lvl: 9, w: 60, h: 60, asleep: true, title: "Der schlafende Riese", tip: "Tipp: Relaxo schläft noch ein paar Runden. Schlafende Pokémon lassen sich leichter fangen!" },
                        C: { key: "chimpex", lvl: 13, w: 50, h: 70, title: "Der Dschungelkönig", tip: "Tipp: Feuer- und Flug-Attacken sind sehr effektiv gegen Pflanze!" },
                        L: { key: "lahmus", lvl: 11, w: 50, h: 70, title: "Der Stadtwächter", tip: "Tipp: Lahmus ist Wasser und Psycho, ein Muschas hängt an seinem Schwanz. Elektro und Pflanze treffen doppelt, oder finde den Geheimgang vorbei!" },
                        K: { key: "laschoking", lvl: 15, w: 50, h: 82, title: "Der Stadtkönig", tip: "Tipp: Laschoking trägt das Muschas als Krone und ist klug und zäh. Elektro- und Pflanzen-Attacken sind sehr effektiv!" },
                        Y: { key: "lapras", lvl: 12, w: 40, h: 120, title: "Der Seewächter", tip: "Tipp: Lapras ist Wasser und Eis. Elektro, Pflanze und Gestein treffen doppelt! Oder finde das Rohr, das am Wächter vorbeiführt." },
                        A: { key: "arktos", lvl: 16, w: 50, h: 80, title: "Der Gipfelwächter", tip: "Tipp: Arktos ist Eis und Flug. Feuer- und Gestein-Attacken sind sehr effektiv!" },
                        Q: { key: "gengar", lvl: 17, w: 50, h: 80, title: "Der Burggeist", tip: "Tipp: Gengar ist Geist und Gift. Normale Attacken wirken gar nicht, Psycho- und Geist-Attacken treffen doppelt!" },
                        T: { key: "mewtu", lvl: 18, w: 50, h: 80, title: "Der Museumswächter", tip: "Tipp: Mewtu ist ein Psycho-Pokémon. Geist-Attacken (zum Beispiel von Nebulak) treffen doppelt!" },
                        V: { key: "giovanni", lvl: 20, w: 40, h: 72, title: "Giovanni – Chef von Team Rakete", tip: "Tipp: Giovanni ist Boden-Typ. Wasser- und Pflanzangriffe treffen ihn doppelt, Elektro-Attacken wirken gar nicht!" } }[t];
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
function openGatesNear(terminalCol) {
  for (let r2 = 0; r2 < ROWS; r2++) for (let c2 = 0; c2 < COLS; c2++) {
    if (solidMap[r2][c2] === "J" && (terminalCol < 0 || Math.abs(c2 - terminalCol) <= 12)) { solidMap[r2][c2] = " "; burst(c2 * TILE + 20, r2 * TILE + 20, "#f8d030", 8); }
  }
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
    const np = profiles.length;
    if (titleStep === "profile") {
      const total = np < 5 ? np + 1 : np;
      if (pressed.ArrowLeft || pressed.KeyA) { titleSel = (titleSel - 1 + total) % total; beep(600, 0.03); }
      if (pressed.ArrowRight || pressed.KeyD) { titleSel = (titleSel + 1) % total; beep(600, 0.03); }
      for (let i = 1; i <= Math.min(total, 9); i++) if (pressed["Digit" + i]) { titleSel = i - 1; beep(600, 0.03); }
      if (pressed.Enter || pressed.Space) {
        if (titleSel >= np) { titleStep = "newname"; nameInput = ""; titleSel = 0; beep(800, 0.03); }
        else { activeProfileIdx = titleSel; loadProfileIntoState(); titleStep = "levelpick"; titleSel = profiles[activeProfileIdx].levelIdx || 0; beep(800, 0.03); }
      }
      if ((pressed.Delete || pressed.Backspace) && titleSel < np) { deleteProfile(titleSel); titleSel = Math.min(titleSel, Math.max(0, profiles.length + (profiles.length < 5 ? 0 : -1) - 1)); beep(300, 0.06); }
      if (pressed.KeyG && globalThis.PokeGroups && globalThis.PokeStorage && globalThis.PokeStorage.getUser() && titleSel < np) {
        activeProfileIdx = titleSel; groupSel = 0; groupInput = ""; groupInputMode = null; groupError = ""; groupSuccess = ""; groupData = null; groupLoading = false; groupCopied = 0;
        titleStep = "groups"; beep(800, 0.03);
      }
    } else if (titleStep === "newname") {
      if (pressed.Backspace && nameInput.length) { nameInput = nameInput.slice(0, -1); beep(500, 0.03); }
      if (pressed.Space && nameInput.length < 14) { nameInput += " "; beep(600, 0.03); }
      if (pressed.Escape) { titleStep = "profile"; titleSel = 0; beep(400, 0.04); }
      if (pressed.Enter && nameInput.trim()) { titleStep = "newdiff"; titleSel = 0; beep(800, 0.03); }
    } else if (titleStep === "newdiff") {
      if (pressed.ArrowLeft || pressed.KeyA || pressed.Digit1) { titleSel = 0; beep(600, 0.03); }
      if (pressed.ArrowRight || pressed.KeyD || pressed.Digit2) { titleSel = 1; beep(600, 0.03); }
      if (pressed.Escape) { titleStep = "newname"; beep(400, 0.04); }
      if (pressed.Enter || pressed.Space) {
        const d = titleSel ? DIFFS.schwerer : DIFFS.leichter;
        diff = d;
        profiles.push({ name: nameInput.trim(), diff: d.key, levelIdx: 0, score: 0, lives: d.lives, pokeballs: d.balls, masterBalls: 0, sticks: 0, cucumbers: 0, stars: 0, crowned: false, team: null, progress: null, stats: { battles: 0, caught: 0, evolutions: 0 }, lastPlayed: Date.now() });
        activeProfileIdx = profiles.length - 1;
        persistProfiles();
        titleStep = "levelpick"; titleSel = 0; beep(800, 0.03);
      }
    } else if (titleStep === "levelpick") {
      if (pressed.ArrowLeft || pressed.KeyA) { titleSel = (titleSel - 1 + LEVELS.length) % LEVELS.length; beep(600, 0.03); }
      if (pressed.ArrowRight || pressed.KeyD) { titleSel = (titleSel + 1) % LEVELS.length; beep(600, 0.03); }
      if (pressed.ArrowUp || pressed.KeyW) { titleSel = (titleSel - 4 + LEVELS.length) % LEVELS.length; beep(600, 0.03); }
      if (pressed.ArrowDown || pressed.KeyS) { titleSel = (titleSel + 4) % LEVELS.length; beep(600, 0.03); }
      for (let i = 1; i <= Math.min(LEVELS.length, 9); i++) if (pressed["Digit" + i]) { titleSel = i - 1; beep(600, 0.03); }
      if (pressed.Enter || pressed.Space) startGame(activeProfileIdx, titleSel);
      if (pressed.KeyN) resetProfileProgress();
      if (pressed.Escape) { titleStep = "profile"; titleSel = activeProfileIdx >= 0 ? activeProfileIdx : 0; beep(400, 0.04); }
    } else if (titleStep === "groups") {
      updateGroups();
    } else if (titleStep === "leaderboard") {
      updateLeaderboard();
    }
    clearPressed(); return;
  }
  if (state === "win" && (pressed.Enter || pressed.Space) && levelIdx < LEVELS.length - 1) { loadLevel(levelIdx + 1); init(true); trackLevelStart(); saveCurrentProfile(); clearPressed(); return; }
  if (state === "rest") { restT++; if (restT > 170) { state = "play"; player.inv = 60; } clearPressed(); return; }
  if (state !== "play") { clearPressed(); return; }
  if (pressed.KeyL) { loadLevel((levelIdx + 1) % LEVELS.length); init(true); trackLevelStart(); clearPressed(); return; }

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
  if (pressed.KeyE) {
    let terminalCol = -1;
    for (const [cc, rr] of cellsUnder({ x: p.x - 30, y: p.y - 20, w: p.w + 60, h: p.h + 40 })) { if (tileAt(cc, rr) === "E") { terminalCol = cc; break; } }
    if (terminalCol >= 0) {
      if (!progress.electric) progress.electric = [];
      const key = String(terminalCol);
      if (!progress.electric.includes(key)) {
        progress.electric.push(key);
        openGatesNear(terminalCol);
        toast("Strom eingeschaltet! Gittertore geöffnet.", "#f8d030"); jingle([440, 523, 659, 784], 0.08);
      } else toast("Dieser Schalter ist bereits an.", "#f8d030");
    }
  }
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
  for (const [cc, rr] of cellsUnder(p)) if (tileAt(cc, rr) === "Z") { winSecret = true; foundSecret("Z", "Geheimes Ziel erreicht!"); state = "win"; trackLevelComplete(); score += 3000; jingle([659, 784, 988, 1319, 1568], 0.09); return; }

  if (p.y > LEVEL_H + 100) die();
  for (const [cc, rr] of cellsUnder(p)) if (tileAt(cc, rr) === "s" && rectsOverlap(p, { x: cc * TILE + 4, y: rr * TILE + 20, w: TILE - 8, h: TILE })) { if (!p.inv) die(); }

  // Steht die Fahne in einem verborgenen Raum, zählt das Ziel nur dort drin (sonst reicht ein Flug am Raum vorbei).
  const flagRoom = (THEME.rooms || []).find(rm => Math.floor(flagX / TILE) >= rm.c0 && Math.floor(flagX / TILE) <= rm.c1 && flagTop >= rm.r0 && flagTop <= rm.r1);
  const inFlagRoom = !flagRoom || (cxTile >= flagRoom.c0 && cxTile <= flagRoom.c1 && cyTile >= flagRoom.r0 && cyTile <= flagRoom.r1);
  if (inFlagRoom && p.x + p.w > flagX + 10 && p.y + p.h <= flagBase + 4 && p.y + p.h > flagBase - 120) { state = "win"; trackLevelComplete(); score += 1000; jingle([523, 659, 784, 1047]); }

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
function startRest(hut) { state = "rest"; restT = 0; restX = hut.x; for (const m of team) m.hp = m.maxHp; player.vx = 0; projectiles = []; saveCurrentProfile(); jingle([392, 330, 262], 0.15); }
function startGame(profileIdx, startLevel) {
  activeProfileIdx = profileIdx;
  const prof = profiles[profileIdx];
  diff = DIFFS[prof.diff] || DIFFS.leichter;
  loadLevel(startLevel);
  const resuming = startLevel === (prof.levelIdx || 0) && prof.team && prof.team.length > 0;
  init(resuming ? "profile" : false);
  trackGameEvent("game_start", { resumed: resuming });
  trackLevelStart();
  jingle([523, 659, 784], 0.08);
}
function resetProfileProgress() {
  if (activeProfileIdx < 0) return;
  const p = profiles[activeProfileIdx];
  const d = DIFFS[p.diff] || DIFFS.leichter;
  p.levelIdx = 0; p.score = 0; p.lives = d.lives; p.pokeballs = d.balls;
  p.masterBalls = 0; p.sticks = 0; p.cucumbers = 0; p.stars = 0; p.crowned = false;
  p.team = null; p.progress = null; p.stats = { battles: 0, caught: 0, evolutions: 0 };
  persistProfiles();
  titleSel = 0; toast("Fortschritt von " + p.name + " zurückgesetzt.", "#f88");
}
// ── Groups screen update ──────────────────────────────────────────────
function updateGroups() {
  const PG = globalThis.PokeGroups;
  if (!PG) { titleStep = "profile"; return; }
  const prof = profiles[activeProfileIdx];
  if (!prof) { titleStep = "profile"; return; }
  const groups = prof.groups || [];
  if (groupCopied > 0) groupCopied--;

  if (groupInputMode) {
    // Text input active
    if (pressed.Backspace && groupInput.length) { groupInput = groupInput.slice(0, -1); beep(500, 0.03); }
    if (pressed.Escape) { groupInputMode = null; groupInput = ""; groupError = ""; beep(400, 0.04); }
    if (pressed.Enter && groupInput.trim() && !groupLoading) {
      groupLoading = true; groupError = ""; groupSuccess = "";
      if (groupInputMode === "join") {
        PG.joinGroup(groupInput.trim(), prof).then(() => {
          groupLoading = false; groupInputMode = null; groupInput = ""; groupSuccess = "Beigetreten!"; jingle([523, 659, 784], 0.08);
        }).catch(err => {
          groupLoading = false;
          groupError = err.message === "notfound" ? "Gruppe nicht gefunden." : err.message === "already" ? "Schon Mitglied." : err.message === "full" ? "Gruppe ist voll." : "Fehler beim Beitreten.";
          beep(200, 0.1);
        });
      } else if (groupInputMode === "create") {
        PG.createGroup(groupInput.trim(), prof).then(code => {
          groupLoading = false; groupInputMode = null; groupInput = ""; groupSuccess = "Erstellt! Code: " + code; jingle([523, 659, 784, 1047], 0.08);
        }).catch(() => {
          groupLoading = false; groupError = "Erstellen fehlgeschlagen."; beep(200, 0.1);
        });
      }
    }
  } else {
    // Navigation: 0..groups.length-1 = group items, then "join", "create"
    const total = groups.length + 2;
    if (pressed.ArrowUp || pressed.KeyW) { groupSel = (groupSel - 1 + total) % total; beep(600, 0.03); groupError = ""; groupSuccess = ""; }
    if (pressed.ArrowDown || pressed.KeyS) { groupSel = (groupSel + 1) % total; beep(600, 0.03); groupError = ""; groupSuccess = ""; }
    if (pressed.Escape) { titleStep = "profile"; titleSel = activeProfileIdx; beep(400, 0.04); }
    if (pressed.Enter || pressed.Space) {
      if (groupSel < groups.length) {
        // Open leaderboard for selected group
        groupLoading = true; groupError = "";
        PG.loadLeaderboard(groups[groupSel]).then(data => {
          groupData = data; groupLoading = false; groupSel = 0;
          titleStep = "leaderboard"; beep(800, 0.03);
        }).catch(() => { groupLoading = false; groupError = "Laden fehlgeschlagen."; beep(200, 0.1); });
      } else if (groupSel === groups.length) {
        groupInputMode = "join"; groupInput = ""; groupError = ""; beep(800, 0.03);
        // Check for pending join from URL
        if (PG.getPendingJoin) { const pending = PG.getPendingJoin(); if (pending) groupInput = pending; }
      } else {
        groupInputMode = "create"; groupInput = ""; groupError = ""; beep(800, 0.03);
      }
    }
    if ((pressed.Delete || pressed.Backspace) && groupSel < groups.length && !groupLoading) {
      groupLoading = true;
      PG.leaveGroup(groups[groupSel], prof).then(() => {
        groupLoading = false; groupSel = Math.min(groupSel, Math.max(0, (prof.groups || []).length + 1));
        groupSuccess = "Verlassen."; jingle([784, 523], 0.08);
      }).catch(() => { groupLoading = false; groupError = "Verlassen fehlgeschlagen."; beep(200, 0.1); });
    }
  }
}
function updateLeaderboard() {
  if (groupCopied > 0) groupCopied--;
  if (pressed.Escape) { titleStep = "groups"; groupSel = 0; groupData = null; beep(400, 0.04); }
  if ((pressed.Space || pressed.Enter) && groupData && typeof navigator !== "undefined" && navigator.clipboard) {
    const url = "https://pokemario.com/?join=" + groupData.code;
    navigator.clipboard.writeText(url).catch(() => {});
    groupCopied = 120; beep(800, 0.03);
  }
  if (pressed.Delete || pressed.Backspace) {
    const PG = globalThis.PokeGroups, prof = profiles[activeProfileIdx];
    if (PG && prof && groupData && !groupLoading) {
      groupLoading = true;
      PG.leaveGroup(groupData.code, prof).then(() => {
        groupLoading = false; titleStep = "groups"; groupData = null; groupSel = 0;
        groupSuccess = "Verlassen."; jingle([784, 523], 0.08);
      }).catch(() => { groupLoading = false; beep(200, 0.1); });
    }
  }
}
function handleTitleClick(cx, cy) {
  const np = profiles.length;
  if (titleStep === "profile") {
    const total = np < 5 ? np + 1 : np, cardW = 120, cardH = 168, gap = 10;
    const totalW = total * cardW + (total - 1) * gap, startX = Math.max(10, Math.floor((W - totalW) / 2)), startY = 118;
    for (let i = 0; i < total; i++) {
      const x = startX + i * (cardW + gap);
      if (cx >= x && cx < x + cardW && cy >= startY && cy < startY + cardH) {
        titleSel = i; beep(800, 0.03);
        if (i >= np) { titleStep = "newname"; nameInput = ""; titleSel = 0; }
        else { activeProfileIdx = i; loadProfileIntoState(); titleStep = "levelpick"; titleSel = profiles[activeProfileIdx].levelIdx || 0; }
        break;
      }
    }
  } else if (titleStep === "newdiff") {
    titleSel = cx < W / 2 ? 0 : 1; beep(600, 0.03);
    const d = titleSel ? DIFFS.schwerer : DIFFS.leichter;
    diff = d;
    profiles.push({ name: nameInput.trim(), diff: d.key, levelIdx: 0, score: 0, lives: d.lives, pokeballs: d.balls, masterBalls: 0, sticks: 0, cucumbers: 0, stars: 0, crowned: false, team: null, progress: null, stats: { battles: 0, caught: 0, evolutions: 0 }, lastPlayed: Date.now() });
    activeProfileIdx = profiles.length - 1;
    persistProfiles();
    titleStep = "levelpick"; titleSel = 0; beep(800, 0.03);
  } else if (titleStep === "levelpick") {
    const cols = 4, cardW = 160, cardH = 72, gap = 14;
    const totalW = cols * cardW + (cols - 1) * gap, startX = Math.floor((W - totalW) / 2), startY = 130;
    for (let i = 0; i < LEVELS.length; i++) {
      const col = i % cols, row = Math.floor(i / cols);
      const x = startX + col * (cardW + gap), y = startY + row * (cardH + gap);
      if (cx >= x && cx < x + cardW && cy >= y && cy < y + cardH) { titleSel = i; startGame(activeProfileIdx, i); break; }
    }
  }
}
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
  analyticsDeathsThisLevel++;
  lives--; beep(180, 0.4, "sawtooth"); burst(player.x + 15, player.y + 18, "#ffde00", 20);
  if (lives <= 0) { state = "gameover"; trackGameEvent("game_over", { deaths: analyticsDeathsThisLevel }); }
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
  if (mine < 0) { die(); return; }
  battle = { enemy, wild, mine, queue: [], step: null, phase: "msg", menu: 0, sub: 0, t: 0, text: "", shown: { me: team[mine].hp, wild: wild.hp }, anim: null, inBall: false, forced: false, evoKey: null, ballColor: "#e3350d" };
  state = "battle"; stats.battles++;
  trackGameEvent("battle_start", { battle_type: enemy.boss ? "boss" : "wild" });
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
    { fn: () => { const c = { ...b.wild, xp: 0 }; team.push(c); stats.caught++; score += 500; trackGameEvent("pokemon_caught", { pokemon_species: c.key }); insert({ text: `${monName(c)} ist jetzt in deinem Team (Platz ${team.length}).`, hold: 90 }, { fn: () => endBattle("caught") }); } }
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
  if (L.kind === "grunt") {
    g.fillStyle = "#1a1a2a"; Rc(-8 * z, -8 * z, 6 * z, 8 * z); Rc(2 * z, -8 * z, 6 * z, 8 * z);
    g.fillStyle = "#e0e0e8"; Rc(-10 * z, -28 * z, 20 * z, 20 * z); Rc(-16 * z, -26 * z, 6 * z, 12 * z); Rc(10 * z, -26 * z, 6 * z, 12 * z);
    g.fillStyle = "#cc0000"; g.font = `bold ${Math.round(9 * z)}px monospace`; g.textAlign = "center"; g.fillText("R", 0, -13 * z);
    g.fillStyle = B; E(0, -36 * z + bob, 9 * z, 9 * z);
    g.fillStyle = "#222"; E(0, -41 * z + bob, 9 * z, 5 * z);
    g.fillStyle = "#fff"; E(4 * z, -36 * z + bob, 2 * z, 2 * z); E(-4 * z, -36 * z + bob, 2 * z, 2 * z);
    g.fillStyle = "#222"; E(4.5 * z, -36 * z + bob, 1 * z, 1.2 * z); E(-3.5 * z, -36 * z + bob, 1 * z, 1.2 * z);
    if (o.cap) drawCap(0, -45 * z + bob, z * 0.9);
    g.restore(); return;
  }
  if (L.kind === "giovanni") {
    g.fillStyle = D; Rc(-9 * z, -10 * z, 7 * z, 10 * z); Rc(2 * z, -10 * z, 7 * z, 10 * z);
    g.fillStyle = D; Rc(-12 * z, -32 * z, 24 * z, 22 * z); Rc(-19 * z, -30 * z, 7 * z, 14 * z); Rc(12 * z, -30 * z, 7 * z, 14 * z);
    g.fillStyle = "#cc0000"; Rc(-1.5 * z, -30 * z, 3 * z, 14 * z);
    g.fillStyle = B; E(-15.5 * z, -16 * z, 3.5 * z, 3.5 * z); E(15.5 * z, -16 * z, 3.5 * z, 3.5 * z);
    g.fillStyle = B; E(0, -42 * z + bob, 11 * z, 11 * z);
    g.fillStyle = "#888"; E(-3 * z, -48 * z + bob, 8 * z, 5 * z);
    g.strokeStyle = "#222"; g.lineWidth = 2 * z; g.beginPath(); g.moveTo(-6 * z, -44 * z + bob); g.lineTo(-2 * z, -43 * z + bob); g.moveTo(6 * z, -44 * z + bob); g.lineTo(2 * z, -43 * z + bob); g.stroke(); g.lineWidth = 1;
    g.fillStyle = "#222"; E(-4 * z, -42 * z + bob, 1.2 * z, 1.4 * z); E(4 * z, -42 * z + bob, 1.2 * z, 1.4 * z);
    if (o.cap) drawCap(0, -53 * z + bob, z * 0.9);
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
  syncProfileNameField();
  ctx.clearRect(0, 0, W, H);
  if (state === "title") { drawTitle(); return; }
  if (state === "battle") { drawBattle(); return; }
  camDraw = prevCamX === undefined ? camX : prevCamX + (camX - prevCamX) * renderAlpha; // zwischen zwei Physikschritten interpolieren
  camDrawY = prevCamY === undefined ? camY : prevCamY + (camY - prevCamY) * renderAlpha;
  const sky = ctx.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, THEME.sky[0]); sky.addColorStop(1, THEME.sky[1]);
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
  if (THEME.ground === "museum") drawMuseum(); else if (THEME.ground === "castle") drawCastle(); else if (THEME.ground === "mixed") drawMixed(); else if (THEME.ground === "city") drawCity(); else if (THEME.ground === "jungle") drawJungle(); else if (THEME.ground === "stone") drawTemple(); else if (THEME.ground === "powerplant") drawPowerplant(); else { drawClouds(); if (THEME.hills) drawHills(); else drawCloudLayer(); }
  ctx.save(); ctx.translate(-camDraw, -camDrawY);
  const c0 = Math.floor(camDraw / TILE), c1 = c0 + W / TILE + 2, r0 = Math.max(0, Math.floor(camDrawY / TILE)), r1 = Math.min(ROWS, r0 + H / TILE + 2);
  for (let r = r0; r < r1; r++) for (let c = c0; c < c1 && c < COLS; c++) drawTile(solidMap[r][c], c * TILE, r * TILE, r);
  for (const m of movers) drawMover(m);
  drawFlag();
  for (const it of items) if (!it.taken) { if (it.star) { drawStar(it.x + 14, it.y + 14 + Math.sin(time * 0.1 + it.x) * 3, 13, true); } else if (it.cucumber) { drawCucumber(it.x + 14, it.y + 12 + Math.sin(time * 0.1 + it.x) * 3, -0.5); } else if (it.secretKey) { drawKey(it.x + 12, it.y + 12 + Math.sin(time * 0.1) * 3); } else if (it.stick) { drawStick(it.x + 14, it.y + 16 + Math.sin(time * 0.1 + it.x) * 3); } else if (it.master) { ctx.fillStyle = "rgba(200,150,255,.35)"; ctx.beginPath(); ctx.arc(it.x + 15, it.y + 15, 22 + Math.sin(time * 0.15) * 3, 0, 7); ctx.fill(); drawPokeball(it.x + 15, it.y + 15 + Math.sin(time * 0.1) * 3, 15, 0, "#8a4fd6"); } else drawPokeball(it.x + 12, it.y + 12 + Math.sin(time * 0.1 + it.x) * 3, 12); }
  if (progress && progress.level === levelIdx) for (const h of progress.huts) drawHut(h, state === "rest" && h.x === restX);
  for (const e of enemies) {
    drawMon(e.key, lerpX(e) + e.w / 2, lerpY(e) + e.h, 1, -e.dir || -1, { alpha: e.alive ? 1 : 0.5, walk: e.flyer || e.asleep || e.stationary ? 0 : time * 0.2, asleep: e.asleep });
    if (e.asleep && e.alive) { ctx.fillStyle = "#fff"; ctx.font = "bold 13px monospace"; ctx.textAlign = "left"; const t = (time * 0.5) % 40; ctx.globalAlpha = 1 - t / 40; uiText("z", e.x + e.w + 2 + t * 0.2, e.y - 4 - t * 0.6); ctx.globalAlpha = 1; }
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
        ctx.fillStyle = dark ? "rgba(0,0,0,.18)" : "rgba(255,255,255,.18)"; ctx.font = "bold 30px Georgia, serif"; ctx.textAlign = "center"; uiText(ep.name, (sx0 + sx1) / 2, top + 50);
        ctx.font = "bold 12px monospace"; uiText(ep.name === "Kabinett" ? "nur durch ein Gemälde erreichbar" : "Werke von Künstlerinnen", (sx0 + sx1) / 2, top + 70);
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
  if (portal) { ctx.fillStyle = `rgba(255,230,120,${0.18 + 0.1 * Math.sin(time * 0.08)})`; ctx.beginPath(); ctx.ellipse(x + 20, y + 36, 34, 8, 0, 0, 7); ctx.fill(); ctx.fillStyle = "#ffde00"; ctx.font = "bold 13px monospace"; ctx.textAlign = "center"; uiText("↓", x + 20, y + 26 + Math.sin(time * 0.1) * 2); }
  ctx.fillStyle = "rgba(0,0,0,.25)"; ctx.fillRect(fx + 5, fy + 6, fw, fh);
  ctx.fillStyle = portal ? "#d4a017" : "#8a6a2a"; ctx.fillRect(fx, fy, fw, fh); ctx.fillStyle = portal ? "#f3cf5a" : "#b89a52"; ctx.fillRect(fx + 3, fy + 3, fw - 6, fh - 6); ctx.fillStyle = "#f6f0e2"; ctx.fillRect(fx + 8, fy + 8, fw - 16, fh - 16);
  const iw = fw - 20, ih = fh - 20, ix = fx + 10, iy = fy + 10;
  if (a && a.img && a.img.complete && a.img.naturalWidth) {
    const s = Math.min(iw / a.img.naturalWidth, ih / a.img.naturalHeight), dw = a.img.naturalWidth * s, dh = a.img.naturalHeight * s;
    ctx.drawImage(a.img, ix + (iw - dw) / 2, iy + (ih - dh) / 2, dw, dh);
  } else { ctx.fillStyle = "#ddd"; ctx.fillRect(ix, iy, iw, ih); ctx.fillStyle = "#555"; ctx.font = "9px monospace"; ctx.textAlign = "center"; uiText(a ? a.artist : "Kunstwerk", x + 20, iy + ih / 2); }
  if (portal) { ctx.strokeStyle = `rgba(255,235,150,${0.5 + 0.4 * Math.sin(time * 0.08)})`; ctx.lineWidth = 3; ctx.strokeRect(fx - 2, fy - 2, fw + 4, fh + 4); ctx.lineWidth = 1; }
  ctx.fillStyle = "#f8f4ea"; ctx.fillRect(x + 20 - 56, y - 10, 112, 10); ctx.strokeStyle = "#8a6a2a"; ctx.strokeRect(x + 20 - 55.5, y - 9.5, 111, 9);
  ctx.fillStyle = "#222"; ctx.font = "8px monospace"; ctx.textAlign = "center"; uiText(a ? a.artist.slice(0, 26) : "", x + 20, y - 2.5);
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
  ctx.fillStyle = "#fff"; ctx.font = "bold 11px monospace"; ctx.textAlign = "center"; uiText("↓", x + 20, y - 4 + Math.sin(time * 0.1) * 2);
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
  if (resting) { ctx.fillStyle = "#fff"; ctx.font = "bold 16px monospace"; ctx.textAlign = "left"; for (let k = 0; k < 3; k++) { const t = (time * 0.6 + k * 20) % 60; ctx.globalAlpha = 1 - t / 60; uiText("z", x + 10 + k * 8 + t * 0.2, y - 60 - t); } ctx.globalAlpha = 1; }
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
    if (!seen) { ctx.fillStyle = `rgba(255,255,255,${0.25 + 0.15 * Math.sin(time * 0.1)})`; ctx.font = "bold 18px monospace"; ctx.textAlign = "center"; uiText("?", (rm.c0 + rm.c1 + 1) * TILE / 2, (rm.r0 + rm.r1 + 1) * TILE / 2 + 6); }
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
function drawPowerplant() {
  for (let i = 0; i < 6; i++) {
    const x = ((i * 380 - camDraw * 0.25) % (W + 500) + W + 500) % (W + 500) - 250;
    ctx.fillStyle = "#2a2a32"; ctx.fillRect(x, 40, 50, 380); ctx.fillRect(x + 60, 80, 36, 340);
    ctx.fillStyle = "#cc2222"; ctx.fillRect(x - 4, 36, 58, 10); ctx.fillRect(x + 56, 74, 44, 10);
    const dp = (time * 0.4 + i * 30) % 90;
    ctx.fillStyle = `rgba(200,200,210,${0.5 - dp / 90 * 0.4})`; ctx.beginPath(); ctx.arc(x + 25, 36 - dp, 8 + dp * 0.15, 0, 7); ctx.fill();
  }
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
  if (t === "Z") { ctx.fillStyle = "#ddd"; ctx.fillRect(x + 18, y - 60, 4, 100); ctx.fillStyle = "#b040e0"; ctx.beginPath(); ctx.moveTo(x + 20, y - 56); ctx.lineTo(x + 56, y - 40); ctx.lineTo(x + 20, y - 24); ctx.fill(); ctx.fillStyle = "#ffde00"; ctx.font = "bold 14px monospace"; ctx.textAlign = "center"; uiText("★", x + 36, y - 36); return; }
  if (t === "!") { ctx.fillStyle = "#8a5a2b"; ctx.fillRect(x + 17, y + 14, 6, 26); ctx.fillStyle = "#d2a060"; ctx.fillRect(x + 4, y + 4, 32, 18); ctx.fillStyle = "#222"; ctx.font = "bold 14px monospace"; ctx.textAlign = "center"; uiText("?", x + 20, y + 18); return; }
  if (t >= "1" && t <= "9" && THEME.pipes) {
    ctx.fillStyle = "#2e9e4a"; ctx.fillRect(x + 4, y + 12, TILE - 8, TILE - 12); ctx.fillStyle = "#1f7a36"; ctx.fillRect(x + 4, y + 12, 6, TILE - 12); ctx.fillStyle = "#5fd47a"; ctx.fillRect(x + 12, y + 12, 5, TILE - 12);
    ctx.fillStyle = "#2e9e4a"; ctx.fillRect(x - 2, y, TILE + 4, 14); ctx.fillStyle = "#1f7a36"; ctx.fillRect(x - 2, y, 6, 14); ctx.fillStyle = "#5fd47a"; ctx.fillRect(x + 6, y, 5, 14);
    ctx.strokeStyle = "#145a28"; ctx.strokeRect(x - 1.5, y + .5, TILE + 3, 13); ctx.strokeRect(x + 4.5, y + 12.5, TILE - 9, TILE - 13);
    ctx.fillStyle = "#fff"; ctx.font = "bold 11px monospace"; ctx.textAlign = "center"; uiText("↓", x + 20, y - 4 + Math.sin(time * 0.1) * 2); return;
  }
  if (t === "#" && THEME.ground === "mixed" && zoneAt(x) === "water") {
    ctx.fillStyle = "#d8c088"; ctx.fillRect(x, y, TILE, TILE); ctx.fillStyle = "#c0a870"; ctx.fillRect(x + 6, y + 10, 6, 4); ctx.fillRect(x + 24, y + 26, 6, 4); ctx.fillRect(x + 14, y + 30, 4, 3);
    if (top) { ctx.fillStyle = "#e8d8a0"; ctx.fillRect(x, y, TILE, 8); }
    ctx.strokeStyle = "rgba(0,0,0,.2)"; ctx.strokeRect(x + .5, y + .5, TILE - 1, TILE - 1); return;
  }
  if (t >= "1" && t <= "9") { drawDoor(x, y); return; }
  if (t === "E") {
    const on = progress && progress.electric && progress.electric.includes(String(x / TILE));
    ctx.fillStyle = "#2a2a3a"; ctx.fillRect(x + 4, y + 6, 32, 34);
    ctx.fillStyle = on ? "#f8d030" : "#444"; ctx.fillRect(x + 8, y + 10, 24, 22);
    ctx.fillStyle = on ? "#fff8c0" : "#222"; ctx.beginPath(); ctx.arc(x + 20, y + 21, 8, 0, 7); ctx.fill();
    if (on) { ctx.fillStyle = "#f8d030"; ctx.font = "bold 11px monospace"; ctx.textAlign = "center"; uiText("⚡", x + 20, y + 2 + Math.sin(time * 0.2) * 2); }
    else { ctx.fillStyle = "#f8d030"; ctx.font = "bold 13px monospace"; ctx.textAlign = "center"; uiText("⚡", x + 20, y + 2 + Math.sin(time * 0.15) * 2); }
    return;
  }
  if (t === "J") {
    ctx.fillStyle = "#4a5060"; ctx.fillRect(x, y, TILE, TILE);
    ctx.strokeStyle = "#f8d030"; ctx.lineWidth = 2;
    for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.moveTo(x + k * 10 + 2, y + 2); ctx.lineTo(x + k * 10 + 2, y + TILE - 2); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(x + 2, y + TILE / 2); ctx.lineTo(x + TILE - 2, y + TILE / 2); ctx.stroke();
    ctx.lineWidth = 1;
    if (time % 20 < 10) { ctx.fillStyle = "rgba(248,208,48,0.18)"; ctx.fillRect(x, y, TILE, TILE); }
    return;
  }
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
  } else if (t === "#" && THEME.ground === "powerplant") {
    ctx.fillStyle = ((x / TILE + row) % 2) ? "#3a3d4a" : "#2e3040"; ctx.fillRect(x, y, TILE, TILE);
    ctx.fillStyle = "#545870"; ctx.fillRect(x, y + 18, TILE, 2); ctx.fillRect(x + (row % 2 ? 20 : 6), y, 2, 18); ctx.fillRect(x + (row % 2 ? 6 : 24), y + 20, 2, 20);
    if (top) { ctx.fillStyle = "#6c7090"; ctx.fillRect(x, y, TILE, 6); }
    ctx.strokeStyle = "rgba(0,0,0,.4)"; ctx.strokeRect(x + .5, y + .5, TILE - 1, TILE - 1);
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
    ctx.fillStyle = "#fff"; ctx.font = "bold 26px monospace"; ctx.textAlign = "center"; uiText("?", x + TILE / 2, y + 30);
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
  uiText("PUNKTE " + String(score).padStart(6, "0"), 12, 23);
  drawPokeball(190, 17, 9); uiText("x " + pokeballs, 204, 23);
  uiText("♥ x " + lives, 250, 23);
  if (masterBalls > 0) drawPokeball(306, 17, 9, 0, "#8a4fd6");
  let hx = 326;
  if (THEME.secrets) { ctx.fillStyle = "#ffde00"; uiText("★ " + progress.secrets.length + "/" + THEME.secretTotal, hx, 23); ctx.fillStyle = "#fff"; hx += 54; }
  if (progress.key) { ctx.fillStyle = "#ffde00"; ctx.beginPath(); ctx.arc(hx + 6, 17, 5, 0, 7); ctx.fill(); ctx.fillRect(hx + 8, 16, 11, 3); ctx.fillRect(hx + 14, 19, 2, 4); ctx.fillStyle = "#fff"; hx += 26; }
  if (sticks > 0 || THEME.sticks) { drawStick(hx + 10, 17); uiText("x " + sticks, hx + 24, 23); hx += 56; }
  if (cucumbers > 0 || THEME.cucumbers) { drawCucumber(hx + 11, 17, -0.5); uiText("x " + cucumbers, hx + 26, 23); hx += 58; }
  if (stars > 0 || THEME.stars) { drawStar(hx + 10, 17, 8, false); ctx.fillStyle = crowned ? "#ffd700" : "#fff"; uiText(crowned ? "Krone!" : stars + "/5", hx + 22, 23); ctx.fillStyle = "#fff"; hx += 64; }
  if (air < AIR_MAX) { ctx.fillStyle = "rgba(0,0,0,.45)"; ctx.fillRect(W / 2 - 110, 40, 220, 18); ctx.fillStyle = "#333"; ctx.fillRect(W / 2 - 100, 45, 200, 8); ctx.fillStyle = air < AIR_MAX * 0.3 ? "#e04030" : "#4fc3f7"; ctx.fillRect(W / 2 - 100, 45, 200 * air / AIR_MAX, 8); ctx.fillStyle = "#fff"; ctx.font = "bold 11px monospace"; ctx.textAlign = "center"; uiText("LUFT", W / 2, 54); ctx.font = "bold 15px monospace"; }
  let tx = 470;
  team.forEach((m, i) => {
    const L = sp(m).look;
    ctx.fillStyle = i === leadIdx ? "rgba(255,222,0,.35)" : "rgba(255,255,255,.12)"; ctx.fillRect(tx - 2, 3, 52, 28);
    ctx.fillStyle = m.hp > 0 ? L.body : "#555"; ctx.beginPath(); ctx.arc(tx + 8, 14, 7, 0, 7); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.font = "bold 10px monospace"; uiText("L" + m.level, tx + 18, 13);
    ctx.fillStyle = "#333"; ctx.fillRect(tx + 18, 18, 30, 6);
    ctx.fillStyle = hpColor(m.hp / m.maxHp); ctx.fillRect(tx + 18, 18, 30 * m.hp / m.maxHp, 6);
    ctx.fillStyle = "#ddd"; ctx.font = "9px monospace"; uiText(String(i + 1), tx + 2, 29);
    tx += 55;
  });
  ctx.font = "bold 15px monospace";
  if (activeSign && (state === "play" || state === "rest")) {
    ctx.font = "bold 15px monospace"; const lines = textLines(activeSign, 640);
    const w = Math.max(...lines.map(l => ctx.measureText(l).width)) + 36, h = 14 + lines.length * 22;
    ctx.fillStyle = "rgba(60,40,20,.92)"; ctx.fillRect(W / 2 - w / 2, 40, w, h); ctx.strokeStyle = "#d2a060"; ctx.lineWidth = 2; ctx.strokeRect(W / 2 - w / 2, 40, w, h); ctx.lineWidth = 1;
    ctx.fillStyle = "#ffe9b0"; ctx.textAlign = "center"; lines.forEach((l, i) => ctx.fillText(l, W / 2, 60 + i * 22));
  }
  toasts.slice(-3).forEach((t, i) => {
    ctx.globalAlpha = Math.min(1, t.life / 20); ctx.fillStyle = "rgba(0,0,0,.55)"; const w = Math.min(W - 20, uiMeasure(t.text).width + 20);
    const off = activeSign ? 18 + 22 * Math.max(1, Math.ceil(uiMeasure(activeSign).width / 640)) : 0;
    ctx.fillRect(W / 2 - w / 2, 44 + off + i * 26, w, 22); ctx.fillStyle = t.color; ctx.textAlign = "center"; uiText(t.text, W / 2, 60 + off + i * 26, W - 40); ctx.globalAlpha = 1;
  });
  if (state === "rest") {
    ctx.fillStyle = "rgba(0,0,0,.45)"; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#ffde00"; ctx.font = "bold 26px monospace"; ctx.textAlign = "center"; uiText("Pause im Stockhaus... Zzz", W / 2, 120);
    ctx.fillStyle = "#fff"; ctx.font = "16px monospace"; uiText("Dein Team erholt sich vollständig.", W / 2, 150); uiText("Checkpoint gesetzt: Hier geht es nach einem verlorenen Leben weiter.", W / 2, 174);
  }
  if (state === "win" || state === "gameover") {
    ctx.fillStyle = "rgba(0,0,0,.65)"; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = state === "win" ? "#ffde00" : "#ff5050"; ctx.font = "bold 42px monospace"; ctx.textAlign = "center";
    uiText(state === "win" ? (winSecret ? "GEHEIMES ZIEL GEFUNDEN!" : "LEVEL GESCHAFFT!") : "GAME OVER", W / 2, 110);
    ctx.fillStyle = "#fff"; ctx.font = "18px monospace";
    uiText(`Modus: ${diff.name}   Punkte: ${score}   Kämpfe: ${stats.battles}   Gefangen: ${stats.caught}   Entwicklungen: ${stats.evolutions}`, W / 2, 150);
    if (THEME.secrets) { ctx.fillStyle = "#ffde00"; uiText(`★ Geheimnisse gefunden: ${progress.secrets.length} von ${THEME.secretTotal}`, W / 2, 174); ctx.fillStyle = "#fff"; }
    uiText("Dein Team:", W / 2, 195);
    team.forEach((m, i) => {
      const x = W / 2 - (team.length - 1) * 60 + i * 120;
      drawMon(m.key, x, 300, 1.4 / sp(m).look.size, 1, {});
      ctx.fillStyle = "#fff"; ctx.font = "13px monospace"; ctx.textAlign = "center"; uiText(`${monName(m)} L${m.level}`, x, 325);
    });
    ctx.font = "18px monospace";
    if (state === "win" && levelIdx < LEVELS.length - 1) { ctx.fillStyle = "#ffde00"; uiText("Space/Enter: weiter zu Level " + LEVELS[levelIdx + 1].name, W / 2, 380); ctx.fillStyle = "#fff"; }
    else if (state === "win") uiText("Du hast alle Level geschafft!", W / 2, 380);
    uiText("R: zurück zur Auswahl   L: Level wechseln", W / 2, 410);
  }
  if (time < 260 && state === "play") {
    ctx.fillStyle = "rgba(0,0,0,.5)"; ctx.fillRect(W / 2 - 250, H / 2 - 70, 500, 86);
    ctx.fillStyle = "#ffde00"; ctx.font = "bold 20px monospace"; ctx.textAlign = "center";
    uiText(THEME.intro[0], W / 2, H / 2 - 42);
    ctx.fillStyle = "#fff"; ctx.font = "13px monospace";
    uiText(THEME.intro[1], W / 2, H / 2 - 18);
    uiText(THEME.intro[2], W / 2, H / 2 + 2);
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
  ctx.textAlign = "center"; ctx.fillStyle = "#ffde00"; ctx.font = "bold 46px monospace"; uiText("POKÉ-MARIO", W / 2, 66);
  if (titleStep === "profile") drawProfileSelect();
  else if (titleStep === "newname") drawNameInput();
  else if (titleStep === "newdiff") drawDiffSelect();
  else if (titleStep === "levelpick") drawLevelPick();
  else if (titleStep === "groups") drawGroups();
  else if (titleStep === "leaderboard") drawLeaderboard();
}
function drawProfileSelect() {
  const np = profiles.length, maxProfiles = 5, showPlus = np < maxProfiles;
  ctx.fillStyle = "#fff"; ctx.font = "18px monospace"; ctx.textAlign = "center";
  uiText(np === 0 ? "Erstelle dein erstes Profil!" : "Profil wählen", W / 2, 100);
  const total = np + (showPlus ? 1 : 0), cardW = 120, cardH = 168, gap = 10;
  const totalW = total * cardW + (total - 1) * gap, startX = Math.max(10, Math.floor((W - totalW) / 2)), startY = 118;
  profiles.forEach((p, i) => {
    const x = startX + i * (cardW + gap), sel = titleSel === i;
    const d = DIFFS[p.diff] || DIFFS.leichter;
    ctx.fillStyle = sel ? "rgba(255,255,255,.96)" : "rgba(255,255,255,.78)"; ctx.fillRect(x, startY, cardW, cardH);
    ctx.strokeStyle = sel ? "#ffde00" : "#555"; ctx.lineWidth = sel ? 5 : 2; ctx.strokeRect(x, startY, cardW, cardH); ctx.lineWidth = 1;
    ctx.fillStyle = d.color; ctx.fillRect(x, startY, cardW, 22);
    ctx.fillStyle = "#fff"; ctx.font = "bold 13px monospace"; ctx.textAlign = "center";
    ctx.fillText(p.name.length > 10 ? p.name.slice(0, 9) + "…" : p.name, x + cardW / 2, startY + 16, cardW - 12);
    drawMon(d.mascot, x + cardW / 2, startY + 106, 1.2 / SPECIES[d.mascot].look.size, 1, {});
    ctx.fillStyle = "#333"; ctx.font = "11px monospace";
    uiText("Level " + ((p.levelIdx || 0) + 1), x + cardW / 2, startY + 124);
    uiText(d.label, x + cardW / 2, startY + 140);
    uiText((p.score || 0) + " Pkt", x + cardW / 2, startY + 156);
    if (sel) { ctx.fillStyle = "#e3350d"; ctx.fillRect(x + 2, startY + cardH - 20, cardW - 4, 18); ctx.fillStyle = "#fff"; ctx.font = "bold 11px monospace"; uiText(Math.floor(time / 30) % 2 ? "> WEITER <" : "AUSWÄHLEN", x + cardW / 2, startY + cardH - 6); }
  });
  if (showPlus) {
    const nx = startX + np * (cardW + gap), sel = titleSel === np;
    ctx.fillStyle = sel ? "rgba(255,255,255,.96)" : "rgba(255,255,255,.72)"; ctx.fillRect(nx, startY, cardW, cardH);
    ctx.strokeStyle = sel ? "#ffde00" : "#555"; ctx.lineWidth = sel ? 5 : 2; ctx.strokeRect(nx, startY, cardW, cardH); ctx.lineWidth = 1;
    ctx.fillStyle = "#2ecc71"; ctx.font = "bold 52px monospace"; ctx.textAlign = "center"; uiText("+", nx + cardW / 2, startY + 112);
    ctx.fillStyle = "#333"; ctx.font = "bold 12px monospace"; uiText("Neues Profil", nx + cardW / 2, startY + cardH - 14);
  }
  ctx.fillStyle = "#fff"; ctx.font = "12px monospace"; ctx.textAlign = "center";
  const groupHint = (globalThis.PokeGroups && globalThis.PokeStorage && globalThis.PokeStorage.getUser() && np > 0) ? "   G: Gruppen" : "";
  uiText(np > 0 ? "<- -> wählen   Space: auswählen   Del: löschen" + groupHint : "Space: Neues Profil erstellen", W / 2, 460);
}
function drawNameInput() {
  ctx.fillStyle = "#fff"; ctx.font = "22px monospace"; ctx.textAlign = "center"; uiText("Wie heisst du?", W / 2, 110);
  const bx = W / 2 - 200, by = 148, bw = 400, bh = 70;
  ctx.fillStyle = "rgba(255,255,255,.92)"; ctx.fillRect(bx, by, bw, bh);
  ctx.strokeStyle = "#ffde00"; ctx.lineWidth = 3; ctx.strokeRect(bx, by, bw, bh); ctx.lineWidth = 1;
  ctx.fillStyle = "#222"; ctx.font = "bold 28px monospace"; ctx.textAlign = "center";
  const cursor = Math.floor(time / 30) % 2 ? "|" : " ";
  ctx.fillText(nameInput + cursor, W / 2, by + 47, bw - 20);
  ctx.fillStyle = "#ccc"; ctx.font = "13px monospace";
  uiText("Buchstaben eingeben (max. 14)   Enter: weiter   Esc: zurück", W / 2, 262);
}
function drawDiffSelect() {
  ctx.fillStyle = "#fff"; ctx.font = "18px monospace"; ctx.textAlign = "center";
  uiText("Schwierigkeit für " + nameInput + " wählen", W / 2, 100);
  [DIFFS.leichter, DIFFS.schwerer].forEach((d, i) => {
    const x = 55 + i * 380, y = 120, w = 310, h = 280, sel = titleSel === i;
    ctx.fillStyle = sel ? "rgba(255,255,255,.96)" : "rgba(255,255,255,.72)"; ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = sel ? "#ffde00" : "#333"; ctx.lineWidth = sel ? 5 : 2; ctx.strokeRect(x, y, w, h); ctx.lineWidth = 1;
    ctx.textAlign = "center"; ctx.fillStyle = d.color; ctx.font = "bold 30px monospace"; uiText(d.name, x + w / 2, y + 42);
    ctx.fillStyle = "#333"; ctx.font = "bold 15px monospace"; uiText("(" + d.label + ")", x + w / 2, y + 66);
    drawMon(d.mascot, x + 58, y + 170, 1.6 / SPECIES[d.mascot].look.size, 1, { cap: true });
    ctx.fillStyle = "#222"; ctx.font = "12px monospace"; ctx.textAlign = "left";
    d.info.forEach((line, k) => uiText("• " + line, x + 104, y + 104 + k * 24, w - 112));
    ctx.textAlign = "center";
    if (sel) { ctx.fillStyle = "#e3350d"; ctx.font = "bold 16px monospace"; uiText(Math.floor(time / 30) % 2 ? "> Space / Enter <" : "> Los geht's! <", x + w / 2, y + h - 16); }
  });
  ctx.fillStyle = "#fff"; ctx.font = "14px monospace"; ctx.textAlign = "center"; uiText("<- ->: wählen   Space/Enter: weiter   Esc: zurück", W / 2, 460);
}
function drawLevelPick() {
  const prof = profiles[activeProfileIdx];
  ctx.fillStyle = "#fff"; ctx.font = "18px monospace"; ctx.textAlign = "center";
  uiText("Level wählen" + (prof ? " – " + prof.name : ""), W / 2, 100);
  const cols = 4, cardW = 160, cardH = 72, gap = 14;
  const totalW = cols * cardW + (cols - 1) * gap, startX = Math.floor((W - totalW) / 2), startY = 130;
  LEVELS.forEach((lv, i) => {
    const col = i % cols, row = Math.floor(i / cols);
    const x = startX + col * (cardW + gap), y = startY + row * (cardH + gap);
    const sel = titleSel === i, saved = prof && (prof.levelIdx || 0) === i;
    ctx.fillStyle = sel ? "rgba(255,255,255,.96)" : saved ? "rgba(255,255,180,.88)" : "rgba(255,255,255,.72)"; ctx.fillRect(x, y, cardW, cardH);
    ctx.strokeStyle = sel ? "#ffde00" : saved ? "#c0a800" : "#333"; ctx.lineWidth = sel ? 5 : saved ? 3 : 2; ctx.strokeRect(x, y, cardW, cardH); ctx.lineWidth = 1;
    ctx.fillStyle = "#e3350d"; ctx.font = "bold 20px monospace"; ctx.textAlign = "center"; uiText(i + 1 + "", x + cardW / 2, y + 26);
    ctx.fillStyle = "#222"; ctx.font = "11px monospace"; uiText(lv.name, x + cardW / 2, y + 50, cardW - 12);
    if (sel) { ctx.fillStyle = "#333"; ctx.font = "bold 11px monospace"; uiText("> Start <", x + cardW / 2, y + cardH - 6); }
  });
  ctx.fillStyle = "#fff"; ctx.font = "12px monospace"; ctx.textAlign = "center";
  uiText("Space/Enter: starten   Pfeile: navigieren" + (prof ? "   N: Fortschritt löschen" : ""), W / 2, 460);
}
function drawGroups() {
  const prof = profiles[activeProfileIdx];
  if (!prof) return;
  const groups = prof.groups || [];
  ctx.fillStyle = "#fff"; ctx.font = "18px monospace"; ctx.textAlign = "center";
  uiText("Gruppen — " + prof.name, W / 2, 100);

  const startY = 124, rowH = 32, panelX = 100, panelW = W - 200;

  // Group list
  groups.forEach((code, i) => {
    const y = startY + i * rowH, sel = !groupInputMode && groupSel === i;
    ctx.fillStyle = sel ? "rgba(255,222,0,.22)" : "rgba(255,255,255,.08)";
    ctx.fillRect(panelX, y, panelW, rowH - 4);
    if (sel) { ctx.strokeStyle = "#ffde00"; ctx.lineWidth = 2; ctx.strokeRect(panelX, y, panelW, rowH - 4); ctx.lineWidth = 1; }
    ctx.textAlign = "left"; ctx.fillStyle = "#ffde00"; ctx.font = "bold 14px monospace";
    uiText(code, panelX + 12, y + 20);
    ctx.fillStyle = "#fff"; ctx.font = "13px monospace";
    uiText(sel ? "> Anzeigen <" : "", panelX + panelW - 120, y + 20);
  });
  if (!groups.length) {
    ctx.fillStyle = "#aaa"; ctx.font = "13px monospace"; ctx.textAlign = "center";
    uiText("Noch keine Gruppen.", W / 2, startY + 16);
  }

  // Join row
  const joinY = startY + Math.max(groups.length, 1) * rowH + 16;
  const joinSel = !groupInputMode && groupSel === groups.length;
  const joinActive = groupInputMode === "join";
  ctx.fillStyle = joinSel || joinActive ? "rgba(255,222,0,.18)" : "rgba(255,255,255,.08)";
  ctx.fillRect(panelX, joinY, panelW, 38);
  if (joinSel || joinActive) { ctx.strokeStyle = "#ffde00"; ctx.lineWidth = 2; ctx.strokeRect(panelX, joinY, panelW, 38); ctx.lineWidth = 1; }
  ctx.textAlign = "left"; ctx.fillStyle = "#fff"; ctx.font = "bold 14px monospace";
  uiText("BEITRETEN", panelX + 12, joinY + 25);
  if (joinActive) {
    const cursor = Math.floor(time / 30) % 2 ? "|" : "";
    ctx.fillStyle = "#222"; ctx.fillRect(panelX + 150, joinY + 6, 200, 26);
    ctx.strokeStyle = "#ffde00"; ctx.lineWidth = 2; ctx.strokeRect(panelX + 150, joinY + 6, 200, 26); ctx.lineWidth = 1;
    ctx.fillStyle = "#ffde00"; ctx.font = "bold 18px monospace";
    uiText(groupInput + cursor, panelX + 160, joinY + 27);
    ctx.fillStyle = "#aaa"; ctx.font = "11px monospace";
    uiText("Code eingeben, Enter bestätigen", panelX + 370, joinY + 27);
  } else if (joinSel) {
    ctx.fillStyle = "#ccc"; ctx.font = "12px monospace";
    uiText("> Öffnen <", panelX + 150, joinY + 25);
  }

  // Create row
  const createY = joinY + 48;
  const createSel = !groupInputMode && groupSel === groups.length + 1;
  const createActive = groupInputMode === "create";
  ctx.fillStyle = createSel || createActive ? "rgba(255,222,0,.18)" : "rgba(255,255,255,.08)";
  ctx.fillRect(panelX, createY, panelW, 38);
  if (createSel || createActive) { ctx.strokeStyle = "#ffde00"; ctx.lineWidth = 2; ctx.strokeRect(panelX, createY, panelW, 38); ctx.lineWidth = 1; }
  ctx.textAlign = "left"; ctx.fillStyle = "#fff"; ctx.font = "bold 14px monospace";
  uiText("ERSTELLEN", panelX + 12, createY + 25);
  if (createActive) {
    const cursor = Math.floor(time / 30) % 2 ? "|" : "";
    ctx.fillStyle = "#222"; ctx.fillRect(panelX + 150, createY + 6, 280, 26);
    ctx.strokeStyle = "#ffde00"; ctx.lineWidth = 2; ctx.strokeRect(panelX + 150, createY + 6, 280, 26); ctx.lineWidth = 1;
    ctx.fillStyle = "#ffde00"; ctx.font = "bold 16px monospace";
    uiText(groupInput + cursor, panelX + 160, createY + 27);
    ctx.fillStyle = "#aaa"; ctx.font = "11px monospace";
    uiText("Name, Enter bestätigen", panelX + 450, createY + 27);
  } else if (createSel) {
    ctx.fillStyle = "#ccc"; ctx.font = "12px monospace";
    uiText("> Öffnen <", panelX + 150, createY + 25);
  }

  // Loading indicator
  if (groupLoading) {
    ctx.fillStyle = "rgba(0,0,0,.5)"; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#ffde00"; ctx.font = "bold 20px monospace"; ctx.textAlign = "center";
    uiText("Laden" + ".".repeat(Math.floor(time / 20) % 4), W / 2, H / 2);
  }

  // Error / success messages
  if (groupError) { ctx.fillStyle = "#ff6666"; ctx.font = "bold 13px monospace"; ctx.textAlign = "center"; uiText(groupError, W / 2, createY + 62); }
  if (groupSuccess) { ctx.fillStyle = "#66ff88"; ctx.font = "bold 13px monospace"; ctx.textAlign = "center"; uiText(groupSuccess, W / 2, createY + 62); }

  // Footer hints
  ctx.fillStyle = "#fff"; ctx.font = "12px monospace"; ctx.textAlign = "center";
  if (groupInputMode) uiText("Enter: bestätigen   Esc: abbrechen", W / 2, 460);
  else uiText("↑↓: navigieren   Space: öffnen   Del: verlassen   Esc: zurück", W / 2, 460);
}
function drawLeaderboard() {
  if (!groupData) return;
  const d = groupData, members = d.members;
  const user = globalThis.PokeStorage ? globalThis.PokeStorage.getUser() : null;
  const prof = profiles[activeProfileIdx];

  ctx.fillStyle = "#fff"; ctx.font = "bold 18px monospace"; ctx.textAlign = "center";
  uiText(d.name, W / 2, 100);
  ctx.fillStyle = "#ffde00"; ctx.font = "bold 14px monospace";
  uiText(d.code, W / 2, 122);

  // Table header
  const startY = 142, rowH = 28, panelX = 60, colX = [panelX + 10, panelX + 50, panelX + 300, panelX + 420, panelX + 540];
  ctx.fillStyle = "rgba(255,255,255,.15)"; ctx.fillRect(panelX, startY, W - 2 * panelX, rowH);
  ctx.fillStyle = "#ccc"; ctx.font = "bold 11px monospace"; ctx.textAlign = "left";
  uiText("#", colX[0], startY + 19); uiText("NAME", colX[1], startY + 19);
  ctx.textAlign = "right";
  uiText("PUNKTE", colX[2], startY + 19); uiText("LEVEL", colX[3], startY + 19); uiText("GEFANGEN", colX[4], startY + 19);

  // Rows
  const medals = ["\u{1F947}", "\u{1F948}", "\u{1F949}"];
  const maxVisible = 9;
  members.slice(0, maxVisible).forEach((m, i) => {
    const y = startY + (i + 1) * rowH;
    const isMe = user && prof && m.uid === user.uid && m.profileName === prof.name;
    const stale = m.lastPlayed && (Date.now() - m.lastPlayed > 90 * 24 * 60 * 60 * 1000);
    ctx.fillStyle = isMe ? "rgba(255,222,0,.18)" : (i % 2 ? "rgba(255,255,255,.05)" : "rgba(255,255,255,.1)");
    ctx.fillRect(panelX, y, W - 2 * panelX, rowH);
    if (isMe) { ctx.strokeStyle = "#ffde00"; ctx.lineWidth = 2; ctx.strokeRect(panelX, y, W - 2 * panelX, rowH); ctx.lineWidth = 1; }

    const alpha = stale ? 0.4 : 1;
    ctx.globalAlpha = alpha;
    ctx.textAlign = "left";
    ctx.fillStyle = i < 3 ? "#ffde00" : "#fff"; ctx.font = "bold 14px monospace";
    uiText(i < 3 ? medals[i] : (i + 1) + ".", colX[0], y + 19);
    ctx.fillStyle = isMe ? "#ffde00" : "#fff"; ctx.font = (isMe ? "bold " : "") + "13px monospace";
    uiText((m.profileName || m.displayName || "?").slice(0, 18), colX[1], y + 19);
    ctx.textAlign = "right"; ctx.font = "13px monospace"; ctx.fillStyle = "#fff";
    uiText("" + (m.score || 0), colX[2], y + 19);
    uiText("" + ((m.levelIdx || 0) + 1), colX[3], y + 19);
    uiText("" + (m.caught || 0), colX[4], y + 19);
    ctx.globalAlpha = 1;
  });
  if (members.length > maxVisible) {
    ctx.fillStyle = "#aaa"; ctx.font = "12px monospace"; ctx.textAlign = "center";
    uiText("... und " + (members.length - maxVisible) + " weitere", W / 2, startY + (maxVisible + 1) * rowH + 16);
  }
  if (!members.length) {
    ctx.fillStyle = "#aaa"; ctx.font = "14px monospace"; ctx.textAlign = "center";
    uiText("Noch keine Mitglieder.", W / 2, startY + rowH + 20);
  }

  // Share URL
  ctx.fillStyle = groupCopied > 0 ? "#66ff88" : "#aaa"; ctx.font = "12px monospace"; ctx.textAlign = "center";
  uiText(groupCopied > 0 ? "Link kopiert!" : "pokemario.com/?join=" + d.code, W / 2, 430);

  // Footer
  ctx.fillStyle = "#fff"; ctx.font = "12px monospace"; ctx.textAlign = "center";
  uiText("Space: Link kopieren   Del: verlassen   Esc: zurück", W / 2, 460);
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
    opts.forEach((o, i) => { const x = 480 + (i % 2) * 160, y = 428 + Math.floor(i / 2) * 28; ctx.fillStyle = i === b.menu ? "#f8d030" : "#fff"; uiText((i === b.menu ? "▶ " : "  ") + o, x, y, 150); });
  } else if (b.phase === "moves") {
    sp(m).moves.forEach((k, i) => {
      const mv = MOVES[k], y = 428 + i * 26;
      ctx.fillStyle = i === b.sub ? "#f8d030" : "#fff"; ctx.font = "bold 17px monospace"; uiText((i === b.sub ? "▶ " : "  ") + mv.name, 480, y, 174);
      ctx.fillStyle = TYPE_COLOR[mv.type]; ctx.fillRect(660, y - 12, 100, 16); ctx.fillStyle = "#222"; ctx.font = "bold 11px monospace"; uiText(mv.type.toUpperCase() + " " + mv.power, 664, y, 94);
    });
    ctx.fillStyle = "#aaa"; ctx.font = "11px monospace"; uiText("Esc: zurück", 480, 468);
  } else if (b.phase === "switch") {
    const choices = team.map((_, i) => i).filter(i => i !== b.mine && team[i].hp > 0);
    ctx.font = "bold 14px monospace";
    choices.slice(0, 3).forEach((idx, i) => { const t = team[idx], y = 424 + i * 18; ctx.fillStyle = i === b.sub ? "#f8d030" : "#fff"; uiText(`${i === b.sub ? "▶" : " "} ${monName(t)} L${t.level} ${t.hp}/${t.maxHp}`, 480, y); });
    if (choices.length > 3) { ctx.fillStyle = "#aaa"; uiText("...", 480, 476); }
  }
}
function drawStatusBox(x, y, m, shownHp, mine) {
  ctx.fillStyle = "rgba(255,255,255,.92)"; ctx.fillRect(x, y, 300, mine ? 84 : 66);
  ctx.strokeStyle = "#333"; ctx.lineWidth = 3; ctx.strokeRect(x, y, 300, mine ? 84 : 66); ctx.lineWidth = 1;
  ctx.fillStyle = "#222"; ctx.font = "bold 17px monospace"; ctx.textAlign = "left";
  uiText(monName(m).toUpperCase(), x + 12, y + 24, 225);
  ctx.textAlign = "right"; uiText("Lv" + m.level, x + 288, y + 24);
  const types = [sp(m).type].concat(sp(m).type2 ? [sp(m).type2] : []);
  types.forEach((tp, i) => { ctx.fillStyle = TYPE_COLOR[tp]; ctx.fillRect(x + 12 + i * 46, y + 30, 44, 12); ctx.fillStyle = "#222"; ctx.font = "bold 8px monospace"; ctx.textAlign = "left"; uiText(tp.toUpperCase(), x + 14 + i * 46, y + 39, 40); });
  ctx.fillStyle = "#222"; ctx.font = "bold 11px monospace"; uiText("KP", x + 106, y + 40);
  ctx.fillStyle = "#333"; ctx.fillRect(x + 128, y + 31, 156, 10);
  const f = Math.max(0, shownHp / m.maxHp); ctx.fillStyle = hpColor(f); ctx.fillRect(x + 128, y + 31, 156 * f, 10);
  if (mine) {
    ctx.fillStyle = "#222"; ctx.font = "bold 13px monospace"; ctx.textAlign = "right"; uiText(`${Math.ceil(shownHp)}/${m.maxHp}`, x + 284, y + 58);
    ctx.font = "bold 10px monospace"; ctx.textAlign = "left"; uiText("EP", x + 12, y + 76);
    ctx.fillStyle = "#333"; ctx.fillRect(x + 34, y + 68, 250, 8); ctx.fillStyle = "#3a8ee6"; ctx.fillRect(x + 34, y + 68, 250 * Math.min(1, m.xp / xpNeeded(m)), 8);
  }
}
function wrapText(text, x, y, maxW, lh) {
  const savedFont = ctx.font;
  const maxLines = battle && ['menu', 'moves', 'switch'].includes(battle.phase) ? 2 : 3;
  let lines = textLines(text, maxW), size = parseFloat(ctx.font.match(/[\d.]+px/)[0]);
  while (lines.length > maxLines && size > 12) {
    size--; ctx.font = savedFont.replace(/[\d.]+px/, size + 'px');
    lines = textLines(text, maxW);
  }
  const startY = maxLines === 3 ? y - 8 : y;
  lines.forEach((line, i) => ctx.fillText(line, x, startY + i * 20, maxW));
  ctx.font = savedFont;
}
// =====================================================================
// Loop
// =====================================================================
let last = 0, acc = 0; const STEP = 1000 / 60;
function loop(ts) {
  acc += Math.min(100, ts - last); last = ts;
  while (acc >= STEP) { try { update(); } catch(e) { console.error("update error:", e); } acc -= STEP; }
  renderAlpha = acc / STEP;
  try { draw(); } catch(e) { console.error("draw error:", e); }
  requestAnimationFrame(loop);
}
const startLevel = parseInt(location.hash.slice(1)) || 1; loadLevel(startLevel >= 1 && startLevel <= LEVELS.length ? startLevel - 1 : 0); loadProfiles(); init(false); state = "title"; requestAnimationFrame(loop);
// __TESTHOOK__
})();