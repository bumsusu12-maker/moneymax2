const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const API_URL = "https://cems.moneybox.or.kr/api/moneybox.php";
const MBOX_ASSET_API = "https://user-api.m-box.com/api/user/assets";
const MBOX_BASE_API = "https://user-api.m-box.com/api/user/currencies/base-rates";

app.disable('x-powered-by');

const TARGET = [
  "USD","JPY","CNY","TWD","HKD","EUR","AUD",
  "SGD","CAD","GBP","THB","PHP","MYR","VND","IDR","CHF","NZD","AED","RUB"
];

const { branches } = require("./branch-config.json");

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'moneymax', time: new Date().toISOString() });
});

// 정적 서버에서 서버 소스와 배포 파일이 외부로 노출되지 않도록 차단한다.
app.use((req, res, next) => {
  if (/^\/(?:server\.js|package(?:-lock)?\.json|README\.md|render\.yaml|branch-config\.json|functions(?:\/|$))/i.test(req.path)) {
    return res.status(404).end();
  }
  next();
});

app.use(express.static(__dirname, {
  index: 'index.html',
  etag: true,
  maxAge: process.env.NODE_ENV === 'production' ? '1h' : 0
}));


function isBlockedText(text) {
  const s = String(text || "").replace(/\s+/g, "");
  return ["예약불가","예약중지","일시중단","거래중지","점검중","환율변동","변동성이심","준비중","중단"].some(k => s.includes(k));
}

function normalizeCurrencyUnit(currency, value) {
  if (value === null || value === undefined) return null;
  let n = Number(value);
  if (!Number.isFinite(n)) return null;
  if (["JPY", "VND", "IDR"].includes(currency) && n > 0 && n < 100) n = n * 100;
  return n;
}


function normalizeBySource(branch, currency, value) {
  if (value === null || value === undefined) return null;
  let n = Number(value);
  if (!Number.isFinite(n)) return null;
  if (branch === "제일환전") {
    if (["VND", "IDR"].includes(currency) && n >= 100) return n / 100;
    if (currency === "TWD") {
      if (n >= 1000) return n / 100;
      if (n >= 100 && n < 1000) return n / 10;
      return n;
    }
    const roughMax = {USD:3000,EUR:3000,AUD:3000,CAD:3000,SGD:3000,HKD:400,CNY:400,THB:100,PHP:100,MYR:1000,RUB:50}[currency] || 999999;
    if (n > roughMax) return n / 100;
  }
  return n;
}

function num(v) {
  const n = Number(String(v ?? "").replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : null;
}


function parseMboxBranchText(text, branch) {
  const body = String(text || "").replace(/\s+/g, " ").trim();
  const data = [];
  const dateMatch = body.match(/실시간\s*환율\s*(.*?)\s*기준/);
  const dateText = dateMatch ? dateMatch[1].trim() : new Date().toISOString().slice(0, 10);

  for (const currency of TARGET) {
    const re = new RegExp(`${currency}\\s*\\(${currency}\\)\\s*([0-9][0-9,]*(?:\\.[0-9]+)?)`, "i");
    const m = body.match(re);
    if (!m) continue;

    let buy = normalizeCurrencyUnit(currency, num(m[1]));
    buy = validSideRate({ buy, rowText: m[0], source: branch.mboxPage }, branch.name, currency, "buy", buy, false);
    if (buy == null) continue;

    data.push({
      branch: branch.name,
      area: branch.area,
      currency,
      buy,
      sell: null,
      base: null,
      blocked: false,
      status: "정상",
      spread: null,
      buyDiff: null,
      sellDiff: null,
      date: dateText,
      source: branch.mboxPage,
      type: "moneybox-mbox"
    });
  }

  return data;
}

async function getMboxBranch(branch) {
  if (!branch.mboxPage) return [];
  const response = await axios.get(branch.mboxPage, {
    timeout: 15000,
    headers: {
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
      "User-Agent": "Mozilla/5.0"
    }
  });
  const $ = cheerio.load(response.data || "");
  const rows = parseMboxBranchText($.root().text(), branch);
  if (!rows.length) throw new Error("M-BOX 지점 페이지 파싱 실패");
  return rows;
}

async function HTTP_GET_JSON(url, headers) {
  const response = await axios.get(url, { timeout: 15000, headers });
  return response.data;
}


async function getNewMboxBranch(branch) {
  if (!branch.apiCode) throw new Error("새 M-BOX API 코드 없음");
  const url = `${MBOX_ASSET_API}/${encodeURIComponent(branch.apiCode)}`;

  const requestHeaders = {
    "Accept": "application/json, text/plain, */*",
    "Origin": "https://m-box.com",
    "Referer": "https://m-box.com/",
    "User-Agent": "Mozilla/5.0"
  };

  const assetResponse = await HTTP_GET_JSON(url, requestHeaders);
  const asset = assetResponse?.data;
  if (!asset || !Array.isArray(asset.exchangeRates)) throw new Error("새 M-BOX 지점 API 데이터 형식 오류");

  // base-rates는 공통 기준율이다. 실패해도 지점 매입/매각 데이터는 계속 사용한다.
  let baseMap = {};
  try {
    const baseResponse = await HTTP_GET_JSON(MBOX_BASE_API, requestHeaders);
    const baseRows = Array.isArray(baseResponse?.data) ? baseResponse.data : [];
    baseMap = Object.fromEntries(baseRows.map(r => [r.currencyCode, normalizeCurrencyUnit(r.currencyCode, num(r.baseRate))]));
  } catch (_) {}

  const now = new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });
  return asset.exchangeRates
    .filter(r => TARGET.includes(r.currencyCode))
    .map(r => {
      const currency = r.currencyCode;
      // 새 API의 buyRate/sellRate는 '지점 기준'이다.
      // MoneyMax는 고객 기준이므로: 살 때 = 지점 sellRate, 팔 때 = 지점 buyRate.
      let buy = normalizeCurrencyUnit(currency, num(r.sellRate));
      let sell = normalizeCurrencyUnit(currency, num(r.buyRate));
      const base = baseMap[currency] ?? null;

      // 지점이 판매 제외면 고객은 살 수 없고, 매입 제외면 고객은 팔 수 없다.
      if (r.excludedFromSale === true) buy = null;
      if (r.excludedFromPurchase === true) sell = null;

      // 0/음수/비정상 숫자는 이전 값 유지 없이 즉시 미등록 처리한다.
      if (!Number.isFinite(buy) || buy <= 0) buy = null;
      if (!Number.isFinite(sell) || sell <= 0) sell = null;

      return {
        branch: branch.name, area: branch.area, currency,
        buy, sell, base,
        blocked: buy == null && sell == null,
        status: buy == null && sell == null ? "미등록" : "정상",
        spread: buy != null && sell != null ? buy - sell : null,
        buyDiff: buy != null && base != null ? buy - base : null,
        sellDiff: sell != null && base != null ? sell - base : null,
        date: now,
        source: url,
        type: "moneybox-api"
      };
    });
}

async function getBranchSafe(branch) {
  // 본사에서 새 사이트로 전환한 지점만 새 JSON API를 사용한다.
  // 아직 전환되지 않은 지점은 기존 CEMS 수집 방식을 그대로 유지한다.
  if (branch.apiCode) return getNewMboxBranch(branch);
  return getBranch(branch);
}


// V15.6 side registration validation
const MANUAL_SIDE_BLOCKS = {
  // 새 M-BOX API 지점은 excludedFromSale / excludedFromPurchase를 직접 사용한다.
  // 기존 CEMS 지점에만 정말 필요한 예외가 생길 경우 여기에 추가한다.
};

function isManualSideBlocked(branchName, currency, side) {
  const block = MANUAL_SIDE_BLOCKS?.[branchName]?.[currency];
  return Array.isArray(block) && block.includes(side);
}

function isDisabledValue(v) {
  const s = String(v ?? "").trim().toLowerCase();
  if (s === "") return false;
  return [
    "0", "n", "no", "false", "off", "disabled", "disable",
    "미등록", "미사용", "사용안함", "예약불가", "예약중지", "중지", "불가", "점검"
  ].some(x => s === x || s.includes(x));
}

function sideDisabledByRawFields(raw, side) {
  if (!raw || typeof raw !== "object") return false;
  const sideKeys = side === "buy"
    ? ["buy", "매입", "살때", "sal", "purchase"]
    : ["sell", "매각", "팔때", "pal", "sale"];

  const controlKeys = ["yn", "use", "used", "show", "view", "display", "enable", "enabled", "flag", "chk", "check", "status", "state", "reg", "register", "예약"];

  for (const [key, value] of Object.entries(raw)) {
    const k = String(key).toLowerCase();
    const isSideKey = sideKeys.some(s => k.includes(String(s).toLowerCase()));
    const isControlKey = controlKeys.some(c => k.includes(c));
    if (isSideKey && isControlKey && isDisabledValue(value)) {
      return true;
    }
  }

  const text = JSON.stringify(raw);
  if (side === "buy" && /(매입|살.?때).{0,8}(미등록|미사용|예약불가|예약중지|중지|불가|off|false)/i.test(text)) return true;
  if (side === "sell" && /(매각|팔.?때).{0,8}(미등록|미사용|예약불가|예약중지|중지|불가|off|false)/i.test(text)) return true;

  return false;
}

function validSideRate(raw, branchName, currency, side, value, blocked) {
  if (blocked) return null;
  if (isManualSideBlocked(branchName, currency, side)) return null;
  if (sideDisabledByRawFields(raw, side)) return null;

  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;

  return n;
}

async function getBranch(branch) {
  const response = await axios.post(API_URL, "cmd=C010", {
    timeout: 15000,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Accept": "application/json, text/javascript, */*; q=0.01",
      "Origin": branch.origin,
      "Referer": branch.referer,
      "User-Agent": "Mozilla/5.0"
    }
  });
  const payload = typeof response.data === "string" ? JSON.parse(response.data) : response.data;
  if (!payload || !Array.isArray(payload.data)) throw new Error("데이터 형식 오류");
  return payload.data.filter(x => TARGET.includes(x.crc)).map(x => {
    let buy = num(x.buy), sell = num(x.sell), base = num(x.base || x.bas);
    const blocked = isBlockedText(JSON.stringify(x));
    buy = normalizeCurrencyUnit(x.crc, buy);
    sell = normalizeCurrencyUnit(x.crc, sell);
    base = normalizeCurrencyUnit(x.crc, base);

    const validBuy = validSideRate(x, branch.name, x.crc, "buy", buy, blocked);
    const validSell = validSideRate(x, branch.name, x.crc, "sell", sell, blocked);

    return {
      branch: branch.name, area: branch.area, currency: x.crc,
      buy: validBuy,
      sell: validSell,
      base: blocked ? null : base,
      blocked,
      status: blocked ? "예약중지" : "정상",
      spread: validBuy && validSell ? validBuy - validSell : null,
      buyDiff: validBuy && base ? validBuy - base : null,
      sellDiff: validSell && base ? validSell - base : null,
      date: payload.dt ? payload.dt[0] : "-",
      source: branch.referer,
      type: "moneybox"
    };
  });
}

async function getJeil() {
  const url = "http://jeilexchange.com/";
  const response = await axios.get(url, { timeout: 15000, headers: {"User-Agent":"Mozilla/5.0"} });
  const $ = cheerio.load(response.data);
  const dateText = $(".title_right").first().text().trim() || new Date().toISOString().slice(0,10);
  const data = [];
  $(".table_line").each((i, el) => {
    const tds = $(el).find("td");
    const currency = $(tds[2]).text().trim();
    let buy = num($(tds[3]).text());
    let sell = num($(tds[4]).text());
    if (!TARGET.includes(currency) || buy == null || sell == null) return;

    const blocked = isBlockedText($(el).text());
    buy = normalizeCurrencyUnit(currency, buy);
    sell = normalizeCurrencyUnit(currency, sell);
    buy = normalizeBySource("제일환전", currency, buy);
    sell = normalizeBySource("제일환전", currency, sell);

    const validBuy = validSideRate({ buy, sell, rowText: $(el).text() }, "제일환전", currency, "buy", buy, blocked);
    const validSell = validSideRate({ buy, sell, rowText: $(el).text() }, "제일환전", currency, "sell", sell, blocked);

    data.push({
      branch:"제일환전", area:"명동", currency, buy: validBuy, sell: validSell, base:null, blocked, status: blocked ? "예약중지" : "정상",
      spread: validBuy && validSell ? validBuy - validSell : null, buyDiff:null, sellDiff:null,
      date: dateText, source:url, type:"external"
    });
  });
  if (!data.length) throw new Error("제일환전 데이터 파싱 실패");
  return data;
}

app.get('/api/rates', async (req, res) => {
  const jobs = [
    ...branches.map(branch => ({
      name: branch.name,
      area: branch.area,
      mode: branch.apiCode ? "NEW_API" : "LEGACY",
      apiCode: branch.apiCode || null,
      promise: getBranchSafe(branch)
    })),
    { name:"제일환전", area:"명동", mode:"EXTERNAL", apiCode:null, promise:getJeil() }
  ];
  const results = await Promise.allSettled(jobs.map(j => j.promise));
  const data = [], errors = [], branchStatus = [];
  const updatedAt = new Date().toLocaleString("ko-KR", { timeZone:"Asia/Seoul" });

  results.forEach((r,i) => {
    const job = jobs[i];
    if (r.status === "fulfilled") {
      const rows = Array.isArray(r.value) ? r.value : [];
      data.push(...rows);
      branchStatus.push({
        name: job.name,
        area: job.area,
        mode: job.mode,
        apiCode: job.apiCode,
        ok: rows.length > 0,
        status: rows.length > 0 ? "정상" : "데이터 없음",
        rowCount: rows.length,
        updatedAt,
        error: null
      });
    } else {
      const message = r.reason?.message || String(r.reason);
      errors.push(job.name + ": " + message);
      branchStatus.push({
        name: job.name,
        area: job.area,
        mode: job.mode,
        apiCode: job.apiCode,
        ok: false,
        status: "수집 실패",
        rowCount: 0,
        updatedAt,
        error: message
      });
    }
  });

  res.json({
    success: data.length > 0,
    updatedAt,
    collectedAt: new Date().toISOString(),
    currencies: TARGET,
    branchCount: jobs.length,
    data,
    errors,
    branchStatus
  });
});

async function yahoo(symbol) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1d&interval=5m`;
  const r = await axios.get(url, {timeout:10000, headers:{"User-Agent":"Mozilla/5.0"}});
  const result = r.data?.chart?.result?.[0];
  const meta = result?.meta || {};
  const price = meta.regularMarketPrice || meta.previousClose || null;
  const prev = meta.chartPreviousClose || meta.previousClose || null;
  const changePct = price && prev ? ((price - prev) / prev * 100) : null;
  return { price, changePct };
}

async function tradingViewQuotes(symbols) {
  const response = await axios.post("https://scanner.tradingview.com/global/scan", {
    symbols: {
      tickers: symbols,
      query: { types: [] }
    },
    columns: ["close", "change", "change_abs"]
  }, {
    timeout: 10000,
    headers: {
      "User-Agent": "Mozilla/5.0",
      "Content-Type": "application/json"
    }
  });

  const out = {};
  for (const row of (response.data?.data || [])) {
    const symbol = row.s;
    const d = row.d || [];
    out[symbol] = {
      price: d[0] ?? null,
      changePct: d[1] ?? null,
      changeAbs: d[2] ?? null,
      source: "TradingView"
    };
  }
  return out;
}

function firstValid(...items) {
  return items.find(x => x && x.price != null && Number.isFinite(Number(x.price))) || null;
}

function makeValue(price, changePct = null, source = "calculated") {
  return price == null || !Number.isFinite(Number(price))
    ? null
    : { price: Number(price), changePct, source };
}

function parseNumberLoose(value) {
  if (value == null) return null;
  const cleaned = String(value)
    .replace(/,/g, "")
    .replace(/[^\d.+-]/g, "")
    .trim();
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

async function getInvestingQuote(slug) {
  const urls = [
    `https://kr.investing.com/currencies/${slug}`,
    `https://www.investing.com/currencies/${slug}`
  ];

  let lastError = null;

  for (const url of urls) {
    try {
      const response = await axios.get(url, {
        timeout: 12000,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
          "Referer": "https://kr.investing.com/"
        }
      });

      const html = response.data || "";

      const pricePatterns = [
        /data-test=["']instrument-price-last["'][^>]*>([^<]+)</i,
        /"lastPrice"\s*:\s*"([^"]+)"/i,
        /"last"\s*:\s*"([^"]+)"/i,
        /"last_close"\s*:\s*"([^"]+)"/i,
        /"price"\s*:\s*"([^"]+)"/i
      ];

      const changePatterns = [
        /data-test=["']instrument-price-change-percent["'][^>]*>\s*<span[^>]*>\s*([^<]+)</i,
        /"changePercent"\s*:\s*"([^"]+)"/i,
        /"change_percent"\s*:\s*"([^"]+)"/i
      ];

      let price = null;
      let changePct = null;

      for (const p of pricePatterns) {
        const m = html.match(p);
        if (m) {
          price = parseNumberLoose(m[1]);
          if (price != null) break;
        }
      }

      for (const p of changePatterns) {
        const m = html.match(p);
        if (m) {
          changePct = parseNumberLoose(m[1]);
          if (changePct != null) break;
        }
      }

      if (price != null) {
        return { price, changePct, source: "Investing" };
      }
    } catch (e) {
      lastError = e;
    }
  }

  throw new Error(lastError?.message || `Investing parse failed: ${slug}`);
}

async function getInvestingMap() {
  const slugs = {
    usdkrw: "usd-krw",
    jpykrw: "jpy-krw",
    usdjpy: "usd-jpy",
    eurkrw: "eur-krw",
    cnykrw: "cny-krw",
    twdkrw: "twd-krw",
    hkdkrw: "hkd-krw"
  };

  const entries = await Promise.allSettled(
    Object.entries(slugs).map(async ([key, slug]) => [key, await getInvestingQuote(slug)])
  );

  const out = {};
  const errors = [];

  for (const r of entries) {
    if (r.status === "fulfilled") {
      out[r.value[0]] = r.value[1];
    } else {
      errors.push(r.reason?.message || String(r.reason));
    }
  }

  return { out, errors };
}

app.get('/api/markets', async (req,res)=>{
  const errors = [];
  const sourceMode = req.query.source === "investing" ? "investing" : "tradingview";
  async function safe(name, fn) {
    try { return await fn(); } catch(e) { errors.push(name + ": " + e.message); return null; }
  }

  const tvSymbols = [
    "FX_IDC:USDKRW",
    "FX:USDKRW",
    "FX_IDC:JPYKRW",
    "OANDA:JPYKRW",
    "FOREXCOM:JPYKRW",
    "FX:JPYKRW",
    "FX:USDJPY",
    "TVC:DXY",
    "NYMEX:CL1!",
    "TVC:USOIL",
    "KRX:KOSPI",
    "CBOE:VIX",
    "NASDAQ:IXIC",
    "SP:SPX",
    "TVC:US10Y",
    "FX_IDC:EURKRW",
    "FX:EURKRW",
    "OANDA:EURKRW",
    "FX:EURUSD",
    "FX_IDC:CNYKRW",
    "FX:CNYKRW",
    "FX:USDCNH",
    "FX:USDCNY",
    "FX_IDC:TWDKRW",
    "FX:TWDKRW",
    "FX_IDC:USDTWD",
    "FX:USDTWD",
    "FX_IDC:HKDKRW",
    "FX:HKDKRW",
    "FX:USDHKD"
  ];

  const tv = await safe("TradingView", () => tradingViewQuotes(tvSymbols)) || {};
  const investingResult = await safe("Investing", () => getInvestingMap());
  const investing = investingResult?.out || {};
  if (investingResult?.errors?.length) errors.push(...investingResult.errors.map(e => "Investing item: " + e));

  const tvUsdkrw = firstValid(tv["FX_IDC:USDKRW"], tv["FX:USDKRW"]);
  const tvJpyRaw = firstValid(tv["FX_IDC:JPYKRW"], tv["OANDA:JPYKRW"], tv["FOREXCOM:JPYKRW"], tv["FX:JPYKRW"]);
  const tvJpykrw = tvJpyRaw?.price ? { ...tvJpyRaw, price: tvJpyRaw.price * 100, source: `${tvJpyRaw.source} ×100` } : null;
  const tvUsdjpy = firstValid(tv["FX:USDJPY"]);

  const usdkrw = sourceMode === "investing" ? firstValid(investing.usdkrw, tvUsdkrw) : firstValid(tvUsdkrw, investing.usdkrw);
  const jpykrw = sourceMode === "investing" ? firstValid(investing.jpykrw, tvJpykrw) : firstValid(tvJpykrw, investing.jpykrw);
  const usdjpy = sourceMode === "investing" ? firstValid(investing.usdjpy, tvUsdjpy) : firstValid(tvUsdjpy, investing.usdjpy);

  const wti = firstValid(tv["NYMEX:CL1!"], tv["TVC:USOIL"]);
  const dxy = firstValid(tv["TVC:DXY"]);
  const kospi = firstValid(tv["KRX:KOSPI"]);
  const vix = firstValid(tv["CBOE:VIX"]);
  const nasdaq = firstValid(tv["NASDAQ:IXIC"]);
  const sp500 = firstValid(tv["SP:SPX"]);
  const us10y = firstValid(tv["TVC:US10Y"]);

  const eurDirect = firstValid(investing.eurkrw, tv["FX_IDC:EURKRW"], tv["FX:EURKRW"], tv["OANDA:EURKRW"]);
  const eurkrw = eurDirect || makeValue(
    usdkrw?.price && tv["FX:EURUSD"]?.price ? usdkrw.price * tv["FX:EURUSD"].price : null,
    null,
    "USDKRW × EURUSD"
  );

  const cnyDirect = firstValid(investing.cnykrw, tv["FX_IDC:CNYKRW"], tv["FX:CNYKRW"]);
  const usdcnh = firstValid(tv["FX:USDCNH"], tv["FX:USDCNY"]);
  const cnykrw = cnyDirect || makeValue(
    usdkrw?.price && usdcnh?.price ? usdkrw.price / usdcnh.price : null,
    null,
    "USDKRW ÷ USDCNH"
  );

  const twdDirect = firstValid(investing.twdkrw, tv["FX_IDC:TWDKRW"], tv["FX:TWDKRW"]);
  const usdtwd = firstValid(tv["FX_IDC:USDTWD"], tv["FX:USDTWD"]);
  const twdkrw = twdDirect || makeValue(
    usdkrw?.price && usdtwd?.price ? usdkrw.price / usdtwd.price : null,
    null,
    "USDKRW ÷ USDTWD"
  );

  const hkdDirect = firstValid(investing.hkdkrw, tv["FX_IDC:HKDKRW"], tv["FX:HKDKRW"]);
  const usdhkd = firstValid(tv["FX:USDHKD"]);
  const hkdkrw = hkdDirect || makeValue(
    usdkrw?.price && usdhkd?.price ? usdkrw.price / usdhkd.price : null,
    null,
    "USDKRW ÷ USDHKD"
  );

  const usdt = await safe("USDT", async () => {
    const r = await axios.get("https://api.upbit.com/v1/ticker?markets=KRW-USDT", {timeout:10000});
    const price = r.data?.[0]?.trade_price || null;
    return { price, changePct: null, source: "Upbit" };
  });

  const upbit = await safe("Upbit BTC", async ()=>{
    const r = await axios.get("https://api.upbit.com/v1/ticker?markets=KRW-BTC", {timeout:10000});
    return r.data?.[0]?.trade_price || null;
  });

  const binance = await safe("Binance BTC", async ()=>{
    const r = await axios.get("https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT", {timeout:10000});
    return Number(r.data?.price) || null;
  });

  let kimchi = null;
  const usdkrwPrice = usdkrw?.price || null;
  if (upbit && binance && usdkrwPrice) {
    const globalKrw = binance * usdkrwPrice;
    const premium = (upbit - globalKrw) / globalKrw * 100;
    kimchi = { premium, diff: upbit - globalKrw, upbit, binance, usdkrw: usdkrwPrice, globalKrw };
  }

  res.json({
    success: true,
    updatedAt: new Date().toLocaleString("ko-KR", { timeZone:"Asia/Seoul" }),
    source: sourceMode === "investing" ? "Investing priority + TradingView fallback + Upbit + Binance" : "TradingView priority + Investing fallback + Upbit + Binance",
    sourceMode,
    indicators: {
      usdkrw, jpykrw, usdjpy, usdt,
      wti, dxy, kospi, vix, nasdaq, sp500, us10y,
      eurkrw, cnykrw, twdkrw, hkdkrw,
      kimchi
    },
    errors
  });
});



// Restore V14.7 server start

// V15.5.1 server start
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`MoneyMax V16.5 running on http://localhost:${PORT}`);
});
