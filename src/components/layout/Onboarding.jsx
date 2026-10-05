import { useEffect, useRef } from 'react';
import { FlaskConical } from 'lucide-react';
import { useLang } from '../../i18n/LanguageContext.jsx';
import { LanguageTiles } from './LanguagePicker.jsx';
import { BrandMark } from './Logo.jsx';

/** First visit: pick a language. Closes with Continue, Escape or a click outside; choice is remembered. */
export function Onboarding({ onClose }) {
  const { t, lang, setLang } = useLang();
  const box = useRef(null);
  useEffect(() => {
    box.current?.querySelector('button[aria-checked="true"]')?.focus();
    const esc = (e) => { if (e.key === 'Escape') { setLang(lang); onClose(); } };
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [onClose, lang, setLang]);
  const done = () => { setLang(lang); onClose(); };
  return (
    <div className="modal-scrim" onMouseDown={(e) => { if (e.target === e.currentTarget) done(); }}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="ob-title" ref={box} data-testid="onboarding">
        <div className="modal-stripe" aria-hidden />
        <BrandMark sub={t('brand.sub')} />
        <h2 id="ob-title" style={{ marginTop: 14 }}>{t('ob.title')} <span className="muted" lang="hi">· अपनी भाषा चुनें</span></h2>
        <p className="muted small" style={{ margin: '4px 0 14px' }}>{t('ob.sub')}</p>
        <LanguageTiles />
        <div className="row between wrap" style={{ marginTop: 18, gap: 12 }}>
          <span className="badge tone-grey"><FlaskConical size={13} aria-hidden />{t('ob.sim')}</span>
          <button type="button" className="btn primary lg" onClick={done} data-testid="ob-continue">{t('ob.continue')}</button>
        </div>
      </div>
    </div>
  );
}
