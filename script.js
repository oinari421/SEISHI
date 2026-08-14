// =========================================================
// 1. キャラクター・マップ・ゲームバランスの設定
//    数値を調整したい場合は、まずこの付近を変更する
// =========================================================
const K = [
  [
    "chemo",
    "◉",
    "ケモタクシス型",
    "卵子の350px以内で発光。反応は全員から見える。",
  ],
  ["rheo", "≋", "レオタクシス型", "水流に逆らうと加速し、流されにくい。"],
  [
    "hyper",
    "➤",
    "ハイパーアクティブ型",
    "強力な突進で相手を大きく押し出す。",
  ],
  [
    "capac",
    "✦",
    "カパシテーション型",
    "35秒後に成熟し、速度とタックル回復が強化。",
  ],
];
const MAP_SCALE = 0.92,
  M = (n) => Math.round(n * MAP_SCALE),
  WORLD_W = M(3600),
  WORLD_H = M(2160),
  VIEW_W = 1000,
  VIEW_H = 600,
  CAPTURE_TIME = 3,
  EGG_RADIUS = 78,
  EGG_DRAW_RADIUS = 52,
  EGG_KNOCKBACK = 1.6,
  START_SAFE_RADIUS = 300,
  TACKLE_COOLDOWN = 2,
  TACKLE_TIME = 0.22,
  TACKLE_SPEED = 500,
  MISS_STUN = 0.65,
  MATURITY_TIME = 35,
  CHEMO_RANGE = 350;
const scaleRect = (r) => ({
  x: M(r.x), y: M(r.y), w: M(r.w), h: M(r.h),
  dx: r.dx || 0, dy: r.dy || 0, strength: r.strength || 0,
});
const scalePoint = (p) => [M(p[0]), M(p[1])];
const scaleEllipse = (e) => ({ x:M(e.x), y:M(e.y), rx:M(e.rx), ry:M(e.ry) });
const scalePath = (p) => ({ width:M(p.width), points:p.points.map((v) => ({x:M(v[0]),y:M(v[1])})) });
// 膣口（下）から子宮・卵管口（上）へ進む3種類のマップ。
const MAPS = [
  {
    name: "標準子宮",
    subtitle: "膣・頸部・子宮腔が素直につながるバランス型",
    start: [1800, 2020],
    ellipses:[
      {x:1800,y:650,rx:1050,ry:520},{x:620,y:360,rx:430,ry:210},{x:2980,y:360,rx:430,ry:210},
    ],
    paths:[
      {width:560,points:[[1800,2100],[1800,1650],[1660,1450],[1800,1240]]},
      {width:300,points:[[1800,1320],[1800,1020],[1800,850]]},
      {width:240,points:[[1150,520],[850,400],[620,360]]},
      {width:240,points:[[2450,520],[2750,400],[2980,360]]},
    ],
    walls:[],
    water:[{x:1700,y:850,w:420,h:560,dx:0,dy:-1,strength:45}],
    slime:[{x:1420,y:1120,w:330,h:430}],
    eggs:[[1800,1740],[1580,1440],[1800,1420],[1800,1080],[1250,850],[1800,650],[2350,850],[950,560],[2650,560],[620,360],[2980,360],[1400,430],[2200,430],[1100,760],[2500,760]],
    explore:[[1800,1900],[1600,1500],[2000,1500],[1800,1050],[1200,800],[1800,650],[2400,800],[650,360],[2950,360],[1400,400],[2200,400]],
  },
  {
    name: "迷路子宮",
    subtitle: "膣壁の曲がりと子宮内膜のひだが多い探索型",
    start: [1800, 2020],
    ellipses:[
      {x:1800,y:620,rx:1120,ry:530},{x:520,y:420,rx:360,ry:220},{x:3080,y:420,rx:360,ry:220},
      {x:1050,y:900,rx:360,ry:260},{x:2550,y:900,rx:360,ry:260},
    ],
    paths:[
      {width:430,points:[[1800,2100],[1500,1880],[2050,1660],[1510,1430],[1800,1220]]},
      {width:270,points:[[1800,1300],[1660,1090],[1800,900]]},
      {width:210,points:[[1000,630],[720,500],[520,420]]},
      {width:210,points:[[2600,630],[2880,500],[3080,420]]},
      {width:190,points:[[1050,900],[1350,740],[1550,620]]},
      {width:190,points:[[2550,900],[2250,740],[2050,620]]},
    ],
    walls: [
      {x:1450,y:520,w:350,h:34},{x:1800,y:760,w:350,h:34},{x:1050,y:680,w:260,h:34},{x:2290,y:680,w:260,h:34},
    ],
    water:[{x:1550,y:1030,w:500,h:500,dx:0,dy:-1,strength:35}],
    slime:[{x:1220,y:720,w:1160,h:300}],
    eggs:[[1700,1830],[1900,1680],[1530,1460],[1800,1200],[1650,980],[1050,900],[2550,900],[1350,560],[1800,420],[2250,560],[520,420],[3080,420],[900,500],[2700,500]],
    explore:[[1800,1900],[1550,1750],[2000,1600],[1550,1400],[1800,1080],[1050,900],[2550,900],[1300,600],[1800,450],[2300,600],[520,420],[3080,420]],
  },
  {
    name: "激流子宮",
    subtitle: "太い頸管と左右の迂回路を流れが走るギミック型",
    start: [1800, 2020],
    ellipses:[
      {x:1800,y:620,rx:1080,ry:540},{x:600,y:390,rx:420,ry:230},{x:3000,y:390,rx:420,ry:230},
      {x:950,y:1180,rx:420,ry:300},{x:2650,y:1180,rx:420,ry:300},
    ],
    paths:[
      {width:650,points:[[1800,2100],[1800,1600],[1800,1180],[1800,850]]},
      {width:260,points:[[1500,1540],[1150,1380],[950,1180],[1200,930],[1450,780]]},
      {width:260,points:[[2100,1540],[2450,1380],[2650,1180],[2400,930],[2150,780]]},
      {width:240,points:[[1150,500],[850,420],[600,390]]},
      {width:240,points:[[2450,500],[2750,420],[3000,390]]},
    ],
    walls:[],
    water:[
      {x:1500,y:1350,w:600,h:700,dx:0,dy:-1,strength:55},
      {x:1450,y:720,w:700,h:650,dx:0,dy:-1,strength:70},
      {x:1200,y:180,w:1200,h:620,dx:0,dy:-1,strength:60},
    ],
    slime:[{x:600,y:900,w:700,h:520},{x:2300,y:900,w:700,h:520},{x:1450,y:500,w:700,h:300}],
    eggs:[[1800,1780],[1800,1420],[950,1180],[1800,1120],[2650,1180],[1250,820],[1800,650],[2350,820],[850,520],[2750,520],[600,390],[3000,390],[1400,350],[2200,350],[1800,280]],
    explore:[[1800,1900],[1800,1500],[950,1180],[1800,1100],[2650,1180],[1300,800],[1800,650],[2300,800],[600,390],[3000,390],[1400,350],[2200,350]],
  },
].map((map) => ({
  ...map,
  start: scalePoint(map.start),
  walls: map.walls.map(scaleRect),
  ellipses: map.ellipses.map(scaleEllipse),
  paths: map.paths.map(scalePath),
  water: map.water.map(scaleRect),
  slime: map.slime.map(scaleRect),
  eggs: map.eggs.map(scalePoint),
  explore: map.explore.map(scalePoint),
}));
let activeMapIndex = -1,
  activeMap = MAPS[0],
  WALLS = activeMap.walls,
  lastMapIndex = -1;
// =========================================================
// 2. ゲーム全体で共有する状態
// =========================================================
let kind = "chemo",
  mode = "solo",
  round = 1,
  scores = [0, 0, 0, 0, 0],
  S,
  keys = {},
  last = 0,
  elapsed = 0,
  raf,
  tackleQueued = false,
  peer = null,
  isHost = false,
  myId = 0,
  connections = [],
  remoteInputs = {},
  lobbyMembers = [],
  matchPlayers = 5,
  lastNetSend = 0,
  countdownId = 0,
  localPhase = "lobby",
  abilityTimerId = 0,
  abilityTimeoutId = 0,
  abilityDeadline = 0,
  matchKinds = [],
  guestRenderRaf = 0,
  guestInputTimer = 0,
  guestDisconnectTimer = 0,
  stateTarget = null,
  statePrevious = null,
  stateReceivedAt = 0,
  readyGuestIds = new Set(),
  roundStartTimeout = 0,
  roundCountdownScheduled = false,
  disconnectTimers = new Map();
const NETWORK_SEND_MS = 40,
  INTERPOLATION_MS = 90,
  DISCONNECT_GRACE_MS = 10000,
  READY_WAIT_MS = 5000;
// キャラクター選択ボタンをKの設定から自動生成する。
types.innerHTML = K.map(
  (k, i) =>
    `<button class="type ${i ? "" : "on"}" onclick="choose('${k[0]}',this)"><i>${k[1]}</i><b>${k[2]}</b><span>${k[3]}</span></button>`,
).join("");
// 選択したキャラクタータイプを保存し、選択中の見た目を更新。
function choose(k, e) {
  kind = k;
  document
    .querySelectorAll(".type")
    .forEach((x) => x.classList.remove("on"));
  e.classList.add("on");
}
// タイトル画面から一人用またはローカル対戦へ進む。
function beginMode(m) {
  mode = m;
  title.style.display = "none";
  if (mode === "solo") {
    openAbilitySelect("一人用の能力を選ぶ");
  } else {
    lobby.style.display = "flex";
    let q = new URLSearchParams(location.search).get("join");
    if (q) {
      setLobbyTab("join");
      joinCode.value = q;
      joinRoom();
    }
  }
}
function openAbilitySelect(titleText = "能力を選ぶ") {
  selectTitle.textContent = titleText;
  selectStatus.textContent = "";
  typeConfirm.disabled = false;
  typeConfirm.textContent = "このタイプで決定 →";
  lobby.style.display = title.style.display = result.style.display = "none";
  select.style.display = "flex";
}
// 能力選択画面に残り時間を表示する。制限時間の確定処理はホストが行う。
function startAbilityTimer(seconds = 20) {
  clearInterval(abilityTimerId);
  abilityDeadline = Date.now() + seconds * 1000;
  const update = () => {
    if (localPhase !== "ability") {
      clearInterval(abilityTimerId);
      return;
    }
    const left = Math.max(0, Math.ceil((abilityDeadline - Date.now()) / 1000));
    selectStatus.textContent = typeConfirm.disabled
      ? `選択済み　残り${left}秒（他のプレイヤーを待っています）`
      : `残り${left}秒　時間切れ時はランダムに決定します`;
    if (left <= 0) clearInterval(abilityTimerId);
  };
  update();
  abilityTimerId = setInterval(update, 200);
}
function stopAbilityTimer() {
  clearInterval(abilityTimerId);
  clearTimeout(abilityTimeoutId);
  abilityTimerId = abilityTimeoutId = 0;
}
function randomAbility() {
  return K[Math.floor(Math.random() * K.length)][0];
}
// 一人用は即開始。対戦では選択内容をホストへ提出して全員を待つ。
function afterType() {
  if (mode === "solo") {
    select.style.display = "none";
    start();
    return;
  }
  typeConfirm.disabled = true;
  typeConfirm.textContent = "選択済み";
  selectStatus.textContent = "他のプレイヤーの選択を待っています…";
  if (isHost) {
    let me = lobbyMembers.find((m) => m.id === 0);
    if (me) me.kind = kind;
    broadcastLobby();
    tryStartAfterAbilities();
  } else if (connections[0]?.open) {
    connections[0].send({ type: "ability", kind });
  }
}
// =========================================================
// 3. ローカル対戦のロビー・通信処理
//    ホストが試合を計算し、参加者へ状態を送信する方式
// =========================================================

// 招待コードを大文字英数字とハイフンだけに整える。
function cleanCode(v) {
  return v
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, "")
    .slice(0, 20);
}
function setLobbyTab(t) {
  hostPane.style.display = t === "host" ? "block" : "none";
  joinPane.style.display = t === "join" ? "block" : "none";
  hostTab.classList.toggle("on", t === "host");
  joinTab.classList.toggle("on", t === "join");
  inviteArea.style.display = "none";
  netStatus.textContent = "";
}
function roomCode() {
  return "WOT-" + Math.random().toString(36).slice(2, 8).toUpperCase();
}
function peerReady() {
  if (window.Peer) return true;
  netStatus.textContent =
    "通信機能を読み込めませんでした。インターネット接続を確認してください。";
  return false;
}
// ホストとしてPeerJSの部屋を作り、招待コードを発行する。
function createRoom() {
  if (!peerReady()) return;
  closePeer();
  isHost = true;
  let code = roomCode();
  netStatus.textContent = "部屋を作成中…";
  peer = new Peer(code.toLowerCase());
  peer.on("open", () => {
    inviteCode.value = code;
    inviteArea.style.display = "block";
    hostStart.style.display = "inline-block";
    localPhase = "lobby";
    lobbyMembers = [{ id: 0, name: "ホスト", kind: null }];
    renderLobby();
    netStatus.textContent = "友人の参加を待っています";
  });
  peer.on("connection", acceptGuest);
  peer.on("error", peerError);
}
// 新しい参加者を受け入れ、入力情報をホスト側で受信する。
function acceptGuest(c) {
  if (localPhase !== "lobby" || lobbyMembers.length >= +playerLimit.value) {
    c.on("open", () =>
      c.send({ type: "error", message: "この部屋は満員です" }),
    );
    return;
  }
  connections.push(c);
  c.on("open", () => {});
  c.on("data", (d) => {
    if (d.type === "hello") {
      let id = 1;
      while (lobbyMembers.some((m) => m.id === id)) id++;
      lobbyMembers.push({ id, name: "ゲスト " + id, kind: null });
      c.playerId = id;
      c.send({ type: "welcome", id, settings: getSettings() });
      broadcastLobby();
    } else if (d.type === "input" && localPhase === "game") {
      remoteInputs[c.playerId] = d.input;
    } else if (d.type === "ready" && localPhase === "game") {
      readyGuestIds.add(c.playerId);
      sendStateTo(c);
      tryBeginSynchronizedRound();
    } else if (d.type === "stateRequest" && localPhase === "game") {
      sendStateTo(c);
    }
    else if (d.type === "ability" && localPhase === "ability") {
      let member = lobbyMembers.find((m) => m.id === c.playerId);
      if (member && K.some((k) => k[0] === d.kind)) member.kind = d.kind;
      broadcastLobby();
      tryStartAfterAbilities();
    }
  });
  c.on("close", () => {
    connections = connections.filter((x) => x !== c);
    readyGuestIds.delete(c.playerId);
    delete remoteInputs[c.playerId];
    if (localPhase === "game") {
      beginCpuTakeover(c.playerId);
    } else {
      lobbyMembers = lobbyMembers.filter((x) => x.id !== c.playerId);
      normalizeLobbyIds();
      broadcastLobby();
      if (localPhase === "ability") tryStartAfterAbilities();
    }
  });
}
function normalizeLobbyIds() {
  lobbyMembers.sort((a, b) => a.id - b.id);
  lobbyMembers.forEach((member, index) => {
    member.id = index;
  });
  connections.forEach((connection) => {
    const member = lobbyMembers.find((m) => m.name === `ゲスト ${connection.playerId}`);
    if (!member) return;
    connection.playerId = member.id;
    if (connection.open)
      connection.send({ type: "welcome", id: member.id, settings: getSettings() });
  });
}
function beginCpuTakeover(playerId) {
  if (!Number.isInteger(playerId) || disconnectTimers.has(playerId)) return;
  toastMsg(`P${playerId + 1}が切断。10秒後にCPUが代行します`);
  const timer = setTimeout(() => {
    disconnectTimers.delete(playerId);
    const swimmer = S?.swimmers?.[playerId];
    if (!swimmer || swimmer.cpuTakeover) return;
    swimmer.human = false;
    swimmer.cpuTakeover = true;
    swimmer.path = [];
    swimmer.pathIndex = 0;
    swimmer.lockedEgg = null;
    nextRoomTarget(swimmer);
    toastMsg(`P${playerId + 1}をCPUが代行します`);
  }, DISCONNECT_GRACE_MS);
  disconnectTimers.set(playerId, timer);
}
// 招待コードを使ってホストの部屋へ接続する。
function joinRoom() {
  if (!peerReady()) return;
  let code = cleanCode(joinCode.value);
  if (!code) {
    netStatus.textContent = "招待コードを入力してください";
    return;
  }
  closePeer();
  isHost = false;
  netStatus.textContent = "ホストへ接続中…";
  peer = new Peer();
  peer.on("open", () => {
    let c = peer.connect(code.toLowerCase(), { reliable: true });
    connections = [c];
    c.on("open", () => {
      c.send({ type: "hello" });
      netStatus.textContent = "接続しました。ホストの開始を待っています";
    });
    c.on("data", guestData);
    c.on("close", handleHostDisconnect);
  });
  peer.on("error", peerError);
}
function handleHostDisconnect() {
  if (localPhase !== "game") {
    netStatus.textContent = "ホストとの接続が切れました";
    return;
  }
  toastMsg("ホストとの接続が切れました。10秒間待機します");
  clearTimeout(guestDisconnectTimer);
  guestDisconnectTimer = setTimeout(() => {
    cancelAnimationFrame(guestRenderRaf);
    clearInterval(guestInputTimer);
    localPhase = "lobby";
    game.style.display = "none";
    lobby.style.display = "flex";
    inviteArea.style.display = "block";
    hostStart.style.display = "none";
    netStatus.textContent =
      "ホストが切断したため試合を中断しました。部屋へ入り直してください。";
  }, DISCONNECT_GRACE_MS);
}
// ゲスト側がホストから受け取ったメッセージを種類別に処理する。
function guestData(d) {
  if (d.type === "welcome") {
    myId = d.id;
    inviteArea.style.display = "block";
    inviteCode.value = cleanCode(joinCode.value);
    hostStart.style.display = "none";
  }
  if (d.type === "lobby") {
    lobbyMembers = d.members;
    renderLobby();
  }
  if (d.type === "selectAbility") {
    localPhase = "ability";
    openAbilitySelect(`P${myId + 1}の能力を選ぶ`);
    startAbilityTimer(d.seconds || 20);
  }
  if (d.type === "start") {
    stopAbilityTimer();
    matchPlayers = d.count;
    setActiveMap(d.mapIndex);
    scores = Array(matchPlayers).fill(0);
    round = 1;
    stateTarget = statePrevious = null;
    enterMatchScreen(() => {
      connections[0]?.open && connections[0].send({ type: "ready" });
    });
    netStatus.textContent = "";
    startGuestControls();
  }
  if (d.type === "roundStart") {
    showMapIntro();
    scheduleCountdown(d.startAt);
  }
  if (d.type === "countdownStart") scheduleCountdown(d.startAt);
  if (d.type === "state") {
    if (Number.isInteger(d.mapIndex) && d.mapIndex !== activeMapIndex)
      setActiveMap(d.mapIndex);
    statePrevious = stateTarget || d.S;
    stateTarget = d.S;
    stateReceivedAt = performance.now();
    S = interpolateState(statePrevious, stateTarget, 0);
    elapsed = d.elapsed;
    round = d.round;
    scores = d.scores;
    document.getElementById("round").textContent = round;
    document.getElementById("time").textContent = Math.max(
      0,
      60 - Math.floor(elapsed),
    );
    renderScores();
    // 補間ループを待たず、受信した最初の状態を必ず描画する。
    draw();
    if (!guestRenderRaf)
      guestRenderRaf = requestAnimationFrame(guestRenderLoop);
  }
  if (d.type === "end") showResult(d.scores);
  if (d.type === "error") netStatus.textContent = d.message;
}
function interpolateState(from, to, alpha) {
  if (!to) return from;
  const result = cloneGameState(to);
  if (!from?.swimmers) return result;
  result.swimmers.forEach((o, i) => {
    const a = from.swimmers[i];
    if (!a || a.secured !== o.secured) return;
    // 自分は最新のホスト座標を即時表示し、相手だけを補間する。
    if (mode === "local" && !isHost && i === myId) return;
    o.x = a.x + (o.x - a.x) * alpha;
    o.y = a.y + (o.y - a.y) * alpha;
    o.facingX = a.facingX + (o.facingX - a.facingX) * alpha;
    o.facingY = a.facingY + (o.facingY - a.facingY) * alpha;
  });
  return result;
}
function cloneGameState(source) {
  if (!source) return source;
  return {
    swimmers: (source.swimmers || []).map((o) => ({
      ...o,
      path: (o.path || []).map((p) => ({ ...p })),
      roomOrder: [...(o.roomOrder || [])],
      visitedRooms:
        o.visitedRooms instanceof Set
          ? [...o.visitedRooms]
          : [...(o.visitedRooms || [])],
    })),
    eggs: (source.eggs || []).map((e) => ({ ...e })),
  };
}
function guestRenderLoop(now) {
  if (mode !== "local" || isHost || localPhase !== "game") {
    guestRenderRaf = 0;
    return;
  }
  if (stateTarget) {
    const alpha = Math.min(1, (now - stateReceivedAt) / INTERPOLATION_MS);
    S = interpolateState(statePrevious, stateTarget, alpha);
    draw();
  }
  guestRenderRaf = requestAnimationFrame(guestRenderLoop);
}
function getSettings() {
  return { limit: +playerLimit.value, fillCpu: fillCpu.checked };
}
// 現在の参加者とルール設定を全ゲストへ共有する。
function broadcastLobby() {
  if (!isHost) return;
  let d = {
    type: "lobby",
    members: lobbyMembers,
    settings: getSettings(),
  };
  connections.forEach((c) => c.open && c.send(d));
  renderLobby();
}
function renderLobby() {
  const faces = ["普通顔", "怒り顔", "眠そう", "泣き顔", "キラキラ", "ジト目"];
  players.innerHTML = lobbyMembers
    .map(
      (m, i) =>
        `<div class="playerrow"><span>${i ? "●" : "★"} P${m.id + 1} ${m.name}</span><b>${faces[m.id] || ""}${localPhase === "ability" ? " / " + (K.find((k) => k[0] === m.kind)?.[2] || "選択中") : ""}</b></div>`,
    )
    .join("");
  if (isHost) {
    let n = +playerLimit.value - lobbyMembers.length;
    if (fillCpu.checked && n > 0)
      players.innerHTML += `<div class="playerrow"><span>CPU補充</span><b>${n}体</b></div>`;
  }
}
async function copyInvite() {
  let url = location.href.split("?")[0] + "?join=" + inviteCode.value;
  try {
    await navigator.clipboard.writeText(url);
    netStatus.textContent = "招待URLをコピーしました";
  } catch {
    inviteCode.select();
    document.execCommand("copy");
    netStatus.textContent = "招待コードをコピーしました";
  }
}
function peerError(e) {
  netStatus.textContent =
    e.type === "peer-unavailable"
      ? "部屋が見つかりません。コードを確認してください。"
      : "接続に失敗しました。もう一度お試しください。";
}
function closePeer() {
  stopAbilityTimer();
  connections.forEach((c) => c.close());
  connections = [];
  clearInterval(guestInputTimer);
  clearTimeout(guestDisconnectTimer);
  clearTimeout(roundStartTimeout);
  cancelAnimationFrame(guestRenderRaf);
  guestRenderRaf = guestInputTimer = guestDisconnectTimer = 0;
  disconnectTimers.forEach((timer) => clearTimeout(timer));
  disconnectTimers.clear();
  readyGuestIds.clear();
  if (peer) peer.destroy();
  peer = null;
  lobbyMembers = [];
  localPhase = "lobby";
}
function startLocalMatch() {
  let settings = getSettings();
  if (lobbyMembers.length < settings.limit && !settings.fillCpu) {
    netStatus.textContent = `あと${settings.limit - lobbyMembers.length}人の参加が必要です`;
    return;
  }
  matchPlayers = settings.limit;
  localPhase = "ability";
  lobbyMembers.forEach((m) => (m.kind = null));
  // 補充CPUの能力はここでランダム決定し、人間の選択待ちには含めない。
  matchKinds = Array(matchPlayers).fill(null);
  for (let i = lobbyMembers.length; i < matchPlayers; i++)
    matchKinds[i] = randomAbility();
  connections.forEach(
    (c) => c.open && c.send({ type: "selectAbility", seconds: 20 }),
  );
  broadcastLobby();
  openAbilitySelect("P1の能力を選ぶ");
  startAbilityTimer(20);
  clearTimeout(abilityTimeoutId);
  abilityTimeoutId = setTimeout(finishAbilitySelection, 20000);
}
// 20秒経過時、未選択の人間だけをランダム能力で確定する。
function finishAbilitySelection() {
  if (!isHost || localPhase !== "ability") return;
  lobbyMembers.forEach((m) => {
    if (!m.kind) m.kind = randomAbility();
  });
  broadcastLobby();
  tryStartAfterAbilities();
}
// 人間プレイヤー全員の能力が決まった時だけ、ホストが試合を開始する。
function tryStartAfterAbilities() {
  if (!isHost || localPhase !== "ability") return;
  if (!lobbyMembers.length || lobbyMembers.some((m) => !m.kind)) return;
  stopAbilityTimer();
  lobbyMembers.forEach((m) => (matchKinds[m.id] = m.kind));
  selectRandomMap();
  localPhase = "game";
  readyGuestIds.clear();
  connections.forEach(
    (c) => c.open && c.send({ type: "start", count: matchPlayers, mapIndex: activeMapIndex }),
  );
  start();
}
// ゲスト端末のキー入力を50msごとにホストへ送信する。
function startGuestControls() {
  cancelAnimationFrame(raf);
  clearInterval(guestInputTimer);
  const send = () => {
    if (!connections[0]?.open) return;
    connections[0].send({
      type: "input",
      input: { keys: { ...keys }, tackle: tackleQueued, use: false },
    });
    tackleQueued = false;
  };
  guestInputTimer = setInterval(send, NETWORK_SEND_MS);
}
// =========================================================
// 4. マップ判定・CPUの経路探索
// =========================================================
const rnd = (a, b) => a + Math.random() * (b - a),
  D = (a, b) => Math.hypot(a.x - b.x, a.y - b.y),
  C = (n, a, b) => Math.max(a, Math.min(b, n));
function segmentDistance(px, py, a, b) {
  let vx = b.x - a.x, vy = b.y - a.y,
    t = C(((px - a.x) * vx + (py - a.y) * vy) / (vx * vx + vy * vy || 1), 0, 1),
    x = a.x + vx * t, y = a.y + vy * t;
  return Math.hypot(px - x, py - y);
}
function insideWalkable(x, y, r = 0) {
  let ellipse = activeMap.ellipses.some((e) => {
    let rx = Math.max(1, e.rx - r), ry = Math.max(1, e.ry - r);
    return ((x - e.x) ** 2) / (rx ** 2) + ((y - e.y) ** 2) / (ry ** 2) <= 1;
  });
  if (ellipse) return true;
  return activeMap.paths.some((p) => {
    let limit = Math.max(1, p.width / 2 - r);
    return p.points.some((a, i) => i && segmentDistance(x, y, p.points[i - 1], a) <= limit);
  });
}
function blocked(x, y, r = 25) {
  if (!insideWalkable(x, y, r)) return true;
  return WALLS.some(
    (w) =>
      x + r > w.x &&
      x - r < w.x + w.w &&
      y + r > w.y &&
      y - r < w.y + w.h,
  );
}
function randomOpen(m = 90) {
  for (let i = 0; i < 100; i++) {
    let p = { x: rnd(m, WORLD_W - m), y: rnd(m, WORLD_H - m) };
    if (!blocked(p.x, p.y, 35)) return p;
  }
  return { x: WORLD_W / 2, y: WORLD_H / 2 };
}
function eggCountForPlayers(count) {
  return ({ 2: 1, 3: 2, 4: 2, 5: 3, 6: 4 })[count] || 3;
}
function cpuCanSeeEgg(o, e) {
  return (
    Math.abs(e.x - o.x) <= VIEW_W / 2 && Math.abs(e.y - o.y) <= VIEW_H / 2
  );
}
// 壁を避けて目的地へ進むため、幅優先探索で経路を作る。
function findPath(a, b) {
  const step = 70,
    cols = Math.ceil(WORLD_W / step),
    rows = Math.ceil(WORLD_H / step),
    key = (x, y) => y * cols + x,
    s = {
      x: C(Math.floor(a.x / step), 0, cols - 1),
      y: C(Math.floor(a.y / step), 0, rows - 1),
    },
    g = {
      x: C(Math.floor(b.x / step), 0, cols - 1),
      y: C(Math.floor(b.y / step), 0, rows - 1),
    },
    q = [s],
    seen = new Set([key(s.x, s.y)]),
    prev = new Map();
  while (q.length) {
    let n = q.shift();
    if (n.x === g.x && n.y === g.y) {
      let path = [],
        k = key(n.x, n.y);
      while (prev.has(k)) {
        path.push({ x: n.x * step + step / 2, y: n.y * step + step / 2 });
        n = prev.get(k);
        k = key(n.x, n.y);
      }
      return path.reverse().concat([{ x: b.x, y: b.y }]);
    }
    for (let [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      let x = n.x + dx,
        y = n.y + dy,
        k = key(x, y),
        px = x * step + step / 2,
        py = y * step + step / 2;
      if (
        x < 0 ||
        y < 0 ||
        x >= cols ||
        y >= rows ||
        seen.has(k) ||
        blocked(px, py, 30)
      )
        continue;
      seen.add(k);
      prev.set(k, n);
      q.push({ x, y });
    }
  }
  return [{ x: b.x, y: b.y }];
}
function setCpuTarget(o, target) {
  o.exploreX = target.x;
  o.exploreY = target.y;
  o.path = findPath(o, target);
  o.pathIndex = 0;
  o.exploreTime = 12;
}
function nextRoomTarget(o) {
  let point = activeMap.explore[o.sweepIndex++ % activeMap.explore.length],
    target = { x: point[0], y: point[1] };
  setCpuTarget(o, target);
}
function moveInWorld(o, dt) {
  let ox = o.x,
    oy = o.y,
    nx = C(ox + o.vx * dt, 25, WORLD_W - 25),
    ny = C(oy + o.vy * dt, 25, WORLD_H - 25);
  if (!blocked(nx, oy)) {
    o.x = nx;
  } else {
    o.vx *= -0.25;
  }
  if (!blocked(o.x, ny)) {
    o.y = ny;
  } else {
    o.vy *= -0.25;
  }
}
// =========================================================
// 5. 1ラウンド分のキャラと卵子を生成
// =========================================================
function make() {
  // 全員を白色に統一し、入室順の顔パーツで見分ける。
  let colors = Array(6).fill("#fff"),
    humanCount = mode === "local" ? lobbyMembers.length : 1,
    ks = Array.from(
      { length: matchPlayers },
      (_, i) =>
        matchKinds[i] ||
        lobbyMembers[i]?.kind ||
        [kind, "chemo", "rheo", "hyper", "capac"][i] ||
        K[i % K.length][0],
    ),
    cx = activeMap.start[0],
    cy = activeMap.start[1];
  let swimmers = colors.slice(0, matchPlayers).map((c, i) => {
    let a = -Math.PI / 2 + (i * Math.PI * 2) / matchPlayers,
      r = i ? 72 : 0,
      order = Array.from(
        { length: 9 },
        (_, j) => (j + (i - 1) * 3 + 9) % 9,
      );
    return {
      id: i,
      human: i < humanCount,
      x: cx + Math.cos(a) * r,
      y: cy + Math.sin(a) * r,
      vx: 0,
      vy: 0,
      color: c,
      kind: ks[i],
      dash: 0,
      mature: 0,
      secured: false,
      exploreX: cx,
      exploreY: cy,
      exploreTime: 0,
      lockedEgg: null,
      roomOrder: order,
      roomIndex: 0,
      sweepIndex: 0,
      visitedRooms: new Set(),
      path: [],
      pathIndex: 0,
      facingX: Math.cos(a),
      facingY: Math.sin(a),
      tackleTime: 0,
      tackleHit: false,
      stun: 0,
      exposed: 0,
      stagger: 0,
      staggerHold: 0,
    };
  });
  swimmers.filter((o) => !o.human).forEach(nextRoomTarget);
  let spots = activeMap.eggs
    .filter(
      (v) =>
        Math.hypot(v[0] - cx, v[1] - cy) >= START_SAFE_RADIUS &&
        !blocked(v[0], v[1], EGG_DRAW_RADIUS + 8),
    )
    .sort(() => Math.random() - 0.5);
  let eggs = spots
    .slice(0, eggCountForPlayers(matchPlayers))
    .map((v) => ({
      x: v[0],
      y: v[1],
      active: true,
      revealed: true,
      claimed: false,
      owner: null,
      progress: 0,
      contested: false,
      contestTime: 0,
      burst: 0,
    }));
  return { swimmers, eggs };
}
// =========================================================
// 6. 試合開始・カウントダウン・スコア表示
// =========================================================

// マップを先に表示し、描画完了後にカウントダウンを開始する。
function enterMatchScreen(onReady) {
  select.style.display =
    result.style.display =
    title.style.display =
    lobby.style.display =
      "none";
  game.style.display = "flex";
  toast.style.display = "none";
  cancelAnimationFrame(raf);
  requestAnimationFrame(() =>
    requestAnimationFrame(() => onReady && onReady()),
  );
}
function setActiveMap(index) {
  activeMapIndex = Number.isInteger(index) ? index : 0;
  activeMap = MAPS[activeMapIndex] || MAPS[0];
  WALLS = activeMap.walls;
}
function selectRandomMap() {
  let choices = MAPS.map((_, i) => i).filter((i) => i !== lastMapIndex);
  let index = choices[Math.floor(Math.random() * choices.length)];
  setActiveMap(index);
  lastMapIndex = index;
}
function showMapIntro(onDone) {
  mapIntroName.textContent = activeMap.name;
  mapIntroSub.textContent = activeMap.subtitle;
  mapIntro.classList.add("show");
  setTimeout(() => {
    mapIntro.classList.remove("show");
    if (onDone) onDone();
  }, 2000);
}
function start() {
  if (mode === "solo") matchPlayers = 5;
  if (activeMapIndex < 0 || mode === "solo") selectRandomMap();
  scores = Array(matchPlayers).fill(0);
  round = 1;
  enterMatchScreen(() => newRound(true));
}
function showCountdown(value) {
  toast.textContent = value === "START" ? "START!" : value;
  toast.style.display = "block";
  toast.style.fontSize = value === "START" ? "32px" : "56px";
  if (value === "START")
    setTimeout(() => {
      toast.style.display = "none";
      toast.style.fontSize = "";
    }, 650);
}
function sendCountdown(value) {
  showCountdown(value);
  if (mode === "local" && isHost)
    connections.forEach(
      (c) => c.open && c.send({ type: "countdown", value }),
    );
}
function scheduleCountdown(startAt) {
  const id = ++countdownId;
  [
    { at: startAt - 3000, value: "3" },
    { at: startAt - 2000, value: "2" },
    { at: startAt - 1000, value: "1" },
    { at: startAt, value: "START" },
  ].forEach(({ at, value }) => {
    setTimeout(() => {
      if (id !== countdownId) return;
      showCountdown(value);
      if (value === "START" && isHost) {
        last = performance.now();
        raf = requestAnimationFrame(loop);
      }
    }, Math.max(0, at - Date.now()));
  });
}
function networkState() {
  if (!S) return null;
  const safe = cloneGameState(S);
  return {
    type: "state",
    S: safe,
    elapsed,
    round,
    scores,
    mapIndex: activeMapIndex,
  };
}
function sendStateTo(connection) {
  const state = networkState();
  if (state && connection?.open) connection.send(state);
}
function tryBeginSynchronizedRound() {
  if (
    !isHost ||
    localPhase !== "game" ||
    !S ||
    roundCountdownScheduled
  )
    return;
  const expected = connections.filter((c) => c.open).map((c) => c.playerId);
  if (expected.some((id) => !readyGuestIds.has(id))) return;
  clearTimeout(roundStartTimeout);
  roundCountdownScheduled = true;
  const startAt = Date.now() + 5200;
  connections.forEach(
    (c) => c.open && c.send({ type: "roundStart", startAt }),
  );
  showMapIntro();
  scheduleCountdown(startAt);
}
// ラウンドを初期化し「3→2→1→START」後にゲームループを開始。
function newRound(showIntroFirst = false) {
  let id = ++countdownId;
  roundCountdownScheduled = false;
  S = make();
  elapsed = 0;
  last = 0;
  document.getElementById("round").textContent = round;
  document.getElementById("time").textContent = "60";
  renderScores();
  cancelAnimationFrame(raf);
  draw();
  if (mode === "local" && isHost)
    connections.forEach((c) => sendStateTo(c));
  const beginCountdown = () => {
    if (id !== countdownId) return;
    sendCountdown("3");
    setTimeout(() => id === countdownId && sendCountdown("2"), 1000);
    setTimeout(() => id === countdownId && sendCountdown("1"), 2000);
    setTimeout(() => {
      if (id !== countdownId) return;
      sendCountdown("START");
      last = performance.now();
      raf = requestAnimationFrame(loop);
    }, 3000);
  };
  if (mode === "local" && isHost && showIntroFirst) {
    roundStartTimeout = setTimeout(() => {
      connections
        .filter((c) => c.open && !readyGuestIds.has(c.playerId))
        .forEach((c) => {
          beginCpuTakeover(c.playerId);
          c.close();
        });
      tryBeginSynchronizedRound();
    }, READY_WAIT_MS);
    tryBeginSynchronizedRound();
  } else if (mode === "local" && isHost) {
    const startAt = Date.now() + 3200;
    connections.forEach(
      (c) => c.open && c.send({ type: "countdownStart", startAt }),
    );
    scheduleCountdown(startAt);
  } else if (showIntroFirst) showMapIntro(beginCountdown);
  else beginCountdown();
}
function playerLabel(i) {
  if (i === myId) return "YOU";
  if (S?.swimmers[i]?.cpuTakeover) return `P${i + 1}（CPU代行）`;
  if (S?.swimmers[i]?.human) return "P" + (i + 1);
  return "CPU " + (i + 1);
}
function renderScores() {
  document.getElementById("scores").innerHTML = scores
    .map(
      (s, i) =>
        `<span class="${i === myId ? "you" : ""}">${playerLabel(i)} <b>${s}</b></span>`,
    )
    .join("");
}
function toastMsg(s) {
  toast.textContent = s;
  toast.style.fontSize = "";
  toast.style.display = "block";
  setTimeout(() => (toast.style.display = "none"), 800);
}
// =========================================================
// 7. プレイヤー入力・タックル
// =========================================================
function queueTackle() {
  tackleQueued = true;
}
onkeydown = (e) => {
  keys[e.key.toLowerCase()] = 1;
  if (e.key === " " && !e.repeat) {
    e.preventDefault();
    queueTackle();
  }
};
onkeyup = (e) => {
  keys[e.key.toLowerCase()] = 0;
};
dash.onpointerdown = (e) => {
  e.preventDefault();
  queueTackle();
};
// 向いている方向へタックルを開始する。再使用待ち・硬直中は不可。
function isMature(o) {
  return o.kind === "capac" && o.mature >= MATURITY_TIME;
}
function tackleCooldown(o) {
  if (o.kind === "hyper") return 2.4;
  if (o.kind === "capac") return isMature(o) ? 1.65 : 2.2;
  return TACKLE_COOLDOWN;
}
function moveSpeed(o) {
  if (o.human) {
    if (o.kind === "hyper") return 155;
    if (o.kind === "capac") return isMature(o) ? 176 : 150;
    return 160;
  }
  if (o.kind === "hyper") return 145;
  if (o.kind === "capac") return isMature(o) ? 165 : 140;
  return 150;
}
function zoneAt(zones, o) {
  return zones.find((z) => o.x >= z.x && o.x <= z.x + z.w && o.y >= z.y && o.y <= z.y + z.h);
}
function startTackle(o) {
  if (o.dash > 0 || o.stun > 0 || o.tackleTime > 0) return;
  let l = Math.hypot(o.facingX, o.facingY) || 1;
  o.facingX /= l;
  o.facingY /= l;
  let speed = o.kind === "hyper" ? 540 : TACKLE_SPEED;
  o.vx = o.facingX * speed;
  o.vy = o.facingY * speed;
  o.tackleTime = TACKLE_TIME;
  o.tackleHit = false;
  o.dash = tackleCooldown(o);
}
function tickFighter(o, dt) {
  o.dash = Math.max(0, o.dash - dt);
  o.stun = Math.max(0, o.stun - dt);
  o.exposed = Math.max(0, o.exposed - dt);
  o.staggerHold = Math.max(0, o.staggerHold - dt);
  if (!o.staggerHold) o.stagger = Math.max(0, o.stagger - dt * 20);
  if (o.tackleTime > 0) {
    o.tackleTime -= dt;
    if (o.tackleTime <= 0 && !o.tackleHit) {
      let miss = o.kind === "hyper" ? 0.75 : MISS_STUN;
      o.stun = miss;
      o.exposed = miss;
    }
  }
}
// 人間プレイヤー1体分の移動・向き・速度を更新する。
function updateHuman(o, input, dt) {
  if (!o || o.secured) return;
  let k = input.keys || {},
    ix = (k.d || k.arrowright ? 1 : 0) - (k.a || k.arrowleft ? 1 : 0),
    iy = (k.s || k.arrowdown ? 1 : 0) - (k.w || k.arrowup ? 1 : 0),
    moving = !!(ix || iy),
    l = Math.hypot(ix, iy) || 1;
  ix /= l;
  iy /= l;
  o.mature += dt;
  tickFighter(o, dt);
  if (moving && o.tackleTime <= 0 && o.stun <= 0) {
    o.facingX = ix;
    o.facingY = iy;
  }
  if (input.tackle) startTackle(o);
  if (o.tackleTime > 0) return;
  let sp = moveSpeed(o),
    water = zoneAt(activeMap.water, o);
  if (o.kind === "rheo" && water) {
    let along = ix * water.dx + iy * water.dy;
    if (along < -0.15) sp *= 1.25;
    else if (along > 0.15) sp *= 1.1;
  }
  if (o.stun > 0) {
    o.vx *= Math.max(0, 1 - dt * 7);
    o.vy *= Math.max(0, 1 - dt * 7);
    return;
  }
  o.vx += (ix * sp - o.vx) * Math.min(1, dt * 8);
  o.vy += (iy * sp - o.vy) * Math.min(1, dt * 8);
}
// =========================================================
// 8. メインゲームループ
//    入力、CPU、衝突、卵子取得、通信、描画を毎フレーム更新
// =========================================================
function loop(t) {
  let dt = Math.min(0.033, (t - last) / 1000 || 0.016);
  last = t;
  elapsed += dt;
  document.getElementById("time").textContent = Math.max(
    0,
    60 - Math.floor(elapsed),
  );
  let p = S.swimmers[0],
    localTackle = tackleQueued;
  tackleQueued = false;
  updateHuman(p, { keys, tackle: localTackle }, dt);
  S.swimmers
    .filter((o) => o.human && o.id > 0)
    .forEach((o) => {
      let input = remoteInputs[o.id] || { keys: {}, tackle: false };
      updateHuman(o, input, dt);
      input.tackle = false;
    });
  let shown = S.swimmers[myId] || p;
  if (shown) {
    dash.classList.toggle("cooling", shown.dash > 0 || shown.stun > 0);
    tackleStatus.textContent =
      shown.stun > 0
        ? "硬直 " + shown.stun.toFixed(1)
        : shown.dash > 0
          ? "再使用 " + shown.dash.toFixed(1)
          : "SPACE";
  }
  S.swimmers
    .filter((o) => !o.human)
    .forEach((o) => {
      if (o.secured) return;
      o.mature += dt;
      tickFighter(o, dt);
      o.exploreTime -= dt;
      let available = S.eggs
        .map((e, i) => (!e.claimed ? i : -1))
        .filter((i) => i >= 0);
      if (!available.length) return;
      if (o.lockedEgg !== null && !available.includes(o.lockedEgg)) {
        o.lockedEgg = null;
        nextRoomTarget(o);
      }
      if (o.lockedEgg === null) {
        let visible = available.filter((i) => cpuCanSeeEgg(o, S.eggs[i]));
        if (visible.length) {
          o.lockedEgg = visible.sort(
            (a, b) => D(o, S.eggs[a]) - D(o, S.eggs[b]),
          )[0];
          o.path = findPath(o, S.eggs[o.lockedEgg]);
          o.pathIndex = 0;
        }
      }
      if (
        o.lockedEgg !== null &&
        S.eggs[o.lockedEgg].contestTime > 3.5 &&
        Math.random() < dt * 0.65
      ) {
        o.lockedEgg = null;
        nextRoomTarget(o);
      }
      let target;
      if (o.lockedEgg !== null) {
        target = S.eggs[o.lockedEgg];
      } else {
        if (
          !o.path.length ||
          o.pathIndex >= o.path.length ||
          o.exploreTime <= 0
        )
          nextRoomTarget(o);
        target = o.path[o.pathIndex] || { x: o.exploreX, y: o.exploreY };
        if (D(o, target) < 48) {
          o.pathIndex++;
          if (o.pathIndex >= o.path.length) {
            nextRoomTarget(o);
            target = o.path[o.pathIndex] || {
              x: o.exploreX,
              y: o.exploreY,
            };
          }
        }
      }
      let dx = target.x - o.x,
        dy = target.y - o.y,
        d = Math.hypot(dx, dy) || 1,
        os = moveSpeed(o);
      if (o.tackleTime <= 0 && o.stun <= 0) {
        o.facingX = dx / d;
        o.facingY = dy / d;
      }
      let rival = S.swimmers
        .filter((p) => p.id !== o.id && !p.secured && D(o, p) < 105)
        .sort((a, b) => D(o, a) - D(o, b))[0];
      if (rival && o.dash <= 0 && Math.random() < dt * 4) startTackle(o);
      if (o.tackleTime > 0 || o.stun > 0) return;
      o.vx += ((dx / d) * os - o.vx) * dt * 3;
      o.vy += ((dy / d) * os - o.vy) * dt * 3;
    });
  S.swimmers.forEach((o) => {
    if (o.secured) return;
    moveInWorld(o, dt);
    let water = zoneAt(activeMap.water, o);
    if (water) {
      let reduction = o.kind === "rheo" ? 0.3 : 1;
      o.x += water.dx * water.strength * reduction * dt;
      o.y += water.dy * water.strength * reduction * dt;
    }
    if (zoneAt(activeMap.slime, o)) {
      o.vx *= 0.94;
      o.vy *= 0.94;
    }
  });
  for (let i = 0; i < S.swimmers.length; i++)
    for (let j = i + 1; j < S.swimmers.length; j++) {
      let a = S.swimmers[i],
        b = S.swimmers[j],
        d = D(a, b);
      if (d < 38 && !a.secured && !b.secured) {
        let activeA = a.tackleTime > 0,
          activeB = b.tackleTime > 0,
          nabx = (b.x - a.x) / (d || 1),
          naby = (b.y - a.y) / (d || 1);
        if (activeA && activeB) {
          let opposing =
            a.facingX * b.facingX + a.facingY * b.facingY < -0.35;
          if (opposing) {
            a.tackleHit = b.tackleHit = true;
            a.vx = -a.facingX * 190;
            a.vy = -a.facingY * 190;
            b.vx = -b.facingX * 190;
            b.vy = -b.facingY * 190;
            a.stun = b.stun = 0.25;
            continue;
          }
        }
        let attacker =
          activeA && !activeB ? a : activeB && !activeA ? b : null;
        if (!attacker) {
          a.vx -= nabx * 30;
          a.vy -= naby * 30;
          b.vx += nabx * 30;
          b.vy += naby * 30;
          continue;
        }
        let victim = attacker === a ? b : a,
          nx = (victim.x - attacker.x) / (d || 1),
          ny = (victim.y - attacker.y) / (d || 1);
        attacker.tackleHit = true;
        let towardAttacker = -nx * victim.facingX + -ny * victim.facingY;
        if (
          towardAttacker > 0.57 &&
          victim.stun <= 0 &&
          victim.exposed <= 0
        ) {
          attacker.vx -= nx * 360;
          attacker.vy -= ny * 360;
          attacker.stun = Math.max(attacker.stun, 0.35);
          attacker.exposed = Math.max(attacker.exposed, 0.35);
          continue;
        }
        let angleBonus = towardAttacker < -0.45 ? 1.3 : 1.15,
          staggerMult = 1 + (victim.stagger / 100) * 0.75,
          exposedMult = victim.exposed > 0 ? 1.3 : 1,
          hyperMult = attacker.kind === "hyper" ? 1.25 : 1,
          eggIndex = S.eggs.findIndex(
            (e) =>
              !e.claimed &&
              (D(attacker, e) < EGG_RADIUS + 25 ||
                D(victim, e) < EGG_RADIUS + 25),
          ),
          q =
            270 *
            angleBonus *
            staggerMult *
            exposedMult *
            hyperMult *
            (eggIndex >= 0 ? EGG_KNOCKBACK : 1);
        victim.vx += nx * q;
        victim.vy += ny * q;
        victim.stagger = Math.min(100, victim.stagger + 30);
        victim.staggerHold = 2;
        victim.stun = Math.max(victim.stun, 0.16);
      }
    }
  S.eggs.forEach((e) => {
    if (!e.active || e.claimed) return;
    let inside = S.swimmers.filter(
      (o) => !o.secured && D(o, e) < EGG_RADIUS,
    );
    e.contested = inside.length > 1;
    e.contestTime = e.contested ? e.contestTime + dt : 0;
    if (inside.length === 1) {
      let o = inside[0];
      if (e.owner !== o.id) {
        e.owner = o.id;
        e.progress = 0;
      }
      e.progress += dt;
    } else if (inside.length > 1) {
      let leader = inside.slice().sort((a, b) => D(a, e) - D(b, e))[0];
      if (e.owner !== leader.id) {
        e.owner = leader.id;
        e.progress = Math.max(0, e.progress - 0.3);
      }
      e.progress += dt * 0.25;
    } else {
      e.progress = Math.max(0, e.progress - dt * 0.5);
      e.owner = null;
    }
    if (e.progress >= CAPTURE_TIME && e.owner !== null) {
      let o = S.swimmers[e.owner];
      e.claimed = 1;
      o.secured = 1;
      let n = S.eggs.filter((x) => x.claimed).length;
      scores[o.id] += n === 1 ? 3 : n === 2 ? 2 : 1;
      renderScores();
      toastMsg(o.human ? "プレイヤーが獲得" : "CPUが獲得");
    }
  });
  draw();
  if (mode === "local" && isHost && t - lastNetSend > NETWORK_SEND_MS) {
    lastNetSend = t;
    connections.forEach((c) => sendStateTo(c));
  }
  if (S.eggs.every((e) => e.claimed) || elapsed > 60) {
    if (round < 3) {
      round++;
      setTimeout(newRound, 600);
    } else setTimeout(end, 600);
    return;
  }
  raf = requestAnimationFrame(loop);
}
// =========================================================
// 9. Canvas描画
// =========================================================

// 入室順（P1～P6）に対応した顔を、進行方向を向いた頭へ描く。
function drawFace(ctx, id) {
  ctx.save();
  ctx.strokeStyle = ctx.fillStyle = "#173040";
  ctx.lineWidth = 1.8;
  ctx.lineCap = "round";
  const eye = (x, y, rx = 2.1, ry = 2.8) => {
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
  };
  if (id === 0) {
    eye(7, -5); eye(7, 5);
  } else if (id === 1) {
    eye(7, -5, 1.8, 2.4); eye(7, 5, 1.8, 2.4);
    ctx.beginPath();
    ctx.moveTo(3, -8); ctx.lineTo(9, -6);
    ctx.moveTo(3, 8); ctx.lineTo(9, 6); ctx.stroke();
  } else if (id === 2) {
    ctx.beginPath();
    ctx.moveTo(4, -5); ctx.lineTo(10, -5);
    ctx.moveTo(4, 5); ctx.lineTo(10, 5); ctx.stroke();
  } else if (id === 3) {
    eye(7, -5); eye(7, 5);
    ctx.fillStyle = "#69cbe5";
    ctx.beginPath(); ctx.ellipse(4, 9, 1.8, 3.2, 0, 0, 7); ctx.fill();
  } else if (id === 4) {
    eye(7, -5, 3.2, 3.8); eye(7, 5, 3.2, 3.8);
    ctx.fillStyle = "white";
    ctx.fillRect(6, -7, 1.5, 1.5); ctx.fillRect(6, 3, 1.5, 1.5);
  } else {
    ctx.beginPath();
    ctx.moveTo(3, -5); ctx.lineTo(11, -5);
    ctx.moveTo(3, 5); ctx.lineTo(11, 5); ctx.stroke();
    eye(8, -5, 1.4, 1.4); eye(8, 5, 1.4, 1.4);
  }
  ctx.restore();
}

// プレイヤーを中心にカメラを動かし、マップ全体を描画する。
function capsulePath(ctx, a, b, radius) {
  let angle = Math.atan2(b.y - a.y, b.x - a.x), nx = Math.cos(angle + Math.PI / 2) * radius, ny = Math.sin(angle + Math.PI / 2) * radius;
  ctx.moveTo(a.x + nx, a.y + ny);
  ctx.lineTo(b.x + nx, b.y + ny);
  ctx.arc(b.x, b.y, radius, angle + Math.PI / 2, angle - Math.PI / 2);
  ctx.lineTo(a.x - nx, a.y - ny);
  ctx.arc(a.x, a.y, radius, angle - Math.PI / 2, angle + Math.PI / 2);
  ctx.closePath();
}
function buildWalkablePath(ctx) {
  ctx.beginPath();
  activeMap.ellipses.forEach((e) => {
    ctx.moveTo(e.x + e.rx, e.y);
    ctx.ellipse(e.x, e.y, e.rx, e.ry, 0, 0, Math.PI * 2);
  });
  activeMap.paths.forEach((p) =>
    p.points.forEach((point, i) => {
      if (i) capsulePath(ctx, p.points[i - 1], point, p.width / 2);
    }),
  );
}
function draw() {
  let x = cv.getContext("2d"),
    p = S.swimmers[myId] || S.swimmers[0],
    camX = C(p.x - VIEW_W / 2, 0, WORLD_W - VIEW_W),
    camY = C(p.y - VIEW_H / 2, 0, WORLD_H - VIEW_H),
    g = x.createLinearGradient(0, 0, VIEW_W, VIEW_H);
  g.addColorStop(0, "#183e54");
  g.addColorStop(1, "#082131");
  x.fillStyle = g;
  x.fillRect(0, 0, VIEW_W, VIEW_H);
  x.save();
  x.translate(-camX, -camY);
  buildWalkablePath(x);
  x.fillStyle = "#7d334a";
  x.shadowColor = "#ff8cab66";
  x.shadowBlur = 24;
  x.fill();
  x.shadowBlur = 0;
  x.save();
  buildWalkablePath(x);
  x.clip();
  activeMap.water.forEach((z) => {
    x.fillStyle = "#50c7dd20";
    x.fillRect(z.x, z.y, z.w, z.h);
    x.fillStyle = "#d9f8ff99";
    x.font = "14px sans-serif";
    x.textAlign = "center";
    x.fillText("水流", z.x + z.w / 2, z.y + z.h / 2);
  });
  activeMap.slime.forEach((z) => {
    x.fillStyle = "#9ae8c020";
    x.fillRect(z.x, z.y, z.w, z.h);
    x.fillStyle = "#c8ffe5aa";
    x.font = "14px sans-serif";
    x.textAlign = "center";
    x.fillText("頸管粘液", z.x + z.w / 2, z.y + z.h / 2);
  });
  x.restore();
  x.fillStyle = "#f9c4d255";
  x.font = "bold 17px sans-serif";
  x.textAlign = "center";
  x.fillText("子宮腔", WORLD_W / 2, M(170));
  x.fillText("子宮頸部", WORLD_W / 2, M(1080));
  x.fillText("膣内", WORLD_W / 2, M(1780));
  x.strokeStyle = "#ffd16635";
  x.setLineDash([12, 12]);
  x.beginPath();
  x.arc(activeMap.start[0], activeMap.start[1], START_SAFE_RADIUS, 0, 7);
  x.stroke();
  x.setLineDash([]);
  x.fillStyle = "#ffd16655";
  x.textAlign = "center";
  x.fillText(
    "START SAFE ZONE",
    activeMap.start[0],
    activeMap.start[1] - START_SAFE_RADIUS + 24,
  );
  WALLS.forEach((w) => {
    x.fillStyle = "#4b162a";
    x.fillRect(w.x, w.y, w.w, w.h);
    x.strokeStyle = "#e888a799";
    x.lineWidth = 3;
    x.strokeRect(w.x, w.y, w.w, w.h);
  });
  S.eggs.forEach((e) => {
    if (e.claimed) return;
    x.fillStyle = "#fff3c9";
    x.beginPath();
    x.arc(e.x, e.y, EGG_DRAW_RADIUS, 0, 7);
    x.fill();
    x.strokeStyle = e.contested ? "#ff6b6b" : "#ffd166";
    x.lineWidth = 4;
    x.beginPath();
    x.arc(
      e.x,
      e.y,
      EGG_RADIUS,
      -Math.PI / 2,
      -Math.PI / 2 + (Math.PI * 2 * e.progress) / CAPTURE_TIME,
    );
    x.stroke();
    if (e.contested) {
      x.fillStyle = "#ff8f83";
      x.font = "bold 13px sans-serif";
      x.textAlign = "center";
      x.fillText("争奪中", e.x, e.y - EGG_RADIUS - 10);
    }
  });
  S.swimmers.forEach((o) => {
    if (o.secured) return;
    let remaining = S.eggs.filter((e) => !e.claimed),
      glow =
        o.kind === "chemo" &&
        remaining.length &&
        Math.min(...remaining.map((e) => D(o, e))) < CHEMO_RANGE;
    x.save();
    x.translate(o.x, o.y);
    x.rotate(Math.atan2(o.facingY, o.facingX));
    if (o.tackleTime > 0) {
      x.fillStyle = "#ff664466";
      x.beginPath();
      x.ellipse(-5, 0, 36, 24, 0, 0, 7);
      x.fill();
    }
    x.strokeStyle = o.color;
    x.lineWidth = 7;
    x.lineCap = "round";
    x.beginPath();
    x.moveTo(-12, 0);
    x.bezierCurveTo(
      -30,
      Math.sin(elapsed * 12 + o.id) * 12,
      -43,
      -10,
      -58,
      10,
    );
    x.stroke();
    x.fillStyle = o.color;
    x.shadowBlur = glow ? 25 : 0;
    x.shadowColor = "#fff36a";
    x.beginPath();
    x.ellipse(0, 0, 19, 14, 0, 0, 7);
    x.fill();
    x.shadowBlur = 0;
    drawFace(x, o.id);
    x.restore();
    x.fillStyle = "white";
    x.textAlign = "center";
    x.font = "12px sans-serif";
    x.fillText(playerLabel(o.id), o.x, o.y - 23);
    if (o.stagger > 0) {
      x.fillStyle = "#32161b";
      x.fillRect(o.x - 22, o.y + 22, 44, 4);
      x.fillStyle = o.stagger > 65 ? "#ff4d4d" : "#ffb45b";
      x.fillRect(o.x - 22, o.y + 22, (44 * o.stagger) / 100, 4);
    }
  });
  x.restore();
  drawMinimap(x, camX, camY);
}
// 右上のミニマップと、現在カメラが映している範囲を描画する。
function drawMinimap(x, camX, camY) {
  const mw = 200,
    mh = 120,
    mx = VIEW_W - mw - 16,
    my = 16,
    sx = mw / WORLD_W,
    sy = mh / WORLD_H;
  x.save();
  x.fillStyle = "#041521e8";
  x.strokeStyle = "#a8e6f2";
  x.lineWidth = 2;
  x.fillRect(mx, my, mw, mh);
  x.strokeRect(mx, my, mw, mh);
  x.fillStyle = "#7d334a";
  activeMap.paths.forEach((p) => {
    x.strokeStyle = "#7d334a";
    x.lineWidth = Math.max(2, p.width * sx);
    x.lineCap = "round";
    x.beginPath();
    p.points.forEach((v, i) => i ? x.lineTo(mx + v.x * sx, my + v.y * sy) : x.moveTo(mx + v.x * sx, my + v.y * sy));
    x.stroke();
  });
  activeMap.ellipses.forEach((e) => {
    x.beginPath();
    x.ellipse(mx + e.x * sx, my + e.y * sy, e.rx * sx, e.ry * sy, 0, 0, Math.PI * 2);
    x.fill();
  });
  x.fillStyle = "#50c7dd24";
  activeMap.water.forEach((z) => x.fillRect(mx + z.x * sx, my + z.y * sy, z.w * sx, z.h * sy));
  x.fillStyle = "#9ae8c024";
  activeMap.slime.forEach((z) => x.fillRect(mx + z.x * sx, my + z.y * sy, z.w * sx, z.h * sy));
  x.fillStyle = "#5dbace99";
  WALLS.forEach((w) =>
    x.fillRect(
      mx + w.x * sx,
      my + w.y * sy,
      Math.max(1, w.w * sx),
      Math.max(1, w.h * sy),
    ),
  );
  x.strokeStyle = "#ffffff80";
  x.lineWidth = 1;
  x.strokeRect(mx + camX * sx, my + camY * sy, VIEW_W * sx, VIEW_H * sy);
  S.swimmers.forEach((o) => {
    if (o.secured) return;
    x.fillStyle = o.color;
    x.beginPath();
    x.arc(mx + o.x * sx, my + o.y * sy, o.id ? 4 : 6, 0, Math.PI * 2);
    x.fill();
    if (!o.id) {
      x.strokeStyle = "#ffd166";
      x.lineWidth = 2;
      x.stroke();
    }
  });
  x.fillStyle = "#fff";
  x.font = "bold 11px sans-serif";
  x.textAlign = "left";
  x.fillText("MAP", mx + 7, my + 13);
  x.restore();
}
// =========================================================
// 10. 試合終了・再戦
// =========================================================
function showResult(finalScores) {
  game.style.display = "none";
  result.style.display = "flex";
  scores = finalScores;
  let rank = scores.map((s, i) => [s, i]).sort((a, b) => b[0] - a[0]);
  resultTitle.textContent =
    rank[0][1] === myId ? "あなたの勝利！" : "試合終了";
  ranking.innerHTML = rank
    .map(
      (r, i) =>
        `<div class="row"><b>${i + 1}位</b><span>${playerLabel(r[1])}</span><strong>${r[0]} pt</strong></div>`,
    )
    .join("");
}
function end() {
  if (mode === "local" && isHost)
    connections.forEach((c) => c.open && c.send({ type: "end", scores }));
  showResult(scores);
}
function replay() {
  result.style.display = "none";
  if (mode === "solo") start();
  else {
    lobby.style.display = "flex";
    inviteArea.style.display = "block";
    if (isHost) {
      hostStart.style.display = "inline-block";
      netStatus.textContent = "設定を確認して対戦を開始してください";
    } else {
      hostStart.style.display = "none";
      netStatus.textContent = "ホストの開始を待っています";
    }
  }
}
