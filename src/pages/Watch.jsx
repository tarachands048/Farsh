import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCheck, PartyPopper } from 'lucide-react';
import { Card, Badge, Sparkline, Select } from '../components/ui/index.js';
import { SignalCard } from '../components/product/SignalCard.jsx';
import { useProducts } from '../state/ProductsContext.jsx';
import { useT, useLang } from '../i18n/LanguageContext.jsx';
import { LIFECYCLE } from '../data/activity.js';
import { WATCH_HISTORY } from '../data/watchHistory.js';
import { CATEGORIES } from '../data/categories.js';
import { allSignals, signalsFor, festiveCheck } from '../engine/watchAll.js';
import { effectiveInputs } from '../engine/model.js';
import { calculate } from '../engine/calculator.js';
import { blendedRto } from '../engine/floor.js';
import { inr, inrSigned, pct } from '../lib/format.js';

const last = (a) => a[a.length - 1];
const move = (a) => (last(a) - a[0]) / a[0];

export default function Watch() {
  const { selected: p, items, select } = useProducts();
  const t = useT();
  const { lang } = useLang();
  const nav = useNavigate();
  const cat = CATEGORIES[p.categoryId];
  const h = WATCH_HISTORY[p.id];
  const all = useMemo(() => allSignals(items), [items]);
  const mine = useMemo(() => signalsFor(p), [p]);
  const calc = useMemo(() => calculate({ ...effectiveInputs(p), price: p.listedPrice ?? undefined }), [p]);
  const fest = useMemo(() => festiveCheck(p), [p]);
  const catRto = blendedRto(cat.codShare, cat.rtoCod, cat.rtoPrepaid);
  const openCoach = (id) => { select(id); nav('/price-coach'); };
  const covTone = (d) => (d > 60 ? 'red' : d > 45 ? 'amber' : 'green');
  const top = mine[0];

  return (
    <>
      <div className="page-head"><div><h1>{t('watch.title')}</h1><p>{t('watch.sub')}</p></div></div>
      {lang !== 'en' && <p className="tiny muted" style={{ marginTop: -12, marginBottom: 12 }}>{t('watch.engineNote')}</p>}
      <div className="grid main-side">
        <section aria-labelledby="alerts-h" className="stack tight">
          <div><h2 id="alerts-h">{t('watch.alerts')}</h2><p className="small muted">{t('watch.alertsSub', { n: all.length })}</p></div>
          {all.length ? all.map((s) => <SignalCard key={s.key} signal={s} productName={s.productName} onOpenCoach={() => openCoach(s.productId)} />)
            : <Card><div className="banner tone-green">{t('watch.none')}</div></Card>}
        </section>

        <div className="stack">
          <Card title={t('watch.check')} subtitle={`${cat.group} · ${h ? '8 weeks · simulated' : t('watch.notLive')}`}>
            <Select label={t('coach.product')} value={p.id} onChange={(e) => select(e.target.value)} options={items.map((it) => ({ value: it.id, label: it.name }))} />
            {h ? (
              <div className="watch-grid" style={{ marginTop: 12 }}>
                <div className="watch-cell"><div className="k">{t('m.rank')}</div><div className="v">{p.rank ?? '—'}</div></div>
                <div className="watch-cell"><div className="k">{t('m.conv')}</div><div className="v" style={{ color: (p.conv ?? 0) >= 0 ? 'var(--green)' : 'var(--red)' }}>{(p.conv ?? 0) >= 0 ? '+' : '−'}{pct(Math.abs(p.conv ?? 0))}</div><Sparkline values={h.conversionPp} tone={(p.conv ?? 0) >= 0 ? 'green' : 'red'} width={110} /></div>
                <div className="watch-cell"><div className="k">{t('m.rto')}</div><div className="v">{pct(h.ownRto)}</div><div className="tiny muted">{t('watch.catAvg', { v: pct(catRto) })}</div></div>
                <div className="watch-cell"><div className="k">{t('m.returns')}</div><div className="v">{pct(h.ownReturns)}</div><div className="tiny muted">{t('watch.catAvg', { v: pct(cat.returnRate) })}</div></div>
                <div className="watch-cell"><div className="k">{t('m.rating')}</div><div className="v">{last(h.rating) != null ? `★ ${last(h.rating).toFixed(1)}` : '—'}</div><Sparkline values={h.rating} tone="plum" width={110} /></div>
                <div className="watch-cell"><div className="k">{t('m.stock')}</div><div className="v" style={{ color: `var(--${covTone(last(h.stockCover))})` }}>{Math.round(last(h.stockCover))}</div><Sparkline values={h.stockCover} tone={covTone(last(h.stockCover))} width={110} /></div>
                <div className="watch-cell"><div className="k">{t('m.median')}</div><div className="v">{inr(cat.band.median)}</div><div className="tiny muted">{move(h.groupMedian) >= 0 ? '+' : ''}{(move(h.groupMedian) * 100).toFixed(1)}% · 8 wk</div></div>
                <div className="watch-cell"><div className="k">{t('m.floor')}</div><div className="v">{inr(calc.floor)}</div><div className="tiny muted">{t('adv.yourPrice')} {inr(p.listedPrice)}</div></div>
              </div>
            ) : (
              <div className="banner tone-teal" style={{ marginTop: 12 }}>
                <span><b>{t('watch.forecast')}:</b> {LIFECYCLE[0].fires}. {LIFECYCLE[1].fires}.</span>
              </div>
            )}
          </Card>

          <Card title={t('watch.wa')}>
            <div className="wa" data-testid="wa-preview">
              <div className="wa-head"><span className="wa-dot" />Farsh · Meesho</div>
              <div className="wa-body">
                {top ? (
                  <div className="wa-bubble">
                    <b>{p.name}</b>
                    <p>⚠️ {top.title}</p>
                    <p>👉 {top.lever}</p>
                    <p className="wa-effect">💰 {top.effect}</p>
                    <div className="wa-btns"><span>{t('watch.openCoach')}</span></div>
                    <span className="wa-time">{t('watch.check')} <CheckCheck size={13} aria-hidden /></span>
                  </div>
                ) : (
                  <div className="wa-bubble"><p>✅ {p.name}: {t('watch.none')}</p><span className="wa-time"><CheckCheck size={13} aria-hidden /></span></div>
                )}
              </div>
            </div>
          </Card>

          {fest && fest.runs.length === 2 && (
            <Card title={<><PartyPopper size={16} aria-hidden /> {t('watch.festive')}</>} subtitle={t('watch.festiveSub')}>
              <p className="small" data-testid="festive">{t('watch.festiveBody', {
                lo: pct(fest.runs[0].level), hi: pct(fest.runs[1].level), f0: inr(fest.floorToday), f1: inr(fest.runs[0].floor), f2: inr(fest.runs[1].floor),
                price: inr(fest.price), p1: inrSigned(fest.runs[0].profit), p2: inrSigned(fest.runs[1].profit),
              })}</p>
              <div className="banner tone-green" style={{ marginTop: 8 }}>{t('watch.festiveFix')}</div>
              <p className="tiny muted" style={{ marginTop: 6 }}>{t('watch.festiveNote')}</p>
            </Card>
          )}
        </div>
      </div>

      <Card flush title={t('watch.stages')} subtitle={t('watch.stagesSub')} className="mt">
        <div className="table-wrap">
          <table className="tbl">
            <thead><tr><th>{t('st.stage')}</th><th>{t('st.watch')}</th><th>{t('st.fires')}</th><th>{t('st.leave')}</th></tr></thead>
            <tbody>{LIFECYCLE.map((r) => (
              <tr key={r.stage}><td><Badge tone="plum">{r.stage}</Badge><div className="cell-sub">{r.when}</div></td><td>{r.watch}</td><td><b>{r.fires}</b></td><td className="muted">{r.leave}</td></tr>
            ))}</tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
