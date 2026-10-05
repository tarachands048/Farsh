import { inr } from '../../lib/format.js';

/**
 * Mini market bar: the price range of similar products, the busy range (green), the seller's no-loss price
 * (red tick), her price (plum pin) and, optionally, the suggested price (green pin). Every mark is labelled.
 */
export function ZoneBar({ buckets, zone, floor, price, suggested, labels = true, t }) {
  const lo = buckets[0].lo - 10, hi = buckets[buckets.length - 1].lo + 45;
  const clamp = (v) => Math.max(lo, Math.min(hi, v));
  const x = (v) => `${((clamp(v) - lo) / (hi - lo)) * 100}%`;
  const desc = `${zone ? `Busy range ${zone.label}. ` : ''}No-loss price ${inr(floor)}.${price != null ? ` Price ${inr(price)}.` : ''}${suggested != null ? ` Suggested ${inr(suggested)}.` : ''}`;
  return (
    <div className={`zbar ${labels ? 'with-labels' : ''}`} role="img" aria-label={desc}>
      <div className="zb-track" />
      {zone && <div className="zb-zone" style={{ left: x(zone.lo), width: `calc(${x(zone.hi)} - ${x(zone.lo)})` }}>{labels && <span>{t ? t('s2.busy') : 'Busy range'}</span>}</div>}
      {floor != null && <div className="zb-floor" style={{ left: x(floor) }} title={`No-loss price ${inr(floor)}`}>{labels && <em>{inr(floor)}</em>}</div>}
      {price != null && <div className="zb-pin price" style={{ left: x(price) }} title={`Price ${inr(price)}`}>{labels && <em>{inr(price)}</em>}</div>}
      {suggested != null && suggested !== price && <div className="zb-pin sugg" style={{ left: x(suggested) }} title={`Suggested ${inr(suggested)}`}>{labels && <em>{inr(suggested)}</em>}</div>}
    </div>
  );
}

export function ZoneLegend({ t, showSuggested }) {
  return (
    <div className="zb-legend">
      <span><i className="lg-zone" />{t('s2.busy')}</span>
      <span><i className="lg-floor" />{t('term.floor')}</span>
      <span><i className="lg-price" />{t('term.yourPrice')}</span>
      {showSuggested && <span><i className="lg-sugg" />{t('s4.compare.suggested')}</span>}
    </div>
  );
}
