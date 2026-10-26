// Shared by the static website and the standalone game. No gameplay/save keys are translated.
(() => {
  if (globalThis.PokeI18n) return;
  const languages = { en: 'English', es: 'Español', de: 'Deutsch', ja: '日本語', fr: 'Français' };
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
    for (const [source, en, es, fr, ja, de = source] of rows) {
      const values = { de, en, es, fr, ja };
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

globalThis.PokeI18n.add([["web.title","Poké-Mario – Free Pokémon Platformer Browser Game","Poké-Mario – Juego de plataformas Pokémon gratis online","Poké-Mario – Jeu de plateforme Pokémon gratuit en ligne","Poké-Mario – 無料で遊べるポケモン風ブラウザアクション","Poké-Mario – kostenloses Pokémon Jump’n’Run im Browser"],["web.description","Play Poké-Mario free in your browser: explore eight platforming levels, catch Pokémon and fight turn-based battles. No download or online account needed.","Juega a Poké-Mario gratis en tu navegador: explora ocho niveles de plataformas, captura Pokémon y lucha por turnos. Sin descargas ni cuenta online.","Joue gratuitement à Poké-Mario dans ton navigateur : huit niveaux de plateforme, des Pokémon à capturer et des combats au tour par tour. Sans téléchargement ni compte.","Poké-Marioをブラウザで無料プレイ。8つのステージを冒険し、ポケモンを捕まえてターン制バトルに挑戦。ダウンロードやオンライン登録は不要。","Poké-Mario kostenlos im Browser spielen: Springe durch acht Jump’n’Run-Level, fange Pokémon und bestreite rundenbasierte Kämpfe. Ohne Download oder Anmeldung."],["web.home","Poké-Mario home","Inicio de Poké-Mario","Accueil Poké-Mario","Poké-Mario ホーム","Poké-Mario Startseite"],["web.nav","About &amp; controls","Información y controles","Infos et commandes","遊び方と操作","Spielinfos &amp; Steuerung"],["web.eyebrow","Poké-Mario · Free browser platformer","Poké-Mario · Plataformas gratis online","Poké-Mario · Plateforme gratuite sur navigateur","Poké-Mario · 無料ブラウザアクション","Poké-Mario · Kostenloses Browser-Jump’n’Run"],["web.heading","A free Pokémon \u003cspan>platforming adventure\u003c/span>","Un \u003cspan>juego de plataformas\u003c/span> Pokémon gratis","Une \u003cspan>aventure de plateforme\u003c/span> Pokémon gratuite","ポケモン風\u003cspan>アクションゲーム\u003c/span>を無料で","Pokémon \u003cspan>Jump’n’Run\u003c/span> kostenlos spielen"],["web.intro","Jump through eight handcrafted pixel levels, meet wild Pokémon and catch them in turn-based battles. Poké-Mario is a free fan project that starts right in your browser, with no download or online account.","Salta por ocho niveles de píxeles diseñados a mano, encuentra Pokémon salvajes y captúralos en combates por turnos. Poké-Mario es un proyecto gratuito de fans que empieza en tu navegador, sin descargas ni cuenta online.","Saute à travers huit niveaux en pixel art, rencontre des Pokémon sauvages et capture-les dans des combats au tour par tour. Poké-Mario est un projet de fans gratuit, accessible dans ton navigateur sans téléchargement ni compte.","手作りのピクセルステージ8つを冒険し、野生のポケモンと出会い、ターン制バトルで仲間にしよう。Poké-Marioはブラウザですぐに遊べる無料のファン作品。ダウンロードやオンライン登録は不要です。","Springe durch acht handgebaute Pixel-Level, triff wilde Pokémon und fang sie nach rundenbasierten Kämpfen. Poké-Mario ist ein kostenloses Fanprojekt, das direkt im Browser startet – ohne Download und ohne Anmeldung."],["web.play","\u003cspan aria-hidden=\"true\">▶\u003c/span> Play free now","\u003cspan aria-hidden=\"true\">▶\u003c/span> Jugar gratis ahora","\u003cspan aria-hidden=\"true\">▶\u003c/span> Jouer gratuitement","\u003cspan aria-hidden=\"true\">▶\u003c/span> 今すぐ無料で遊ぶ","\u003cspan aria-hidden=\"true\">▶\u003c/span> Jetzt kostenlos spielen"],["web.note","Two difficulties · Saved in your browser","Dos dificultades · Guardado en el navegador","Deux difficultés · Sauvegarde dans le navigateur","難易度は2種類 · ブラウザに保存","Zwei Schwierigkeitsgrade · Spielstand im Browser"],["web.features","Game features","Características del juego","Caractéristiques du jeu","ゲームの特徴","Spielmerkmale"],["web.levels","8 levels","8 niveles","8 niveaux","8つのステージ","8 Level"],["web.catch","Catch Pokémon","Captura Pokémon","Capture des Pokémon","ポケモンを捕まえよう","Pokémon fangen"],["web.pixel","Retro pixel art","Píxeles retro","Pixel art rétro","レトロなドット絵","Retro-Pixelgrafik"],["web.download","No download","Sin descargas","Sans téléchargement","ダウンロード不要","Kein Download"],["web.noscript","Enable JavaScript to play. You can still read the game information without it.","Activa JavaScript para jugar. La información del juego sigue disponible sin él.","Active JavaScript pour jouer. Les informations restent lisibles sans JavaScript.","プレイにはJavaScriptを有効にしてください。ゲームの説明は無効でも読めます。","Zum Spielen JavaScript aktivieren. Die Spielinfos auf dieser Seite bleiben auch ohne JavaScript verfügbar."],["web.world","POKÉ-MARIO · WORLD 1-7","POKÉ-MARIO · MUNDO 1-7","POKÉ-MARIO · MONDE 1-7","POKÉ-MARIO · ワールド 1-7","POKÉ-MARIO · WELT 1-7"],["web.preview","GAMEPLAY PREVIEW","VISTA PREVIA","APERÇU DU JEU","ゲームプレビュー","GAMEPLAY-VORSCHAU"],["web.sceneTitle","Animated preview of level 1-7, Cucumber Castle","Vista animada del nivel 1-7, Castillo Pepino","Aperçu animé du niveau 1-7, Château Concombre","ステージ1-7「キュウリ城」のアニメーションプレビュー","Animierte Gameplay-Vorschau aus Level 1-7, Gurkenburg"],["web.sceneDesc","Pikachu jumps between floating platforms in a dark pixel castle. A cucumber flies past a pumpkin enemy.","Pikachu salta entre plataformas flotantes de un castillo de píxeles. Un pepino pasa volando junto a una calabaza enemiga.","Pikachu saute entre des plateformes flottantes dans un château en pixels. Un concombre vole devant une citrouille ennemie.","暗いドット絵の城で、ピカチュウが浮かぶ足場をジャンプ。キュウリが敵のカボチャのそばを飛んでいきます。","Ein Pikachu springt zwischen schwebenden Plattformen durch eine dunkle Pixelburg. Eine Gurke fliegt an einem Kürbisgegner vorbei."],["web.score","❤❤❤  SCORE  07350","❤❤❤  PUNTOS  07350","❤❤❤  SCORE  07350","❤❤❤  スコア  07350","❤❤❤  PUNKTE  07350"],["web.castle","Level 1-7 · Cucumber Castle","Nivel 1-7 · Castillo Pepino","Niveau 1-7 · Château Concombre","ステージ1-7 · キュウリ城","Level 1-7 · Gurkenburg"],["web.actions","Jump · collect · battle","Salta · recoge · lucha","Saute · collecte · combats","ジャンプ · 収集 · バトル","Springen · sammeln · kämpfen"],["web.aboutEyebrow","Your next adventure","Tu próxima aventura","Ton aventure t'attend","こんな冒険が待っている","Das erwartet dich"],["web.aboutTitle","A Pokémon browser game with platforming levels","Un juego Pokémon de plataformas en el navegador","Un jeu Pokémon sur navigateur avec des niveaux de plateforme","ブラウザで遊ぶポケモン風アクション","Ein Pokémon-Browsergame mit Jump’n’Run-Levels"],["web.about","Poké-Mario combines classic platforming with Pokémon collecting. Explore eight different levels, dodge obstacles and encounter wild Pokémon. Weaken them in turn-based battles, then try catching them with a Poké Ball. Choose one of two difficulties and continue later using a profile saved in your browser.","Poké-Mario combina las plataformas clásicas con la colección de Pokémon. Explora ocho niveles, esquiva obstáculos y encuentra Pokémon salvajes. Debilítalos en combates por turnos e intenta capturarlos con una Poké Ball. Elige una de las dos dificultades y continúa después con tu perfil guardado en el navegador.","Poké-Mario mêle plateforme classique et collection de Pokémon. Explore huit niveaux, évite les obstacles et rencontre des Pokémon sauvages. Affaiblis-les au tour par tour, puis essaie de les capturer avec une Poké Ball. Choisis une difficulté et reprends plus tard avec ton profil sauvegardé dans le navigateur.","Poké-Marioは、昔ながらのジャンプアクションとポケモン集めを組み合わせたゲームです。8つのステージで障害物をかわし、野生のポケモンと出会おう。ターン制バトルで弱らせてからボールで捕獲。難易度は2種類で、ブラウザに保存したプロフィールから後で続きを遊べます。","Poké-Mario verbindet klassisches Plattformspiel mit Pokémon-Sammeln: Erkunde acht unterschiedliche Level, weiche Hindernissen aus und begegne wilden Pokémon. Schwäche sie im rundenbasierten Kampf und versuche, sie mit einem Pokéball zu fangen. Wähle zwischen zwei Schwierigkeitsgraden und setze deine Reise später mit dem lokal gespeicherten Spielstand fort."],["web.feature1Title","Eight varied levels","Ocho niveles diferentes","Huit niveaux variés","変化に富んだ8ステージ","Acht abwechslungsreiche Level"],["web.feature1","From meadows and clouds to the jungle, Cucumber Castle and the art museum, each area has its own obstacles and secrets.","De praderas y nubes a la jungla, el Castillo Pepino y el museo de arte: cada zona tiene sus obstáculos y secretos.","De la prairie aux nuages, de la jungle au Château Concombre et au musée d'art, chaque zone a ses obstacles et ses secrets.","草原、雲、ジャングル、キュウリ城、美術館。それぞれのエリアに固有の障害物と秘密があります。","Von der Wiese über Wolken, Dschungel und Gurkenburg bis zum Kunstmuseum – jedes Gebiet bringt eigene Hindernisse und Geheimnisse."],["web.feature2Title","Catch and build your team","Captura y forma tu equipo","Capture et forme ton équipe","捕まえてチームを作ろう","Fangen statt nur vorbeispringen"],["web.feature2","Wild Pokémon trigger turn-based battles. Pick your team, choose effective moves and throw Poké Balls.","Los Pokémon salvajes inician combates por turnos. Elige tu equipo, usa ataques eficaces y lanza Poké Balls.","Les Pokémon sauvages lancent des combats au tour par tour. Choisis ton équipe, les bonnes attaques et lance des Poké Balls.","野生のポケモンに出会うとターン制バトル。チームを選び、相性のよい技を使って、ボールを投げよう。","Wilde Pokémon starten rundenbasierte Kämpfe. Wähle dein Team, setze passende Attacken ein und wirf Pokébälle."],["web.feature3Title","Play instantly in your browser","Juega al instante en tu navegador","Joue tout de suite dans ton navigateur","ブラウザですぐプレイ","Sofort im Browser spielen"],["web.feature3","No installer or online account needed. Progress is saved locally in your browser, with two difficulty settings to choose from.","Sin instalación ni cuenta online. Tu progreso se guarda en tu navegador y puedes elegir entre dos dificultades.","Ni installation ni compte en ligne. Ta progression est sauvegardée dans ton navigateur ; deux difficultés sont proposées.","インストールもオンラインアカウントも不要。進行状況はブラウザに保存され、難易度も2種類から選べます。","Kein Installer und kein Konto nötig. Die Fortschritte werden lokal in deinem Browser gespeichert; zwei Schwierigkeitsgrade stehen bereit."],["web.controlsEyebrow","Quick start","Guía rápida","Pour bien démarrer","かんたんガイド","Schnell erklärt"],["web.controlsTitle","Controls and frequently asked questions","Controles y preguntas frecuentes","Commandes et questions fréquentes","操作方法とよくある質問","Steuerung und häufige Fragen"],["web.q1","How do I play Poké-Mario?","¿Cómo se juega a Poké-Mario?","Comment jouer à Poké-Mario ?","Poké-Marioの遊び方は？","Wie kann ich Poké-Mario spielen?"],["web.a1","Click “Play free now” to load the game. Use a keyboard: ← and → to move, Space or ↑ to jump, and X to throw a Poké Ball and start a battle.","Pulsa «Jugar gratis ahora». Usa el teclado: ← y → para moverte, Espacio o ↑ para saltar y X para lanzar una Poké Ball e iniciar un combate.","Clique sur « Jouer gratuitement ». Au clavier : ← et → pour bouger, Espace ou ↑ pour sauter et X pour lancer une Poké Ball et combattre.","「今すぐ無料で遊ぶ」を押してゲームを読み込みます。キーボードの← →で移動、Spaceまたは↑でジャンプ、Xでボールを投げてバトルを開始します。","Klicke auf „Jetzt kostenlos spielen“. Das Spiel lädt im Browser. Nutze ← und → zum Laufen, Leertaste oder ↑ zum Springen und X, um einen Pokéball zu werfen und einen Kampf zu beginnen."],["web.q2","Can I play a Pokémon platformer online for free without downloading anything?","¿Puedo jugar gratis online a Poké-Mario sin descargarlo?","Peut-on jouer gratuitement à Poké-Mario en ligne sans rien télécharger ?","Poké-Marioはダウンロードなしで無料プレイできますか？","Kann ich Poké-Mario kostenlos online ohne Download spielen?"],["web.a2","Yes. Poké-Mario is a free Pokémon platform game that runs in your browser. Jump through eight levels, catch wild Pokémon and fight turn-based battles, with no download or online account.","Sí. Poké-Mario es un juego gratuito de plataformas Pokémon para navegador. Salta por ocho niveles, captura Pokémon salvajes y lucha por turnos, sin descargas ni cuenta online.","Oui. Poké-Mario est un jeu de plateforme Pokémon gratuit sur navigateur. Parcours huit niveaux, capture des Pokémon sauvages et livre des combats au tour par tour, sans téléchargement ni compte en ligne.","はい。Poké-Marioはブラウザで遊べる無料のポケモンプラットフォームゲームです。8つのステージでジャンプし、野生のポケモンを捕まえてターン制バトルに挑戦。ダウンロードやオンラインアカウントは不要です。","Ja. Poké-Mario ist ein kostenloses Pokémon-Plattformspiel im Browser: Springe durch acht Jump’n’Run-Level, fange wilde Pokémon und kämpfe rundenbasiert – ohne Download und ohne Online-Konto."],["web.q3","How do I get through Cucumber Castle (Level 1-7)?","¿Cómo superar el Castillo Pepino (nivel 1-7)?","Comment traverser le Château Concombre (niveau 1-7) ?","ステージ1-7「キュウリ城」の進み方は？","Wie komme ich durch die Gurkenburg (Level 1-7)?"],["web.a3","Cucumber Castle is level seven. Jump across the dark castle platforms, collect cucumbers and press G to throw them at pumpkins blocking your way.","El Castillo Pepino es el nivel siete. Salta por las plataformas del castillo oscuro, recoge pepinos y pulsa G para lanzarlos contra las calabazas que bloquean el camino.","Le Château Concombre est le septième niveau. Saute sur les plateformes du château sombre, ramasse des concombres et appuie sur G pour les lancer sur les citrouilles qui bloquent le passage.","キュウリ城は7番目のステージです。暗い城の足場をジャンプで進み、キュウリを集めてGで投げ、道をふさぐカボチャをどかしましょう。","Gurkenburg ist das siebte Level. Springe über die Plattformen der dunklen Burg, sammle Gurken und wirf sie mit G, um Kürbisse aus dem Weg zu räumen."],["web.q5","How do I catch wild Pokémon in Poké-Mario?","¿Cómo capturo Pokémon salvajes en Poké-Mario?","Comment capturer des Pokémon sauvages dans Poké-Mario ?","Poké-Marioで野生のポケモンを捕まえるには？","Wie fange ich wilde Pokémon in Poké-Mario?"],["web.a5","Meet a wild Pokémon to start a turn-based battle. Weaken it with moves, then choose a Poké Ball from the battle menu to try to catch it.","Encuentra un Pokémon salvaje para iniciar un combate por turnos. Debilítalo con ataques y elige una Poké Ball en el menú de combate para intentar capturarlo.","Rencontre un Pokémon sauvage pour lancer un combat au tour par tour. Affaiblis-le avec des attaques, puis choisis une Poké Ball dans le menu de combat pour tenter de le capturer.","野生のポケモンに出会うとターン制バトルが始まります。技で弱らせ、バトルメニューからボールを選んで捕獲に挑戦しましょう。","Begegne einem wilden Pokémon, um einen rundenbasierten Kampf zu starten. Schwäche es mit Attacken und wähle im Kampfmenü einen Pokéball, um einen Fangversuch zu starten."],["web.q6","Which Pokémon game combines platforming with turn-based battles?","¿Qué juego Pokémon combina plataformas y combates por turnos?","Quel jeu Pokémon associe plateforme et combats au tour par tour ?","ジャンプアクションとターン制バトルを組み合わせたポケモンゲームは？","Welche Pokémon-Spielart verbindet Jump’n’Run und rundenbasierte Kämpfe?"],["web.a6","Poké-Mario combines classic platforming with catching Pokémon and turn-based battles. This free fan project runs right in your browser.","Poké-Mario combina plataformas clásicas con capturas de Pokémon y combates por turnos. Este proyecto gratuito de fans funciona directamente en el navegador.","Poké-Mario associe plateforme classique, capture de Pokémon et combats au tour par tour. Ce projet gratuit de fans se joue directement dans le navigateur.","Poké-Marioは昔ながらのプラットフォームアクションに、ポケモン捕獲とターン制バトルを組み合わせた無料のファン作品です。ブラウザですぐに遊べます。","Poké-Mario kombiniert ein klassisches Plattformspiel mit Pokémon-Fang und rundenbasierten Kämpfen. Das kostenlose Fanprojekt läuft direkt im Browser."],["web.q4","Is my progress saved?","¿Se guarda mi progreso?","Ma progression est-elle sauvegardée ?","進行状況は保存されますか？","Wird mein Fortschritt gespeichert?"],["web.a4","Your profile is stored locally in your browser. It does not sync between devices. Clearing browser data also removes local saves.","Tu perfil se guarda localmente en el navegador. No se sincroniza entre dispositivos. Si borras los datos del navegador, se borran las partidas.","Ton profil reste dans ton navigateur, sans synchronisation entre appareils. Effacer les données du navigateur supprime aussi les sauvegardes.","プロフィールはブラウザ内に保存されます。別の端末とは同期されません。ブラウザのデータを消すとセーブデータも削除されます。","Der Spielstand wird lokal in deinem Browser abgelegt. Er wird nicht zwischen verschiedenen Geräten synchronisiert."],["web.fanTitle","An unofficial fan project","Un proyecto de fans no oficial","Un projet de fans non officiel","非公式のファン作品","Ein inoffizielles Fanprojekt"],["web.fan","Poké-Mario is a free, non-commercial fan project, unaffiliated with Nintendo, Game Freak or The Pokémon Company. Pokémon and related names are trademarks of their respective owners.","Poké-Mario es un proyecto gratuito y no comercial de fans, sin relación con Nintendo, Game Freak ni The Pokémon Company. Pokémon y sus nombres relacionados son marcas de sus respectivos propietarios.","Poké-Mario est un projet de fans gratuit et non commercial, sans lien avec Nintendo, Game Freak ou The Pokémon Company. Pokémon et les noms associés sont des marques de leurs propriétaires respectifs.","Poké-Marioは無料・非営利のファン作品で、任天堂、ゲームフリーク、株式会社ポケモンとは関係ありません。ポケモンおよび関連名称は各権利者の商標です。","Poké-Mario ist ein kostenloses, nicht-kommerzielles Fanprojekt und steht in keiner Verbindung zu Nintendo, Game Freak oder The Pokémon Company. Pokémon und zugehörige Namen sind Marken ihrer jeweiligen Rechteinhaber."],["web.footer","Poké-Mario · Free fan-made platformer · Saves stay in your browser.","Poké-Mario · Plataformas gratuito de fans · Partidas guardadas en tu navegador.","Poké-Mario · Plateforme gratuite de fans · Sauvegardes dans ton navigateur.","Poké-Mario · 無料のファン制作アクション · セーブはブラウザ内に保存","Poké-Mario · Kostenloses Jump’n’Run-Fanprojekt · Spielstände bleiben in deinem Browser."],["ui.language","Language","Idioma","Langue","言語","Sprache"],["ui.auto","Browser language","Idioma del navegador","Langue du navigateur","ブラウザの言語","Browsersprache"],["ui.loading","Loading game…","Cargando juego…","Chargement du jeu…","ゲームを読み込み中…","Spiel wird geladen …"],["ui.error","The game could not load. Reload the page and try again.","No se pudo cargar el juego. Recarga la página e inténtalo de nuevo.","Le jeu n'a pas pu charger. Recharge la page et réessaie.","ゲームを読み込めませんでした。ページを再読み込みしてください。","Das Spiel konnte nicht geladen werden. Bitte Seite neu laden und erneut versuchen."],["ui.game","Poké-Mario game","Juego Poké-Mario","Jeu Poké-Mario","Poké-Mario ゲーム","Poké-Mario-Spiel"],["ui.hint","← → move · Space / ↑ jump · X Poké Ball · 1–6 team · ↓ door/pipe · G cucumber · B hut (5 sticks) · L level · R menu. Battle: arrows to choose, Space/Enter to confirm, Esc to go back.","← → moverse · Espacio / ↑ saltar · X Poké Ball · 1–6 equipo · ↓ puerta/tubería · G pepino · B cabaña (5 palos) · L nivel · R menú. Combate: flechas elegir, Espacio/Enter confirmar, Esc volver.","← → bouger · Espace / ↑ sauter · X Poké Ball · 1–6 équipe · ↓ porte/tuyau · G concombre · B cabane (5 bâtons) · L niveau · R menu. Combat : flèches pour choisir, Espace/Entrée pour confirmer, Échap pour revenir.","← → 移動 · Space / ↑ ジャンプ · X ボール · 1–6 チーム · ↓ 扉/土管 · G キュウリ · B 小屋（枝5本）· L ステージ · R メニュー。バトル：矢印で選択、Space/Enterで決定、Escで戻る。","← → bewegen · Space / ↑ springen · X Pokéball · 1–6 Team · ↓ Tür/Rohr · G Gurke · B Stockhaus (5 Stöcke) · L Level · R Auswahl. Kampf: Pfeile Menü, Space/Enter bestätigen, Esc zurück."]]);
(() => {
  const i18n = globalThis.PokeI18n;
  const base = new URL('../', document.currentScript.src);
  i18n.assetBase = base.href;
  const selector = document.getElementById('language');
  const localeCodes = { en: 'en_US', es: 'es_ES', de: 'de_DE', ja: 'ja_JP', fr: 'fr_FR' };
  function renderLanguage() {
    const lang = i18n.language;
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(node => { node.innerHTML = i18n.t(node.dataset.i18n); });
    document.querySelectorAll('[data-i18n-aria]').forEach(node => node.setAttribute('aria-label', i18n.t(node.dataset.i18nAria)));
    selector.value = lang;
    document.title = i18n.t('web.title');
    const canonical = `https://pokemario.com/${lang}/`;
    document.querySelector('link[rel="canonical"]').href = canonical;
    for (const [query, value] of [
      ['meta[name="description"]', i18n.t('web.description')],
      ['meta[property="og:title"]', i18n.t('web.title')],
      ['meta[property="og:description"]', i18n.t('web.description')],
      ['meta[property="og:locale"]', localeCodes[lang]],
      ['meta[property="og:url"]', canonical],
      ['meta[property="og:image"]', `https://pokemario.com/og-${lang}.png`],
      ['meta[property="og:image:alt"]', i18n.t('web.sceneTitle')],
      ['meta[name="twitter:title"]', i18n.t('web.title')],
      ['meta[name="twitter:description"]', i18n.t('web.description')],
      ['meta[name="twitter:image"]', `https://pokemario.com/og-${lang}.png`],
      ['meta[name="twitter:image:alt"]', i18n.t('web.sceneTitle')]
    ]) document.querySelector(query)?.setAttribute('content', value);
    const schema = document.querySelector('script[type="application/ld+json"]');
    const data = JSON.parse(schema.textContent);
    data['@graph'].forEach(item => {
      item.url = canonical; item.inLanguage = lang; item.description = i18n.t('web.description');
      if (item['@type'] === 'VideoGame') item['@id'] = canonical + '#game';
    });
    schema.textContent = JSON.stringify(data);
    const localizedURL = new URL(lang + '/', base);
    document.querySelector('[data-home]').href = localizedURL.href;
    document.querySelector('link[rel="icon"]').href = new URL('favicon.svg', base).href;
    document.querySelectorAll('[data-language]').forEach(link => {
      link.href = new URL(link.dataset.language + '/', base).href;
      if (link.dataset.language === lang) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    // Root adapts to browser/saved preference. Explicit locale URLs remain accessible.
    // Updating history rather than navigating keeps a running game intact.
    if (location.protocol !== 'file:' && location.pathname !== localizedURL.pathname) {
      history.replaceState(null, '', localizedURL.pathname + location.search + location.hash);
    }
  }
  selector.addEventListener('change', event => { i18n.setLanguage(event.target.value); selector.blur(); });
  document.querySelectorAll('[data-language]').forEach(link => link.addEventListener('click', event => {
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault(); i18n.setLanguage(link.dataset.language); link.blur();
  }));
  i18n.onChange(renderLanguage);
  renderLanguage();
  const button = document.getElementById('start');
  button.addEventListener('click', async () => {
    button.disabled = true;
    document.body.classList.add('playing');
    const game = document.createElement('main');
    game.id = 'game-screen';
    game.innerHTML = '<div class="game-loading" role="status" data-i18n="ui.loading"></div><canvas id="game" width="800" height="480" tabindex="0" data-i18n-aria="ui.game"></canvas><div id="hint" data-i18n="ui.hint"></div>';
    document.getElementById('start-screen').replaceWith(game);
    renderLanguage();
    const css = document.createElement('link');
    css.rel = 'stylesheet'; css.href = new URL('assets/game.95a15eee1a586a16.css', base).href;
    try {
      await new Promise((resolve, reject) => { css.onload = resolve; css.onerror = reject; document.head.append(css); });
      const script = document.createElement('script');
      script.src = new URL('assets/game.294d27d209011d3e.js', base).href;
      await new Promise((resolve, reject) => { script.onload = resolve; script.onerror = reject; document.body.append(script); });
      game.querySelector('.game-loading')?.remove();
      document.getElementById('game').focus({ preventScroll: true });
    } catch (_) {
      game.innerHTML = '<p role="alert" data-i18n="ui.error"></p>';
      renderLanguage();
    }
  }, { once: true });
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    navigator.serviceWorker.register(new URL('sw.js', base), { scope: base.pathname }).catch(() => {});
  }
})();
