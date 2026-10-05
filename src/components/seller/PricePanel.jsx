import { useState, useMemo } from 'react';
import { CheckCircle2, ChevronDown, ChevronUp, PencilLine, Sparkles, AlertTriangle, Check } from 'lucide-react';
import { assessPrice } from '../../engine/decision.js';
import { contributionAt } from '../../engine/calculator.js';
import { bucketFor, zonePosition, bucketLabel } from '../../engine/demand.js';
import { monthlyRange } from '../../engine/demand.js';
import { inr, inrSigned, inrRange, ordersRange } from '../../lib/format.js';

const round50 = (n) => Math.round(n / 50) * 50;

/** Money at one price with the given inputs. */
function scenario(coach, inputs, price) {
  if (price == null || !Number.isFinite(price)) return null;
  const profit = contributionAt(inputs, price), bk = bucketFor(price, coach.demand.buckets);
  const m = bk ? monthlyRange(profit, bk.orders) : null;
  return { price, profit, orders: bk?.orders ?? null, bucket: bk ? bucketLabel(bk) : null, monthly: m ? { lo: round50(m.lo), hi: round50(m.hi) } : null, position: zonePosition(price, coach.zone) };
}

/**
 * Step 4 — the price. Shows the suggestion and WHY, the before → after money, lets the seller use it or set her
 * own (the seller always decides), and a slider to try any price against orders and profit.
 */
export function PricePanel({ coach, advice, t, onUse, onApplyAll }) {
  const c = coach, ad = advice;
  const [why, setWhy] = useState(false);
  const [own, setOwn] = useState(false);
  const [ownText, setOwnText] = useState('');
  const target = ad.target ?? null;
  const needsFixes = ad.kind === 'fix_then' || ad.kind === 'fix_then_above';
  const sugg = target != null ? (needsFixes ? scenario(c, c.allFixed, target) : scenario(c, c.inputs, target)) : null;
  const suggNow = target != null ? scenario(c, c.inputs, target) : null;       // the same price, with only the fixes applied so far
  const now = c.price != null ? scenario(c, c.inputs, c.price) : null;
  const cheap = c.scenarios.cheapest;
  const inUse = target != null && c.price === target;
  const ownNum = ownText.trim() === '' ? null : Number(ownText);
  const ownOk = ownNum != null && Number.isFinite(ownNum) && ownNum > 0;
  const ownCheck = ownOk ? assessPrice(c.inputs, c.band, ownNum) : null;
  const ownScen = ownOk ? scenario(c, c.inputs, ownNum) : null;

  const Col = ({ s, label, tone, testid }) => (
    <div className={`cmp-col ${tone}`} data-testid={testid}>
      <div className="cmp-label">{label}</div>
      {s ? (
        <>
          <div className="cmp-price num">{inr(s.price)}</div>
          <dl>
            <div><dt>{t('s4.row.profit')}</dt><dd className={`num ${s.profit < 0 ? 'neg' : 'pos'}`}>{inrSigned(s.profit)}</dd></div>
            <div><dt>{t('s4.row.orders')}</dt><dd className="num">{ordersRange(s.orders)}</dd></div>
            <div><dt>{t('s4.row.month')}</dt><dd className={`num ${s.monthly && s.monthly.hi <= 0 ? 'neg' : ''}`}>{inrRange(s.monthly)}</dd></div>
          </dl>
          {s.position && <span className={`badge tone-${s.position === 'in_zone' ? 'green' : 'amber'}`}>{t(`s4.v.${s.position}`)}</span>}
        </>
      ) : <div className="muted small">{t('s1.noPrice')}</div>}
    </div>
  );

  return (
    <div className="price-panel">
      {/* the recommendation */}
      {ad.kind === 'keep' && (
        <div className="reco-hero ok" data-testid="reco-hero"><CheckCircle2 size={28} aria-hidden /><div><h3>{t('adv.keep')}</h3><p className="small">{t('s4.keepNote')}</p></div></div>
      )}
      {ad.kind === 'reconsider' && (
        <div className="reco-hero bad" data-testid="reco-hero"><AlertTriangle size={28} aria-hidden /><div><h3>{t('adv.reconsider')}</h3><p className="small">{t('adv.reconsider.body')}</p><p className="small muted">{t('s4.recon')}</p></div></div>
      )}
      {target != null && (
        <div className="reco-hero go" data-testid="reco-hero">
          <Sparkles size={26} aria-hidden />
          <div style={{ flex: 1 }}>
            <div className="tiny" style={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.04em' }}>{t('s4.compare.suggested')}</div>
            <div className="reco-price num" data-testid="reco-price">{ad.kind === 'fix_then_above' ? t('s4.list', { price: inr(target) }) : t('s4.try', { price: inr(target) })}</div>
            {sugg && <p className="reco-sub">{inrSigned(sugg.profit)} {t('term.perOrder')}{sugg.monthly ? ` · ${inrRange(sugg.monthly)} ${t('term.perMonth')}` : ''} <span className="tiny">({t('common.estimate')})</span></p>}
            {needsFixes && ad.pending.length > 0 && (
              <div className="reco-warn">
                <AlertTriangle size={15} aria-hidden />
                <span>{t('s4.unlock', { price: inr(target) })}. {suggNow && suggNow.profit < 0 ? t('s4.noFix', { price: inr(target), loss: inr(-suggNow.profit) }) : ''}</span>
                <button type="button" className="btn secondary sm" onClick={onApplyAll} data-testid="apply-all-2">{t('fix.applyAll')}</button>
              </div>
            )}
            {ad.kind === 'fix_then_above' && <p className="small" style={{ marginTop: 6 }}>{t('adv.fix_then_above.body', { price: inr(target) })}</p>}
          </div>
          <div className="reco-actions">
            <button type="button" className="btn primary" disabled={inUse} onClick={() => onUse(target)} data-testid="use-price">{inUse ? <><Check size={15} aria-hidden />{t('s4.inUse')}</> : t('s4.use', { price: inr(target) })}</button>
            <button type="button" className="btn secondary" onClick={() => { setOwn((v) => !v); if (!ownText) setOwnText(String(c.price ?? target)); }} aria-expanded={own} data-testid="set-own"><PencilLine size={15} aria-hidden />{t('s4.own')}</button>
          </div>
        </div>
      )}
      {target == null && ad.kind !== 'reconsider' && (
        <div className="row" style={{ marginTop: 10 }}>
          <button type="button" className="btn secondary" onClick={() => { setOwn((v) => !v); if (!ownText) setOwnText(String(c.price ?? '')); }} aria-expanded={own} data-testid="set-own"><PencilLine size={15} aria-hidden />{t('s4.own')}</button>
        </div>
      )}

      {own && (
        <div className="own" data-testid="own-panel">
          <div className="row wrap" style={{ gap: 8, alignItems: 'flex-end' }}>
            <label className="field grow"><span>{t('s4.ownLabel')}</span>
              <span className="input-wrap"><span className="affix">₹</span><input inputMode="decimal" value={ownText} onChange={(e) => setOwnText(e.target.value)} data-testid="own-input" /></span>
            </label>
            <button type="button" className="btn primary" disabled={!ownOk} onClick={() => onUse(Math.round(ownNum))} data-testid="use-own">{t('s4.ownUse')}</button>
          </div>
          {ownCheck && ownScen && (
            <div className={`banner tone-${ownCheck.level}`} style={{ marginTop: 8 }} data-testid="own-check">
              <span><b>{inrSigned(ownScen.profit)} {t('term.perOrder')}</b> · {ownScen.orders ? `${ordersRange(ownScen.orders)} ${t('term.ordersMonth')}` : t('s4.v.out')} · {ownScen.position ? t(`s4.v.${ownScen.position}`) : ''}</span>
            </div>
          )}
          <p className="tiny muted" style={{ marginTop: 6 }}>{t('s4.ownAlways')}</p>
        </div>
      )}

      {/* before → after */}
      {(now || sugg) && ad.kind !== 'keep' && (
        <div className="cmp" data-testid="compare">
          <Col s={now} label={t('s4.compare.now')} tone="now" testid="cmp-now" />
          {sugg && <Col s={sugg} label={`${t('s4.compare.suggested')}${needsFixes ? ' · ' + t('sheet.afterFixes') : ''}`} tone="sugg" testid="cmp-sugg" />}
          {cheap && <Col s={cheap} label={t('s4.compare.cheap')} tone="cheap" testid="cmp-cheap" />}
        </div>
      )}
      <p className="tiny muted" style={{ marginTop: 6 }}>{t('s4.monthNote')}</p>

      {/* why */}
      {target != null && (
        <div className="why-box">
          <button type="button" className="btn ghost sm" onClick={() => setWhy((v) => !v)} aria-expanded={why} data-testid="why-btn">
            {why ? <ChevronUp size={14} aria-hidden /> : <ChevronDown size={14} aria-hidden />}{why ? t('s4.whyHide') : t('s4.why', { price: inr(target) })} ⓘ
          </button>
          {why && (
            <div className="why-list" data-testid="why-panel">
              <p className="small" style={{ fontWeight: 700 }}>{t('s4.why.lead')}</p>
              <ul>
                <li>✓ {t('s4.why.1', { floor: inr(needsFixes ? c.best.floor : c.now.floor) })}</li>
                <li>✓ {t('s4.why.2', { n: c.demand.buckets.reduce((s, b) => s + b.listings, 0) })}</li>
                <li>✓ {t('s4.why.3', { zone: c.zone.label })}</li>
                <li>✓ {t('s4.why.4', { price: inr(c.price) })}</li>
                <li>✓ {t('s4.why.5', { target: inr(c.targetMargin) })}</li>
              </ul>
              <p className="small" style={{ marginTop: 6 }}><b>{t('s4.why.end', { price: inr(target), target: inr(c.targetMargin) })}</b></p>
            </div>
          )}
        </div>
      )}

      <PriceExplorer coach={c} t={t} start={target ?? c.price ?? Math.round(c.now.priceWithTargetMargin)} />
    </div>
  );
}

/** Slide any price: which price range it lands in, orders there, profit per order, money a month. */
function PriceExplorer({ coach, t, start }) {
  const c = coach;
  const min = c.demand.buckets[0].lo - 20, max = c.demand.buckets[c.demand.buckets.length - 1].lo + 60;
  const [p, setP] = useState(() => Math.max(min, Math.min(max, start)));
  const s = useMemo(() => scenario(c, c.inputs, p), [c, p]);
  const verdict = s.profit < 0 ? 'loss' : s.position ?? 'out';
  const tone = verdict === 'loss' ? 'red' : verdict === 'in_zone' ? 'green' : 'amber';
  const pct = (v) => `${((v - min) / (max - min)) * 100}%`;
  return (
    <div className="explorer" data-testid="explorer">
      <div className="row between wrap"><div><h3>{t('s4.explore')}</h3><p className="tiny muted">{t('s4.explore.sub')}</p></div>
        <span className={`badge big tone-${tone}`} data-testid="explorer-verdict">{t(`s4.v.${verdict}`)}</span></div>
      <div className="ex-track">
        {c.zone && <span className="ex-zone" style={{ left: pct(c.zone.lo), width: `calc(${pct(c.zone.hi)} - ${pct(c.zone.lo)})` }} />}
        <span className="ex-floor" style={{ left: pct(Math.max(min, Math.min(max, c.now.floor))) }} title={`${t('term.floor')} ${inr(c.now.floor)}`} />
        <input type="range" min={min} max={max} step={1} value={p} onChange={(e) => setP(Number(e.target.value))} aria-label={t('s4.explore')} data-testid="explorer-range" />
      </div>
      <div className="ex-read">
        <div><span className="tiny muted">{t('s4.row.price')}</span><b className="num">{inr(p)}</b></div>
        <div><span className="tiny muted">{t('s4.row.profit')}</span><b className={`num ${s.profit < 0 ? 'neg' : 'pos'}`}>{inrSigned(s.profit)}</b></div>
        <div><span className="tiny muted">{t('s4.row.orders')}</span><b className="num">{s.orders ? ordersRange(s.orders) : '—'}</b></div>
        <div><span className="tiny muted">{t('s4.row.month')}</span><b className={`num ${s.monthly && s.monthly.hi <= 0 ? 'neg' : ''}`}>{inrRange(s.monthly)}</b></div>
      </div>
    </div>
  );
}
