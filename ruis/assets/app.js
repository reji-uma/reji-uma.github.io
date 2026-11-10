// 回顧ノート: どのページも同じデータ（data.js・monosashi.js）から中身を組み立てる
// <body data-page="…" data-id="…" data-root="…"> でページの種類を決める
(function(){
const B = document.body, PAGE = B.dataset.page, ID = B.dataset.id || "", R = B.dataset.root || "";
const D = window.KAIKO, M = window.MONOSASHI || {items: [], from: "1995"}, ZW = "​";
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const ph = s => esc(s).split(ZW).join("<wbr>");
const md = d => +d.slice(4,6) + "/" + +d.slice(6,8);
const paras = t => t.split("\n").map(p => `<p class="ph">${ph(p)}</p>`).join("");
const first = t => {
  const p = t.split("\n")[0], i = p.indexOf("。"), s = i >= 0 ? p.slice(0, i + 1) : p;
  if (s.split(ZW).join("").length <= 56) return s;
  let out = "";
  for (const seg of s.split(ZW)) { if ((out + seg).split(ZW).join("").length > 50) break; out += seg + ZW; }
  return out.replace(/[、​]+$/, "") + "…";
};
const cond = r => `${r.place}${r.surf}${r.dist}`;
const $ = id => document.getElementById(id);
const set = (id, html) => { const e = $(id); if (e) e.innerHTML = html; };
const HORSES = new Set(D.items.map(k => k.hid));                 // 馬のページがある馬
const horseUrl = hid => `${R}horse/${hid}.html`;
const msUrl = m => `${R}monosashi/${m.rc}.html`;
const byNew = (a, b) => b.race.date.localeCompare(a.race.date);
document.querySelectorAll(".upd").forEach(e => e.textContent = md(D.updated) + "時点");

// ---- 部品 ----
const ent = (k, race, no) => {
  const hit = (k.next || []).some(n => n.replace(/[（）()]/g, "") === race.name.replace(/[（）()]/g, ""));
  const r = k.race;
  return `<div class="ent"><div class="no d3">${no}</div><div>
      <div class="nm"><a class="d2 link-h" href="${horseUrl(k.hid)}">${esc(k.horse)}</a>${hit ? '<span class="hit d4">狙い通り</span>' : ""}</div>
      <div class="meta num">前走 ${esc(r.name)} ${r.fin}着 ${r.pop}人気</div></div>
    <details class="ex"><summary class="ph">${ph(first(k.text))}<span class="more"> 続き</span></summary>${paras(k.text)}</details></div>`;
};
const MOCK = {name: "有馬記念", grade: "GI", place: "中山", surf: "芝", dist: 2500};
function week(el){
  const running = D.items.filter(k => k.nxt);
  if (running.length) { el.innerHTML = running.map((k, i) => ent(k, k.nxt, i + 1)).join(""); return; }
  el.innerHTML = `<div class="none"><b class="d3">該当馬なし</b><button id="mb">見本</button></div><div id="mock"></div>`;
  $("mb").onclick = e => {
    const box = $("mock");
    if (box.innerHTML) { box.innerHTML = ""; e.target.textContent = "見本"; return; }
    box.innerHTML = `<div class="race-h"><span class="d2 gold">${MOCK.name}</span><span class="g d4">${MOCK.grade}</span>
        <span class="meta num">${cond(MOCK)}</span><span class="stamp d4">見本</span></div>` +
      D.items.filter(k => k.prof.age >= 3).map((k, i) => ent(k, MOCK, i + 1)).join("");
    e.target.textContent = "閉じる";
  };
}
const verdict = m => m.list.length ? `${m.base_n}頭中<b>${m.list.length}頭</b>` : `<b>該当なし</b>・${m.base_n}頭で初めて`;
const msRow = m => `<a class="row" href="${msUrl(m)}"><div>
    <div class="top"><span class="d4">${esc(m.race)} ${m.grade}</span><span class="meta num">${md(m.date)} ${m.place}${m.surf}${m.dist}</span></div>
    <div class="t d2">${esc(m.winner)}</div><div class="s num">${verdict(m)}</div></div><span class="go"></span></a>`;
const kaiRow = k => `<a class="row" href="${horseUrl(k.hid)}"><div>
    <div class="top"><span class="d4">${esc(k.label)}</span><span class="meta num">${md(k.race.date)} ${cond(k.race)} ${k.race.fin}着</span></div>
    <div class="t d2">${esc(k.horse)}</div><div class="s ph">${ph(first(k.text))}</div></div><span class="go"></span></a>`;
function msCard(m){
  const scope = `${M.from}年以降の<wbr>${m.place}${m.surf}${m.dist}・${m.going}の<wbr>${m.age2 ? "2歳戦の" : ""}勝ち馬`;
  const cnd = `【${scope}で、<wbr>走破${m.t}以内<wbr>×後半4F${m.l4.toFixed(1)}以内<wbr>×上がり${m.a3.toFixed(1)}以内】` + (m.miss_n ? `<wbr>（記録の欠けた${m.miss_n}頭を除く）` : "");
  const chip = (h, me) => `<span class="chip${me ? " me" : ""}">${esc(h.name)}<span class="y num">${me ? "今回" : h.date.slice(0,4)}</span>${h.g1 ? `<span class="g1">GI${h.g1}</span>` : ""}</span>`;
  const res = m.list.length
    ? `<div class="res"><span class="meta num">${m.base_n}頭中</span><span class="d2 num">${m.list.length}頭</span><span class="meta">本馬を入れて${m.list.length + 1}頭目</span></div>
       <div class="chips">${m.list.map(h => chip(h)).join("")}${chip({name: m.winner, g1: m.self_g1}, true)}</div>`
    : `<div class="res"><span class="zero"><span class="d3 gold">該当なし</span></span><span class="meta num">${m.base_n}頭で初めて</span></div>
       <div class="chips">${chip({name: m.winner, g1: m.self_g1}, true)}</div>`;
  const near = !m.list.length && m.near.length
    ? `<div class="sub-h">2つまで届いた馬</div><div class="chips">${m.near.map(h => `<span class="chip">${esc(h.name)}<span class="y num">${h.date.slice(0,4)}</span>${h.g1 ? `<span class="g1">GI${h.g1}</span>` : ""}<span class="ms-miss">${h.miss}が届かず</span></span>`).join("")}</div>` : "";
  const rk = m.race_rank ? `<span><span class="d4">歴代</span>${esc(m.race)}の勝ち馬${m.race_n}頭で走破タイム${m.race_rank}位</span>` : "";
  const who = HORSES.has(m.hid) ? `<a class="d1 link-h" href="${horseUrl(m.hid)}">${esc(m.winner)}</a>` : `<span class="d1">${esc(m.winner)}</span>`;
  return `<article class="ms">
    <div class="race-h"><span class="d2 gold">${esc(m.race)}</span><span class="g d4">${m.grade}</span><span class="meta num">${md(m.date)} ${m.place}${m.surf}${m.dist} ${m.going}</span></div>
    <div class="who">${who}</div>
    <div class="col num">
      <div><small>走破</small><b class="d2">${m.t}</b></div>
      <div><small>後半4F</small><b class="d2">${m.l4.toFixed(1)}</b></div>
      <div><small>上がり</small><b class="d2">${m.a3.toFixed(1)}</b></div>
    </div>
    <div class="rule"><div class="cond ph num">${cnd}</div>${res}${near}</div>
    <div class="ln">${rk}<span><span class="d4">一言</span>${m.comment ? esc(m.comment) : "―"}</span></div>
  </article>`;
}
function kaiCard(k, withName){
  const r = k.race, p = k.prof;
  const pf = [p.sex + p.age, `${p.area}・${p.trainer}`, p.sire ? "父" + p.sire : "", k.rec.join("-")].filter(Boolean).map(x => `<i>${esc(x)}</i>`).join("　");
  return `<article class="kai">
    <div class="rl"><span class="d3">${esc(k.label)}</span><span class="meta num">${md(r.date)} ${cond(r)} ${r.n}頭</span></div>
    ${withName ? `<a class="hn d1 link-h" href="${horseUrl(k.hid)}">${esc(k.horse)}</a><div class="pf meta num">${pf}</div>` : ""}
    <div class="col num">
      <div><small>着順</small><b class="d2 ${r.fin <= 3 ? "r" : ""}">${r.fin}</b></div>
      <div><small>人気</small><b class="d2">${r.pop}</b></div>
      <div><small>4角</small><b class="d2">${r.c4 ?? "-"}</b></div>
      <div><small>上がり</small><b class="d2">${r.agari_rk}位</b></div>
      <div><small>${r.fin === 1 ? "2着と" : "勝ち馬と"}</small><b class="d2">${r.diff.toFixed(1)}</b></div>
    </div>
    <div class="qt">${paras(k.text)}<span class="dt num">${+k.received.slice(5,7)}/${+k.received.slice(8,10)}</span></div>
  </article>`;
}
function karteCard(k, link){
  const r = k.race, p = k.prof;
  const name = link ? `<a class="d1 link-h" href="${horseUrl(k.hid)}">${esc(k.horse)}</a>` : `<div class="d1">${esc(k.horse)}</div>`;
  return `<div class="karte"><div class="kh">${name}<div class="meta">${esc(p.sex)}${p.age}　${esc(p.area)}・${esc(p.trainer)}</div></div><table>
    <tr><th>血統</th><td><span class="nw">父 ${esc(p.sire || "")}</span>　<span class="nw">母父 ${esc(p.dam_sire || "")}</span></td></tr>
    <tr><th>デビュー</th><td class="num"><span class="nw">${md(r.date)} ${cond(r)}</span>　<span class="d3">${r.fin}着</span> <span class="nw">${r.pop}人気</span></td></tr>
    <tr><th>中身</th><td class="num"><span class="nw">${r.fin === 1 ? "2着と" : "勝ち馬と"}${r.diff.toFixed(1)}秒</span>　<span class="nw">上がり${r.agari_rk}位 ${r.agari.toFixed(1)}</span>　<span class="nw">${r.wt}kg</span></td></tr>
    <tr><th>評価</th><td class="ph">${ph(first(k.text))}</td></tr>
    <tr><th>向く舞台</th><td>${k.next.map(esc).join("・") || "-"}</td></tr>
    <tr><th>指数</th><td class="blank">―</td></tr>
  </table></div>`;
}
// 週末ごとにまとめる（日曜を週の区切りに）
function weeks(items){
  const g = new Map();
  for (const m of items) {
    const d = new Date(+m.date.slice(0,4), +m.date.slice(4,6) - 1, +m.date.slice(6,8));
    const sun = new Date(d); sun.setDate(d.getDate() + (7 - d.getDay()) % 7);
    const key = sun.toISOString().slice(0,10);
    if (!g.has(key)) g.set(key, []);
    g.get(key).push(m);
  }
  return [...g.entries()].sort((a, b) => b[0].localeCompare(a[0]));
}
const wkLabel = list => {
  const ds = [...new Set(list.map(m => m.date))].sort();
  return ds.map((d, i) => i && d.slice(4,6) === ds[i - 1].slice(4,6) ? +d.slice(6,8) : md(d)).join("・");   // 月をまたぐ日は月も書く
};

// ---- ページごと ----
if (PAGE === "top") {
  week($("week"));
  const recent = weeks(M.items).slice(0, 2).flatMap(w => w[1]);       // 直近2週・並びはデータどおり（GIが先）
  const order = new Map(M.items.map((m, i) => [m.rc, i]));
  recent.sort((a, b) => order.get(a.rc) - order.get(b.rc));
  set("ms-top", recent.length ? `<div class="rows">${recent.map(msRow).join("")}</div><a class="more-link" href="${R}monosashi/">名馬ものさしの一覧</a>` : "");
  set("kai-top", `<div class="rows">${D.items.slice().sort(byNew).slice(0, 3).map(kaiRow).join("")}</div><a class="more-link" href="${R}kaiko/">回顧の一覧</a>`);
  const young = D.items.filter(k => k.prof.age === 2);
  set("karte-top", young.length ? `<div class="rows">${young.map(kaiRow).join("")}</div><a class="more-link" href="${R}karte/">若駒カルテ</a>` : `<p class="meta">2歳の回顧が入ると並びます。</p>`);
}
if (PAGE === "ms-list") {
  set("list", weeks(M.items).map(([, list]) => `<div class="wk"><span class="d3">${wkLabel(list)}の重賞</span><span class="meta">${list.length}レース</span></div><div class="rows">${list.map(msRow).join("")}</div>`).join(""));
}
if (PAGE === "ms-race") {
  const m = M.items.find(x => x.rc === ID);
  set("main", m ? msCard(m) + `<a class="back" href="${R}monosashi/">名馬ものさしの一覧へ</a>` : `<p class="meta">見つかりません</p>`);
}
if (PAGE === "kai-list") {
  set("list", `<div class="rows">${D.items.slice().sort(byNew).map(kaiRow).join("")}</div>`);
}
if (PAGE === "karte-list") {
  const young = D.items.filter(k => k.prof.age === 2);
  set("list", young.length ? young.map(k => karteCard(k, true)).join("") : `<p class="meta">2歳の回顧が入ると並びます。</p>`);
}
if (PAGE === "horse") {
  const ks = D.items.filter(k => k.hid === ID).sort(byNew);
  const k = ks[0];
  if (!k) { set("main", `<p class="meta">見つかりません</p>`); return; }
  const p = k.prof;
  const pf = [p.sex + p.age, `${p.area}・${p.trainer}`, p.sire ? "父" + p.sire : "", p.dam_sire ? "母父" + p.dam_sire : "", "戦績 " + k.rec.join("-")].filter(Boolean).map(x => `<i>${esc(x)}</i>`).join("　");
  const tags = [...new Set(ks.flatMap(x => x.next))];
  const mss = M.items.filter(m => m.hid === ID);
  const hist = k.recent.slice().reverse().map(x => `<tr class="${ks.some(y => y.race.date === x.date) ? "me" : ""}"><td class="num">${x.date.slice(2,4)}/${md(x.date)}</td>
      <td class="n">${esc(x.name)} ${x.grade}</td><td class="num">${x.place}${x.surf}${x.dist}</td><td class="num">${x.pop ? x.pop + "人" : ""}</td><td class="num">${x.fin ? x.fin + "着" : "-"}</td></tr>`).join("");
  document.title = `${k.horse}｜ruis 回顧ノート`;
  set("main", `<div class="hp kai"><div class="hn d1">${esc(k.horse)}</div><div class="pf meta num">${pf}</div>
      <div class="ln">${tags.length ? `<span><span class="d4">狙い</span>${tags.map(esc).join("・")}</span>` : ""}
        <span><span class="d4">次走</span>${k.nxt ? `${md(k.nxt.date)} ${esc(k.nxt.place)}${k.nxt.R}R ${esc(k.nxt.name)}` : "未定（出馬表が出たら表示）"}</span></div></div>
    <h2 class="band d2"><span class="bn d4">01</span>回顧<small>${ks.length}本</small></h2>${ks.map(x => kaiCard(x, false)).join("")}
    ${mss.length ? `<h2 class="band d2"><span class="bn d4">02</span>名馬ものさし</h2>${mss.map(msCard).join("")}` : ""}
    <h2 class="band d2"><span class="bn d4">${mss.length ? "03" : "02"}</span>近5走</h2>
    <table class="hist"><thead><tr><th>日付</th><th>レース</th><th>コース</th><th>人気</th><th>着順</th></tr></thead><tbody>${hist}</tbody></table>
    ${p.age === 2 ? `<h2 class="band d2"><span class="bn d4">${mss.length ? "04" : "03"}</span>若駒カルテ</h2>${karteCard(k, false)}` : ""}
    <a class="back" href="${R}kaiko/">回顧の一覧へ</a>`);
}
})();
