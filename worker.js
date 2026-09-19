// MONEYMAX v16.8.2 - Cloudflare Worker + Static Assets
// API handlers are adapted from the previous Pages Functions version.

const branches = [
  {
    "name": "머니박스 강남",
    "area": "강남",
    "origin": "http://moneyboxgn.com",
    "referer": "http://moneyboxgn.com/",
    "apiCode": "gangnam-stn"
  },
  {
    "name": "머니박스 성수",
    "area": "성수",
    "origin": "https://moneyboxseongsu.com",
    "referer": "https://moneyboxseongsu.com/",
    "apiCode": "seongsu-stn"
  },
  {
    "name": "머니박스 홍대",
    "area": "홍대",
    "origin": "http://www.moneyboxhd.com",
    "referer": "http://www.moneyboxhd.com/",
    "apiCode": "hongdae"
  },
  {
    "name": "머니박스 명동",
    "area": "명동",
    "origin": "http://www.moneyboxmd.com",
    "referer": "http://www.moneyboxmd.com/",
    "apiCode": "myeongdong-main"
  },
  {
    "name": "머니박스 인사동",
    "area": "인사동",
    "origin": "http://www.moneyboxis.com",
    "referer": "http://www.moneyboxis.com/",
    "apiCode": "insadong"
  },
  {
    "name": "머니박스 남대문",
    "area": "남대문",
    "origin": "http://www.moneyboxndm.com",
    "referer": "http://www.moneyboxndm.com/",
    "apiCode": "namdaemun"
  },
  {
    "name": "머니박스 명동2",
    "area": "명동2",
    "origin": "http://www.moneyboxmd2.com",
    "referer": "http://www.moneyboxmd2.com/",
    "apiCode": "myeongdong-2"
  },
  {
    "name": "머니박스 충무로",
    "area": "충무로",
    "origin": "https://moneyboxcmr.com",
    "referer": "https://moneyboxcmr.com/",
    "apiCode": "chungmuro"
  },
  {
    "name": "머니박스 동대문",
    "area": "동대문",
    "origin": "http://www.moneyboxddm.com",
    "referer": "http://www.moneyboxddm.com/",
    "apiCode": "dongdaemun"
  },
  {
    "name": "머니박스 서울역",
    "area": "서울역",
    "origin": "http://www.moneyboxsst.com",
    "referer": "http://www.moneyboxsst.com/",
    "apiCode": "seoul-stn"
  },
  {
    "name": "머니박스 부산역",
    "area": "부산역",
    "origin": "http://www.moneyboxbst.com",
    "referer": "http://www.moneyboxbst.com/",
    "apiCode": "busan-stn"
  },
  {
    "name": "머니박스 강남신사",
    "area": "강남신사",
    "origin": "https://moneyboxsinsa.com",
    "referer": "https://moneyboxsinsa.com/",
    "apiCode": "sinsa-gangnam"
  },
  {
    "name": "머니박스 여의도",
    "area": "여의도",
    "origin": "https://moneyboxyud.com",
    "referer": "https://moneyboxyud.com/",
    "apiCode": "yeouido"
  },
  {
    "name": "머니박스 광장시장",
    "area": "광장시장",
    "origin": "https://moneyboxkjm.com",
    "referer": "https://moneyboxkjm.com/",
    "apiCode": "gwangjang-market"
  },
  {
    "name": "머니박스 연남",
    "area": "연남",
    "origin": "https://moneyboxynd.com",
    "referer": "https://moneyboxynd.com/",
    "apiCode": "yeonnam"
  },
  {
    "name": "머니박스 이태원",
    "area": "이태원",
    "origin": "http://moneyboxitw.com",
    "referer": "http://moneyboxitw.com/",
    "apiCode": "itaewon"
  },
  {
    "name": "머니박스 부평",
    "area": "부평",
    "origin": "http://moneyboxbp.com",
    "referer": "http://moneyboxbp.com/",
    "apiCode": "bupyeong"
  },
  {
    "name": "머니박스 대구",
    "area": "대구",
    "origin": "http://moneyboxdg.com",
    "referer": "http://moneyboxdg.com/",
    "apiCode": "daegu"
  },
  {
    "name": "머니박스 제주",
    "area": "제주",
    "origin": "http://www.moneyboxjeju.com",
    "referer": "http://www.moneyboxjeju.com/",
    "apiCode": "jeju"
  },
  {
    "name": "머니박스 제주동문",
    "area": "제주동문",
    "origin": "https://www.moneyboxjjdm.com",
    "referer": "https://www.moneyboxjjdm.com/",
    "apiCode": "jeju-dongmun-market"
  },
  {
    "name": "머니박스 수원",
    "area": "수원",
    "origin": "https://www.moneyboxsw.com",
    "referer": "https://www.moneyboxsw.com/",
    "apiCode": "suwon"
  },
  {
    "name": "머니박스 마포",
    "area": "마포",
    "origin": "http://www.moneyboxmp.com",
    "referer": "http://www.moneyboxmp.com/",
    "apiCode": "mapo"
  },
  {
    "name": "머니박스 송도",
    "area": "송도",
    "origin": "https://www.moneyboxsd.com",
    "referer": "https://www.moneyboxsd.com/",
    "apiCode": "songdo"
  },
  {
    "name": "머니박스 용산",
    "area": "용산",
    "origin": "https://m-box.com",
    "referer": "https://m-box.com/branch/YS1",
    "mboxPage": "https://m-box.com/branch/YS1",
    "apiCode": "seoul-dragon-city"
  },
  {
    "name": "머니박스 울산",
    "area": "울산",
    "origin": "http://www.moneyboxulsan.com",
    "referer": "http://www.moneyboxulsan.com/",
    "apiCode": "ulsan-samsan"
  },
  {
    "name": "머니박스 창원",
    "area": "창원",
    "origin": "https://m-box.com",
    "referer": "https://m-box.com/",
    "apiCode": "changwon"
  },
  {
    "name": "머니박스 김해공항",
    "area": "김해공항",
    "origin": "https://m-box.com",
    "referer": "https://m-box.com/",
    "apiCode": "gimhae-airport"
  },
  {
    "name": "머니박스 안양",
    "area": "안양",
    "origin": "https://m-box.com",
    "referer": "https://m-box.com/",
    "apiCode": "anyang-beomgye-stn"
  },
  {
    "name": "머니박스 안국",
    "area": "안국",
    "origin": "https://m-box.com",
    "referer": "https://m-box.com/",
    "apiCode": "anguk-stn"
  }
];


const TARGET = [
  "USD","JPY","CNY","TWD","HKD","EUR","AUD",
  "SGD","CAD","GBP","THB","PHP","MYR","VND","IDR","CHF","NZD","AED","RUB"
];

const API_URL = "https://cems.moneybox.or.kr/api/moneybox.php";
const MBOX_ASSET_API = "https://user-api.m-box.com/api/user/assets";
const MBOX_BASE_API = "https://user-api.m-box.com/api/user/currencies/base-rates";

function num(v) {
  if (v === null || v === undefined) return null;
  const n = Number(String(v).replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : null;
}

function stripTags(s) {
  return String(s || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}


function normalizeCurrencyUnit(currency, value) {
  if (value === null || value === undefined) return null;
  let n = Number(value);
  if (!Number.isFinite(n)) return null;
  if (["JPY", "VND", "IDR"].includes(currency) && n > 0 && n < 100) n = n * 100;
  return n;
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

    const buy = normalizeCurrencyUnit(currency, num(m[1]));
    if (buy == null || buy <= 0) continue;

    data.push({
      branch: branch.name,
      area: branch.area,
      currency,
      buy,
      sell: null,
      base: null,
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
  const response = await fetch(branch.mboxPage, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7"
    }
  });
  const html = await response.text();
  const rows = parseMboxBranchText(stripTags(html), branch);
  if (!rows.length) throw new Error("M-BOX 지점 페이지 파싱 실패");
  return rows;
}

async function HTTP_GET_JSON(url, headers) {
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return await response.json();
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

async function getBranch(branch) {
  const response = await fetch(API_URL, {
    method: "POST",
    body: "cmd=C010",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Accept": "application/json, text/javascript, */*; q=0.01",
      "Origin": branch.origin,
      "Referer": branch.referer,
      "User-Agent": "Mozilla/5.0"
    }
  });

  const raw = await response.text();
  let payload;
  try {
    payload = JSON.parse(raw);
  } catch (e) {
    throw new Error("JSON 파싱 실패");
  }

  if (!payload || !Array.isArray(payload.data)) {
    throw new Error("데이터 형식 오류");
  }

  return payload.data
    .filter(x => TARGET.includes(x.crc))
    .map(x => {
      const buy = normalizeCurrencyUnit(x.crc, num(x.buy));
      const sell = normalizeCurrencyUnit(x.crc, num(x.sell));
      const base = normalizeCurrencyUnit(x.crc, num(x.base || x.bas));
      return {
        branch: branch.name,
        area: branch.area,
        currency: x.crc,
        buy,
        sell,
        base,
        spread: buy && sell ? buy - sell : null,
        buyDiff: buy && base ? buy - base : null,
        sellDiff: sell && base ? sell - base : null,
        date: payload.dt ? payload.dt[0] : "-",
        source: branch.referer,
        type: "moneybox"
      };
    });
}

async function getJeil() {
  const url = "http://jeilexchange.com/";
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
    }
  });

  const html = await response.text();
  const dateMatch = html.match(/<span class="title_right">([\s\S]*?)<\/span>/);
  const dateText = dateMatch ? stripTags(dateMatch[1]) : new Date().toISOString().slice(0, 10);

  const rows = [...html.matchAll(/<tr class="table_line">([\s\S]*?)<\/tr>/g)];
  const data = [];

  for (const row of rows) {
    const cells = [...row[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map(m => stripTags(m[1]));
    const currency = cells[2];
    let buy = num(cells[3]);
    let sell = num(cells[4]);

    if (!TARGET.includes(currency) || buy === null || sell === null) continue;

    data.push({
      branch: "제일환전",
      area: "명동",
      currency,
      buy,
      sell,
      base: null,
      spread: buy - sell,
      buyDiff: null,
      sellDiff: null,
      date: dateText,
      source: url,
      type: "external"
    });
  }

  if (!data.length) throw new Error("제일환전 데이터 파싱 실패");
  return data;
}

async function handleRatesGet() {
  const jobs = [
    ...branches.map(branch => ({
      name: branch.name,
      promise: getBranchSafe(branch)
    })),
    {
      name: "제일환전",
      promise: getJeil()
    }
  ];

  const results = await Promise.allSettled(jobs.map(job => job.promise));
  const data = [];
  const errors = [];
  const branchStatus = [];
  const updatedAt = new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });

  results.forEach((r, i) => {
    const job = jobs[i];
    const branch = branches.find(b => b.name === job.name);
    const mode = job.name === "제일환전" ? "EXTERNAL" : (branch?.apiCode ? "NEW_API" : "LEGACY");
    const apiCode = branch?.apiCode || null;
    const area = branch?.area || (job.name === "제일환전" ? "명동" : "");

    if (r.status === "fulfilled") {
      const rows = Array.isArray(r.value) ? r.value : [];
      data.push(...rows);
      branchStatus.push({
        name: job.name, area, mode, apiCode,
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
        name: job.name, area, mode, apiCode,
        ok: false,
        status: "수집 실패",
        rowCount: 0,
        updatedAt,
        error: message
      });
    }
  });

  return Response.json({
    success: data.length > 0,
    updatedAt,
    currencies: TARGET,
    branchCount: jobs.length,
    data,
    errors,
    branchStatus
  });
}


async function yahoo(symbol) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1d&interval=5m`;
  const r = await fetch(url, { headers: {"User-Agent":"Mozilla/5.0"} });
  if (!r.ok) throw new Error(`Yahoo ${symbol} HTTP ${r.status}`);
  const data = await r.json();
  const result = data?.chart?.result?.[0];
  const meta = result?.meta || {};
  const price = meta.regularMarketPrice ?? meta.previousClose ?? null;
  const prev = meta.chartPreviousClose ?? meta.previousClose ?? null;
  const changePct = price != null && prev ? ((price - prev) / prev * 100) : null;
  return price == null ? null : { price: Number(price), changePct, source: "Yahoo" };
}

function firstMarketValue(...items) {
  return items.find(x => x && x.price != null && Number.isFinite(Number(x.price))) || null;
}

function makeMarketValue(price, changePct = null, source = "calculated") {
  return price == null || !Number.isFinite(Number(price))
    ? null
    : { price: Number(price), changePct, source };
}

async function tradingViewQuotes(symbols) {
  const r = await fetch("https://scanner.tradingview.com/global/scan", {
    method: "POST",
    headers: {
      "User-Agent": "Mozilla/5.0",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      symbols: { tickers: symbols, query: { types: [] } },
      columns: ["close", "change", "change_abs"]
    })
  });
  if (!r.ok) throw new Error(`TradingView HTTP ${r.status}`);
  const json = await r.json();
  const out = {};
  for (const row of (json?.data || [])) {
    const d = row?.d || [];
    out[row.s] = {
      price: d[0] ?? null,
      changePct: d[1] ?? null,
      changeAbs: d[2] ?? null,
      source: "TradingView"
    };
  }
  return out;
}

function parseMarketNumber(value) {
  if (value == null) return null;
  const n = Number(String(value).replace(/,/g, "").replace(/[^\d.+-]/g, "").trim());
  return Number.isFinite(n) ? n : null;
}

async function investingQuote(slug) {
  const urls = [
    `https://kr.investing.com/currencies/${slug}`,
    `https://www.investing.com/currencies/${slug}`
  ];
  let lastError = null;
  for (const url of urls) {
    try {
      const r = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
          "Referer": "https://kr.investing.com/"
        }
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const html = await r.text();
      const pricePatterns = [
        /data-test=["']instrument-price-last["'][^>]*>([^<]+)</i,
        /"lastPrice"\s*:\s*"([^"]+)"/i,
        /"last"\s*:\s*"([^"]+)"/i,
        /"last_close"\s*:\s*"([^"]+)"/i
      ];
      const changePatterns = [
        /data-test=["']instrument-price-change-percent["'][^>]*>\s*(?:<span[^>]*>)?\s*([^<]+)</i,
        /"changePercent"\s*:\s*"([^"]+)"/i,
        /"change_percent"\s*:\s*"([^"]+)"/i
      ];
      let price = null, changePct = null;
      for (const pat of pricePatterns) {
        const m = html.match(pat);
        if (m && (price = parseMarketNumber(m[1])) != null) break;
      }
      for (const pat of changePatterns) {
        const m = html.match(pat);
        if (m && (changePct = parseMarketNumber(m[1])) != null) break;
      }
      if (price != null) return { price, changePct, source: "Investing" };
    } catch (e) { lastError = e; }
  }
  throw new Error(lastError?.message || `Investing parse failed: ${slug}`);
}

async function handleMarketsGet(context = {}) {
  const errors = [];
  const requestUrl = context?.request?.url ? new URL(context.request.url) : null;
  const sourceMode = requestUrl?.searchParams?.get("source") === "investing" ? "investing" : "tradingview";

  async function safe(name, fn) {
    try { return await fn(); }
    catch (e) { errors.push(`${name}: ${e?.message || e}`); return null; }
  }

  const tvSymbols = [
    "FX_IDC:USDKRW", "FX:USDKRW",
    "FX_IDC:JPYKRW", "OANDA:JPYKRW", "FOREXCOM:JPYKRW", "FX:JPYKRW",
    "FX:USDJPY",
    "NYMEX:CL1!", "TVC:USOIL", "TVC:DXY",
    "KRX:KOSPI", "CBOE:VIX", "NASDAQ:IXIC", "SP:SPX", "TVC:US10Y"
  ];

  // One TradingView request supplies most dashboard indicators.
  const tvPromise = safe("TradingView", () => tradingViewQuotes(tvSymbols));

  // Keep Yahoo as a fallback for the two FX legs used to derive JPY/KRW.
  const yahooUsdPromise = safe("Yahoo USDKRW", () => yahoo("KRW=X"));
  const yahooJpyPromise = safe("Yahoo USDJPY", () => yahoo("JPY=X"));

  // Only fetch Investing pages when the user explicitly selected Investing priority.
  const investingPromise = sourceMode === "investing"
    ? Promise.all([
        safe("Investing USDKRW", () => investingQuote("usd-krw")),
        safe("Investing JPYKRW", () => investingQuote("jpy-krw")),
        safe("Investing USDJPY", () => investingQuote("usd-jpy"))
      ])
    : Promise.resolve([null, null, null]);

  const usdtPromise = safe("Upbit USDT", async () => {
    const r = await fetch("https://api.upbit.com/v1/ticker?markets=KRW-USDT");
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const data = await r.json();
    return makeMarketValue(data?.[0]?.trade_price, null, "Upbit");
  });

  const upbitBtcPromise = safe("Upbit BTC", async () => {
    const r = await fetch("https://api.upbit.com/v1/ticker?markets=KRW-BTC");
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const data = await r.json();
    return Number(data?.[0]?.trade_price) || null;
  });

  const binancePromise = safe("Binance BTC", async () => {
    const r = await fetch("https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT");
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const data = await r.json();
    return Number(data?.price) || null;
  });

  const [tvRaw, yahooUsdkrw, yahooUsdjpy, investingCore, usdt, upbit, binance] = await Promise.all([
    tvPromise, yahooUsdPromise, yahooJpyPromise, investingPromise,
    usdtPromise, upbitBtcPromise, binancePromise
  ]);
  const tv = tvRaw || {};
  const [investingUsdkrw, investingJpykrw, investingUsdjpy] = investingCore;

  const tvUsdkrw = firstMarketValue(tv["FX_IDC:USDKRW"], tv["FX:USDKRW"]);
  const tvUsdjpy = firstMarketValue(tv["FX:USDJPY"]);
  const tvJpyRaw = firstMarketValue(tv["FX_IDC:JPYKRW"], tv["OANDA:JPYKRW"], tv["FOREXCOM:JPYKRW"], tv["FX:JPYKRW"]);
  const tvJpykrw = tvJpyRaw?.price != null
    ? makeMarketValue(Number(tvJpyRaw.price) * 100, tvJpyRaw.changePct, `${tvJpyRaw.source} ×100`)
    : null;

  let usdkrw = sourceMode === "investing"
    ? firstMarketValue(investingUsdkrw, tvUsdkrw, yahooUsdkrw)
    : firstMarketValue(tvUsdkrw, yahooUsdkrw, investingUsdkrw);
  let usdjpy = sourceMode === "investing"
    ? firstMarketValue(investingUsdjpy, tvUsdjpy, yahooUsdjpy)
    : firstMarketValue(tvUsdjpy, yahooUsdjpy, investingUsdjpy);
  let jpykrw = sourceMode === "investing"
    ? firstMarketValue(investingJpykrw, tvJpykrw)
    : firstMarketValue(tvJpykrw, investingJpykrw);

  // Reliable fallback: 100 JPY/KRW = USD/KRW ÷ USD/JPY × 100.
  if (!jpykrw && usdkrw?.price && usdjpy?.price) {
    jpykrw = makeMarketValue(
      Number(usdkrw.price) / Number(usdjpy.price) * 100,
      null,
      `${usdkrw.source || "USDKRW"} ÷ ${usdjpy.source || "USDJPY"} ×100`
    );
  }

  const wti = firstMarketValue(tv["NYMEX:CL1!"], tv["TVC:USOIL"]);
  const dxy = firstMarketValue(tv["TVC:DXY"]);
  const kospi = firstMarketValue(tv["KRX:KOSPI"]);
  const vix = firstMarketValue(tv["CBOE:VIX"]);
  const nasdaq = firstMarketValue(tv["NASDAQ:IXIC"]);
  const sp500 = firstMarketValue(tv["SP:SPX"]);
  const us10y = firstMarketValue(tv["TVC:US10Y"]);

  let kimchi = null;
  if (upbit && binance && usdkrw?.price) {
    const globalKrw = binance * Number(usdkrw.price);
    const premium = (upbit - globalKrw) / globalKrw * 100;
    kimchi = { premium, diff: upbit - globalKrw, upbit, binance, usdkrw: Number(usdkrw.price), globalKrw };
  }

  return Response.json({
    success: Boolean(usdkrw || jpykrw || usdjpy || usdt),
    updatedAt: new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" }),
    sourceMode,
    source: sourceMode === "investing"
      ? "Investing priority + TradingView/Yahoo fallback + Upbit + Binance"
      : "TradingView priority + Yahoo fallback + Upbit + Binance",
    indicators: {
      usdkrw, jpykrw, usdjpy, usdt,
      wti, dxy, kospi, vix, nasdaq, sp500, us10y,
      kimchi
    },
    errors
  });
}


const MONEYMAX_VERSION = "16.8.11";

function jsonWithVersion(body, init = {}) {
  const headers = new Headers(init.headers || {});
  headers.set("content-type", "application/json; charset=UTF-8");
  headers.set("x-moneymax-version", MONEYMAX_VERSION);
  return new Response(JSON.stringify(body), { ...init, headers });
}

async function withVersion(response) {
  const headers = new Headers(response.headers);
  headers.set("x-moneymax-version", MONEYMAX_VERSION);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const context = {
      request,
      env,
      params: {},
      data: {},
      waitUntil: ctx.waitUntil.bind(ctx),
      passThroughOnException: ctx.passThroughOnException?.bind(ctx)
    };

    try {
      if (url.pathname === "/api/health") {
        return jsonWithVersion({
          success: true,
          version: MONEYMAX_VERSION,
          runtime: "cloudflare-worker",
          path: url.pathname
        });
      }

      if (url.pathname === "/api/rates") {
        return withVersion(await handleRatesGet(context));
      }

      if (url.pathname === "/api/markets") {
        return withVersion(await handleMarketsGet(context));
      }

      if (url.pathname.startsWith("/api/")) {
        return jsonWithVersion(
          { success: false, error: "API route not found", path: url.pathname },
          { status: 404 }
        );
      }

      // v16.8.5: run_worker_first=true, so ALL requests arrive here first.
      // Non-API requests are explicitly delegated to Static Assets.
      return env.ASSETS.fetch(request);
    } catch (error) {
      if (url.pathname.startsWith("/api/")) {
        return jsonWithVersion(
          {
            success: false,
            error: String(error?.message || error || "Unknown Worker error"),
            version: MONEYMAX_VERSION
          },
          { status: 500 }
        );
      }
      throw error;
    }
  }
};
