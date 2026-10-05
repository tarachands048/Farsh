import { useState } from 'react';
import { ChevronUp, Eye, HelpCircle, Wrench, IndianRupee, ArrowRight } from 'lucide-react';
import { Badge } from '../ui/Badge.jsx';
import { useT } from '../../i18n/LanguageContext.jsx';

/** One Farsh Watch alert: what we noticed → likely reason → one thing to do → what it's worth. Never "cut your price". */
export function SignalCard({ signal, productName, onOpenCoach }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  return (
    <article className="signal" data-testid={`signal-${signal.key ?? signal.id}`}>
      <header className="row between top">
        <div>{productName && <div className="tiny muted" style={{ fontWeight: 700 }}>{productName}</div>}<h3>{signal.title}</h3></div>
        <Badge tone="plum">{signal.stage}</Badge>
      </header>
      <dl className="signal-rows">
        <div><dt><Eye size={14} aria-hidden />{t('watch.reason')}</dt><dd>{signal.cause}</dd></div>
        <div className="do"><dt><Wrench size={14} aria-hidden />{t('watch.do')}</dt><dd>{signal.lever}</dd></div>
        <div className="effect"><dt><IndianRupee size={14} aria-hidden />{t('watch.worth')}</dt><dd>{signal.effect}</dd></div>
      </dl>
      <div className="row between wrap" style={{ marginTop: 8, gap: 8 }}>
        <button type="button" className="btn ghost sm" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
          {open ? <ChevronUp size={14} aria-hidden /> : <HelpCircle size={14} aria-hidden />}{open ? t('watch.hideWhy') : t('watch.whyTrig')}
        </button>
        {onOpenCoach && <button type="button" className="btn secondary sm" onClick={onOpenCoach}>{t('watch.openCoach')}<ArrowRight size={13} aria-hidden /></button>}
      </div>
      {open && (
        <div className="banner tone-amber" style={{ marginTop: 8, flexDirection: 'column' }} data-testid={`why-${signal.key ?? signal.id}`}>
          <span>{signal.why}</span>
          {signal.ladder && (
            <table className="tbl compact" style={{ marginTop: 6 }}>
              <thead><tr><th>Step</th><th className="r">Price</th><th className="r">Profit / order</th></tr></thead>
              <tbody>{signal.ladder.map((r, i) => <tr key={i}><td>{i === 0 ? 'Now' : i === signal.ladder.length - 1 ? 'No-loss price' : `Step ${i}`}</td><td className="r num">₹{r.price}</td><td className="r num">₹{r.contribution.toFixed(0)}</td></tr>)}</tbody>
            </table>
          )}
        </div>
      )}
    </article>
  );
}
