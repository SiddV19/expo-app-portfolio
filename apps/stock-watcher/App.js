// App.js — Expo / React Native stock app with Apple-style stock charts
// Deps: expo-constants, expo-updates, react-native-svg
// Start services/api-proxy for live data; configure EXPO_PUBLIC_API_BASE_URL for a physical phone.

import React, { useEffect, useMemo, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import Svg, {
  Path,
  Defs,
  LinearGradient,
  Stop,
  Circle,
} from 'react-native-svg';

// ---------- Config & Utils ----------
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:8787";

const hasIntl = typeof Intl !== 'undefined' && Intl.NumberFormat;

const fmtNum = (n, dp = 2) =>
  isFinite(n)
    ? hasIntl
      ? new Intl.NumberFormat('en-US', {
          maximumFractionDigits: dp,
        }).format(n)
      : Number(n).toFixed(dp)
    : '-';

const pct = (n) => (isFinite(n) ? `${n > 0 ? '+' : ''}${fmtNum(n)}%` : '-');

const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

const { width: SCREEN_W } = Dimensions.get('window');

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchJson(url, { tries = 2, backoff = 600 } = {}) {
  let lastErr;

  for (let i = 0; i < tries; i++) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 8000);

      const res = await fetch(url, { signal: ctrl.signal });

      clearTimeout(t);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      return await res.json();
    } catch (e) {
      lastErr = e;

      if (i < tries - 1) {
        await wait(backoff * (i + 1));
      }
    }
  }

  throw lastErr;
}

// ---------- Finnhub API ----------

async function fetchQuote(symbol) {

  const url = `${API_BASE_URL}/api/finnhub/quote?symbol=${encodeURIComponent(
    symbol
  )}`;

  const j = await fetchJson(url);

  if (j && typeof j.c === 'number') {
    return {
      price: j.c,
      change: j.d,
      changePct: j.dp,
      prevClose: j.pc,
      high: j.h,
      low: j.l,
    };
  }

  throw new Error('Invalid quote payload');
}

async function fetchCandles(symbol) {

  const now = Math.floor(Date.now() / 1000);
  const twoYears = 60 * 60 * 24 * 365 * 2;
  const from = now - twoYears;

  const url = `${API_BASE_URL}/api/finnhub/stock/candle?symbol=${encodeURIComponent(
    symbol
  )}&resolution=D&from=${from}&to=${now}`;

  const j = await fetchJson(url);

  if (j?.s !== 'ok' || !Array.isArray(j?.t)) {
    throw new Error('No candle data');
  }

  return j.t.map((t, i) => ({
    date: new Date(t * 1000).toISOString().slice(0, 10),
    open: Number(j.o[i]),
    high: Number(j.h[i]),
    low: Number(j.l[i]),
    close: Number(j.c[i]),
    volume: Number(j.v[i]),
  }));
}

async function fetchMetrics(symbol) {

  const url = `${API_BASE_URL}/api/finnhub/stock/metric?symbol=${encodeURIComponent(
    symbol
  )}&metric=all`;

  const j = await fetchJson(url, { tries: 1 });

  const m = j?.metric || {};

  const marketCap = m.marketCapitalization
    ? Number(m.marketCapitalization) * 1e9
    : null;

  const pe = isFinite(m.peExclExtraTTM)
    ? Number(m.peExclExtraTTM)
    : isFinite(m.peTTM)
    ? Number(m.peTTM)
    : null;

  return { marketCap, pe };
}

// ---------- Hooks ----------
function useQuoteBundle(symbol) {
  const [state, setState] = useState({
    loading: true,
    error: null,
    data: null,
  });

  useEffect(() => {
    let on = true;

    setState({
      loading: true,
      error: null,
      data: null,
    });

    async function load() {
      try {
        const [q, metrics] = await Promise.allSettled([
          fetchQuote(symbol),
          fetchMetrics(symbol),
        ]);

        const quote = q.status === 'fulfilled' ? q.value : null;

        const met =
          metrics.status === 'fulfilled'
            ? metrics.value
            : { marketCap: null, pe: null };

        if (on) {
          if (!quote) throw new Error('Quote unavailable');

          setState({
            loading: false,
            error: null,
            data: {
              symbol,
              ...quote,
              ...met,
            },
          });
        }
      } catch (e) {
        console.warn('useQuoteBundle:', e?.message || e);

        if (on) {
          setState({
            loading: false,
            error: e?.message || 'Failed to load',
            data: null,
          });
        }
      }
    }

    load();

    return () => {
      on = false;
    };
  }, [symbol]);

  return state;
}

function useCandles(symbol) {
  const [state, setState] = useState({
    loading: true,
    error: null,
    data: [],
  });

  useEffect(() => {
    let on = true;

    setState({
      loading: true,
      error: null,
      data: [],
    });

    async function load() {
      try {
        const c = await fetchCandles(symbol);

        if (on) {
          setState({
            loading: false,
            error: null,
            data: c,
          });
        }
      } catch (e) {
        console.warn('useCandles:', e?.message || e);

        if (on) {
          const base = 100 + Math.random() * 30;

          const mock = Array.from({ length: 504 }).map((_, i) => ({
            date: new Date(Date.now() - (504 - i) * 86400000)
              .toISOString()
              .slice(0, 10),
            open: base + Math.sin(i / 12) * 5 + i * 0.03,
            high: base + Math.sin(i / 12) * 5 + i * 0.03 + 1,
            low: base + Math.sin(i / 12) * 5 + i * 0.03 - 1,
            close: base + Math.sin(i / 12) * 5 + i * 0.03 + Math.random(),
            volume: 500000 + Math.random() * 500000,
          }));

          setState({
            loading: false,
            error: e?.message || 'Failed to load',
            data: mock,
          });
        }
      }
    }

    load();

    return () => {
      on = false;
    };
  }, [symbol]);

  return state;
}

// ---------- Apple-Style Stock Chart ----------
const CHART_RANGES = [
  { label: '1M', points: 22 },
  { label: '3M', points: 66 },
  { label: '6M', points: 132 },
  { label: '1Y', points: 252 },
  { label: '2Y', points: 504 },
];

function buildSmoothPath(points) {
  if (!points || points.length === 0) return '';

  if (points.length === 1) {
    return `M ${points[0].x} ${points[0].y}`;
  }

  const d = [`M ${points[0].x} ${points[0].y}`];

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d.push(
      `C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(
        2
      )} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`
    );
  }

  return d.join(' ');
}

function AppleStockChart({
  candles = [],
  values = null,
  width = SCREEN_W - 56,
  height = 220,
  showRanges = true,
  selectedRange = '1Y',
  onRangeChange = () => {},
}) {
  const gradientId = useMemo(
    () => `stockGradient_${Math.random().toString(36).slice(2)}`,
    []
  );

  const rawValues = useMemo(() => {
    if (values && values.length > 0) {
      return values.map(Number).filter((v) => isFinite(v));
    }

    return candles.map((c) => Number(c.close)).filter((v) => isFinite(v));
  }, [values, candles]);

  const visibleValues = useMemo(() => {
    const range = CHART_RANGES.find((r) => r.label === selectedRange);

    if (!range || rawValues.length <= range.points) {
      return rawValues;
    }

    return rawValues.slice(-range.points);
  }, [rawValues, selectedRange]);

  if (!visibleValues || visibleValues.length < 2) {
    return (
      <View style={[styles.appleChartBox, { width, height }]}>
        <Text style={styles.muted}>Not enough chart data yet.</Text>
      </View>
    );
  }

  const chartHeight = showRanges ? height - 42 : height;
  const topPad = 12;
  const bottomPad = 18;

  const minRaw = Math.min(...visibleValues);
  const maxRaw = Math.max(...visibleValues);

  const padding = (maxRaw - minRaw || 1) * 0.12;

  const min = minRaw - padding;
  const max = maxRaw + padding;
  const range = max - min || 1;

  const points = visibleValues.map((v, i) => {
    const x = (i / (visibleValues.length - 1)) * width;

    const y = topPad + ((max - v) / range) * (chartHeight - topPad - bottomPad);

    return {
      x: Number(x.toFixed(2)),
      y: Number(clamp(y, 0, chartHeight).toFixed(2)),
    };
  });

  const firstValue = visibleValues[0];
  const lastValue = visibleValues[visibleValues.length - 1];

  const chartUp = lastValue >= firstValue;
  const chartColor = chartUp ? '#34C759' : '#FF3B30';

  const linePath = buildSmoothPath(points);
  const bottomY = chartHeight - 4;

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${bottomY} L ${
    points[0].x
  } ${bottomY} Z`;

  const lastPoint = points[points.length - 1];

  return (
    <View style={[styles.appleChartBox, { width, height }]}>
      <Svg width={width} height={chartHeight}>
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={chartColor} stopOpacity="0.25" />
            <Stop offset="1" stopColor={chartColor} stopOpacity="0" />
          </LinearGradient>
        </Defs>

        <Path d={areaPath} fill={`url(#${gradientId})`} />

        <Path
          d={linePath}
          fill="none"
          stroke={chartColor}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <Circle cx={lastPoint.x} cy={lastPoint.y} r={4} fill={chartColor} />
      </Svg>

      {showRanges && (
        <View style={styles.rangeRow}>
          {CHART_RANGES.map((r) => {
            const active = selectedRange === r.label;

            return (
              <TouchableOpacity
                key={r.label}
                onPress={() => onRangeChange(r.label)}
                style={[styles.rangeChip, active && styles.rangeChipActive]}>
                <Text
                  style={[styles.rangeText, active && styles.rangeTextActive]}>
                  {r.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

// ---------- UI Bits ----------
const Section = ({ title, right, children }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <Text style={styles.cardTitle}>{title}</Text>
      {right}
    </View>
    {children}
  </View>
);

const Button = ({ label, onPress, variant = 'solid', small }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[
      styles.btn,
      variant === 'outline' ? styles.btnOutline : styles.btnSolid,
      small && styles.btnSmall,
    ]}>
    <Text
      style={[
        styles.btnText,
        variant === 'outline' && styles.btnTextOutline,
        small && styles.btnTextSmall,
      ]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const VStack = ({ children, space = 8 }) => (
  <View>
    {React.Children.map(children, (c, i) => (
      <View style={{ marginTop: i ? space : 0 }}>{c}</View>
    ))}
  </View>
);

const HStack = ({ children, space = 12, style }) => (
  <View style={[{ flexDirection: 'row', flexWrap: 'wrap' }, style]}>
    {React.Children.map(children, (c, i) => (
      <View style={{ marginLeft: i ? space : 0 }}>{c}</View>
    ))}
  </View>
);

// ---------- Mock Headlines ----------
const MOCK_NEWS = [
  {
    id: 1,
    headline: 'Tech megacaps lead market rebound as earnings season wanes',
    source: 'MarketBeat',
    time: '2h ago',
  },
  {
    id: 2,
    headline: 'Semiconductor outlook brightens on AI server demand surge',
    source: 'The Street',
    time: '5h ago',
  },
  {
    id: 3,
    headline: 'Investors eye CPI print next week as rates remain in focus',
    source: 'Bloomberg',
    time: 'Today',
  },
];

// ---------- Screens ----------
function Dashboard({ symbols, pickSymbol }) {
  const symbolsKey = useMemo(() => symbols.join(','), [symbols]);

  const chartData = useMemo(
    () =>
      Array.from({ length: 90 }).map(
        (_, i) => 10000 + Math.sin(i / 8) * 250 + i * 18 + Math.random() * 40
      ),
    [symbolsKey]
  );

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Section title="Account Value">
        <Text style={styles.bigNumber}>$12,584.22</Text>
        <Text style={styles.positive}>+142.18 (+1.14%) Today</Text>

        <View style={{ marginTop: 8, alignItems: 'center' }}>
          <AppleStockChart values={chartData} height={160} showRanges={false} />
        </View>
      </Section>

      <HStack space={16} style={{ marginBottom: 16 }}>
        <View style={[styles.card, { flex: 1 }]}>
          <Text style={styles.cardTitle}>Allocation</Text>

          <VStack space={6}>
            {symbols.map((s) => (
              <View key={s} style={styles.rowBetween}>
                <TouchableOpacity onPress={() => pickSymbol(s)}>
                  <Text style={styles.sym}>{s}</Text>
                </TouchableOpacity>

                <Text style={styles.muted}>
                  {fmtNum(100 / Math.max(1, symbols.length))}%
                </Text>
              </View>
            ))}
          </VStack>
        </View>

        <View style={[styles.card, { flex: 1 }]}>
          <Text style={styles.cardTitle}>Hot List</Text>

          <HStack space={8}>
            {['AAPL', 'NVDA', 'TSLA', 'AMZN'].map((s) => (
              <HotChip key={s} symbol={s} onPress={() => pickSymbol(s)} />
            ))}
          </HStack>
        </View>
      </HStack>

      <Section
        title="Headlines"
        right={
          <Button small variant="outline" label="See all" onPress={() => {}} />
        }>
        <VStack space={10}>
          {MOCK_NEWS.map((n) => (
            <View key={n.id} style={styles.newsCard}>
              <Text style={styles.newsTitle}>{n.headline}</Text>
              <Text style={styles.muted}>
                {n.source} • {n.time}
              </Text>
            </View>
          ))}
        </VStack>
      </Section>
    </ScrollView>
  );
}

function HotChip({ symbol, onPress }) {
  const { data: q, loading } = useQuoteBundle(symbol);
  const up = (q?.changePct ?? 0) >= 0;

  return (
    <TouchableOpacity onPress={onPress} style={styles.hotChip}>
      <Text style={styles.sym}>{symbol}</Text>

      {loading ? (
        <ActivityIndicator size="small" />
      ) : (
        <>
          <Text style={[styles.muted, up ? styles.positive : styles.negative]}>
            {q ? pct(q.changePct) : '-'}
          </Text>
          <Text style={styles.muted}>{q ? `$${fmtNum(q.price)}` : '-'}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

function Watchlist({ symbols, onPick, onRemove }) {
  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Section title="Watchlist">
        {symbols.length === 0 && (
          <Text style={styles.muted}>No symbols yet. Add one above.</Text>
        )}

        <VStack space={6}>
          {symbols.map((s) => (
            <WatchRow
              key={s}
              symbol={s}
              onPick={() => onPick(s)}
              onRemove={() => onRemove(s)}
            />
          ))}
        </VStack>
      </Section>
    </ScrollView>
  );
}

function WatchRow({ symbol, onPick, onRemove }) {
  const { data: q, loading } = useQuoteBundle(symbol);
  const up = (q?.changePct ?? 0) >= 0;

  return (
    <View style={styles.rowBetween}>
      <TouchableOpacity onPress={onPick}>
        <Text style={styles.sym}>{symbol}</Text>

        {loading ? (
          <ActivityIndicator size="small" />
        ) : (
          <Text style={styles.muted}>
            {q?.marketCap != null ? `MC ${fmtNum(q.marketCap / 1e9)}B` : 'MC —'}
            {q?.pe != null ? ` • P/E ${fmtNum(q.pe)}` : ' • P/E —'}
          </Text>
        )}
      </TouchableOpacity>

      <View style={{ alignItems: 'flex-end' }}>
        <Text style={styles.bold}>
          {loading ? '…' : q ? `$${fmtNum(q.price)}` : '-'}
        </Text>

        <Text style={[styles.muted, up ? styles.positive : styles.negative]}>
          {loading ? '…' : q ? pct(q.changePct) : '-'}
        </Text>
      </View>

      <Button label="−" variant="outline" small onPress={onRemove} />
    </View>
  );
}

function StockDetail({ symbol, toggleWatch, watched }) {
  const [range, setRange] = useState('1Y');

  const qState = useQuoteBundle(symbol);
  const cState = useCandles(symbol);

  const q = qState.data;
  const up = (q?.change ?? 0) >= 0;

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Section
        title={`${symbol} • ${
          q ? `$${fmtNum(q.price)}` : qState.loading ? '…' : '—'
        }`}
        right={
          <Button
            label={watched ? 'Watching' : 'Watch'}
            variant={watched ? 'outline' : 'solid'}
            onPress={toggleWatch}
          />
        }>
        {qState.loading ? (
          <ActivityIndicator />
        ) : q ? (
          <Text style={[styles.sub, up ? styles.positive : styles.negative]}>
            {(q.change > 0 ? '+' : '') + fmtNum(q.change)} ({pct(q.changePct)})
          </Text>
        ) : (
          <Text style={[styles.sub, styles.negative]}>
            Failed to load quote
          </Text>
        )}

        <View style={{ marginTop: 8, alignItems: 'center' }}>
          {cState.loading ? (
            <ActivityIndicator size="large" />
          ) : (
            <AppleStockChart
              candles={cState.data}
              height={230}
              selectedRange={range}
              onRangeChange={setRange}
              showRanges={true}
            />
          )}
        </View>
      </Section>

      <HStack space={16} style={{ marginBottom: 16 }}>
        <View style={[styles.card, { flex: 1 }]}>
          <Text style={styles.cardTitle}>Key Stats</Text>

          {qState.loading ? (
            <ActivityIndicator />
          ) : q ? (
            <VStack space={6}>
              <Row
                label="Market Cap"
                value={
                  q?.marketCap != null ? `$${fmtNum(q.marketCap / 1e9)}B` : '—'
                }
              />
              <Row label="P/E" value={q?.pe != null ? fmtNum(q.pe) : '—'} />
              <Row
                label="Day Change"
                value={`${(q.change > 0 ? '+' : '') + fmtNum(q.change)} (${pct(
                  q.changePct
                )})`}
              />
              <Row
                label="Prev Close"
                value={q?.prevClose != null ? `$${fmtNum(q.prevClose)}` : '—'}
              />
              <Row
                label="Day Range"
                value={
                  q?.low != null
                    ? `$${fmtNum(q.low)} - $${fmtNum(q.high)}`
                    : '—'
                }
              />
            </VStack>
          ) : (
            <Text style={styles.muted}>Unable to load.</Text>
          )}
        </View>

        <View style={[styles.card, { flex: 1 }]}>
          <Text style={styles.cardTitle}>About</Text>
          <Text style={[styles.muted, { marginTop: 6 }]}>
            {symbol} designs, develops, and sells technology products and
            services. Replace this placeholder with a company profile API later.
          </Text>
        </View>
      </HStack>

      <Section title="Recent Headlines">
        <VStack space={10}>
          {MOCK_NEWS.map((n) => (
            <View key={n.id} style={styles.newsCard}>
              <Text style={styles.newsTitle}>{n.headline}</Text>
              <Text style={styles.muted}>
                {n.source} • {n.time}
              </Text>
            </View>
          ))}
        </VStack>
      </Section>
    </ScrollView>
  );
}

const Row = ({ label, value }) => (
  <View style={styles.rowBetween}>
    <Text style={styles.muted}>{label}</Text>
    <Text style={styles.bold}>{value}</Text>
  </View>
);

function Screener({ onPick }) {
  const rows = [
    { symbol: 'AAPL', pe: 31.2, mcap: 3450, score: 87 },
    { symbol: 'NVDA', pe: 45.1, mcap: 3100, score: 91 },
    { symbol: 'MSFT', pe: 34.5, mcap: 3350, score: 85 },
    { symbol: 'TSLA', pe: 61.7, mcap: 760, score: 72 },
  ];

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Section title="Quick Screener">
        <VStack space={8}>
          {rows.map((r) => (
            <View key={r.symbol} style={[styles.rowBetween, styles.listRow]}>
              <Text style={styles.sym}>{r.symbol}</Text>
              <Text style={styles.muted}>P/E {r.pe}</Text>
              <Text style={styles.muted}>{r.mcap}B</Text>
              <Text style={styles.bold}>{r.score}</Text>
              <Button label="View" small onPress={() => onPick(r.symbol)} />
            </View>
          ))}
        </VStack>
      </Section>
    </ScrollView>
  );
}

function News() {
  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Section title="Market News">
        <VStack space={10}>
          {MOCK_NEWS.map((n) => (
            <View key={n.id} style={styles.newsCard}>
              <Text style={styles.newsTitle}>{n.headline}</Text>
              <Text style={styles.muted}>
                {n.source} • {n.time}
              </Text>
              <Text style={[styles.muted, { marginTop: 4 }]}>
                Placeholder summary. Wire this to your news API.
              </Text>
            </View>
          ))}
        </VStack>
      </Section>
    </ScrollView>
  );
}

function SettingsScreen() {
  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Section title="Appearance">
        <Text style={styles.muted}>Dark mode coming soon.</Text>
      </Section>

      <Section title="Data Providers">
        <Text style={styles.muted}>
          Uses Finnhub for live quotes, candles, and metrics. Add your key in
          app.json → expo.extra.
        </Text>
      </Section>
    </ScrollView>
  );
}

// ---------- Root ----------
export default function App() {
  const [route, setRoute] = useState('dashboard');
  const [symbols, setSymbols] = useState(['AAPL', 'MSFT', 'NVDA']);
  const [active, setActive] = useState('AAPL');
  const [search, setSearch] = useState('');

  const isWatched = symbols.includes(active);

  function addSymbol(sym) {
    const clean = (sym || '')
      .toUpperCase()
      .replace(/[^A-Z]/g, '')
      .slice(0, 6);

    if (!clean) return;

    setSymbols((prev) => (prev.includes(clean) ? prev : [clean, ...prev]));
    setActive(clean);
    setRoute('stock');
    setSearch('');
  }

  function removeSymbol(sym) {
    setSymbols((prev) => prev.filter((s) => s !== sym));

    if (active === sym) {
      setActive(symbols[0] || 'AAPL');
    }
  }

  function pickSymbol(sym) {
    setActive(sym);
    setRoute('stock');
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 4 }}
          style={{ marginBottom: 8 }}>
          <HstackTabs route={route} setRoute={setRoute} />
        </ScrollView>

        <HStack space={8} style={{ alignItems: 'center' }}>
          <TextInput
            value={search}
            onChangeText={(t) => setSearch((t || '').toUpperCase())}
            placeholder="Add symbol, e.g. AAPL"
            placeholderTextColor="#9CA3AF"
            style={styles.input}
            autoCapitalize="characters"
          />

          <Button label="Add" onPress={() => addSymbol(search.trim())} />
        </HStack>
      </View>

      {route === 'dashboard' && (
        <Dashboard symbols={symbols} pickSymbol={pickSymbol} />
      )}

      {route === 'watchlist' && (
        <Watchlist
          symbols={symbols}
          onPick={pickSymbol}
          onRemove={removeSymbol}
        />
      )}

      {route === 'screener' && <Screener onPick={pickSymbol} />}

      {route === 'news' && <News />}

      {route === 'settings' && <SettingsScreen />}

      {route === 'stock' && (
        <StockDetail
          symbol={active}
          watched={isWatched}
          toggleWatch={() => {
            if (isWatched) {
              removeSymbol(active);
            } else {
              addSymbol(active);
            }
          }}
        />
      )}

      <View style={styles.footer}>
        <Text style={styles.muted}>
          Live data via Finnhub • Apple-style charts
        </Text>
      </View>
    </SafeAreaView>
  );
}

function HstackTabs({ route, setRoute }) {
  return (
    <HStack space={8}>
      {['dashboard', 'watchlist', 'screener', 'news', 'settings'].map((r) => (
        <TouchableOpacity
          key={r}
          onPress={() => setRoute(r)}
          style={[styles.tab, route === r && styles.tabActive]}>
          <Text style={[styles.tabText, route === r && styles.tabTextActive]}>
            {r[0].toUpperCase() + r.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}

      {route === 'stock' && (
        <TouchableOpacity
          onPress={() => setRoute('dashboard')}
          style={[styles.tab, styles.tabActive]}>
          <Text style={[styles.tabText, styles.tabTextActive]}>← Back</Text>
        </TouchableOpacity>
      )}
    </HStack>
  );
}

// ---------- Styles ----------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  topBar: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },

  tab: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    marginRight: 0,
  },

  tabActive: {
    backgroundColor: '#111827',
  },

  tabText: {
    fontSize: 12,
    color: '#111827',
    fontWeight: '600',
  },

  tabTextActive: {
    color: '#FFFFFF',
  },

  input: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    color: '#111827',
    fontSize: 14,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },

  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },

  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  listRow: {
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 10,
  },

  bold: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },

  sym: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },

  sub: {
    fontSize: 14,
    marginTop: 4,
  },

  bigNumber: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
  },

  muted: {
    color: '#6B7280',
  },

  positive: {
    color: '#16A34A',
    fontWeight: '700',
  },

  negative: {
    color: '#DC2626',
    fontWeight: '700',
  },

  btn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },

  btnSolid: {
    backgroundColor: '#111827',
  },

  btnOutline: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  btnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },

  btnTextOutline: {
    color: '#111827',
  },

  btnSmall: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },

  btnTextSmall: {
    fontSize: 12,
    fontWeight: '700',
  },

  hotChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    minWidth: (SCREEN_W - 32 - 8) / 2 - 6,
    marginBottom: 8,
  },

  newsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  newsTitle: {
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },

  footer: {
    alignItems: 'center',
    padding: 12,
  },

  appleChartBox: {
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  rangeRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 999,
    padding: 4,
  },

  rangeChip: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: 999,
  },

  rangeChipActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  rangeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
  },

  rangeTextActive: {
    color: '#111827',
  },
});
