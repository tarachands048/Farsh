import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, ArrowRight } from 'lucide-react';
import { Card, Table, Button, StatusBadge, Badge } from '../components/ui/index.js';
import { NewProductForm } from '../components/product/NewProductForm.jsx';
import { ZoneBar, ZoneLegend } from '../components/seller/ZoneBar.jsx';
import { useProducts } from '../state/ProductsContext.jsx';
import { useT } from '../i18n/LanguageContext.jsx';
import { CATEGORIES } from '../data/categories.js';
import { inr, inrSigned } from '../lib/format.js';

const FILTERS = {
  all: () => true,
  attention: (p) => p.a.needsAttention,
  losing: (p) => p.a.status === 'below_floor' || p.a.status === 'skip',
  fewer: (p) => p.a.status === 'wont_rank' || p.a.status === 'above_zone',
  live: (p) => p.status === 'live',
  draft: (p) => p.status === 'draft',
};

export default function Products() {
  const { items, select, selectedId } = useProducts();
  const t = useT();
  const nav = useNavigate();
  const [params, setParams] = useSearchParams();
  const filter = FILTERS[params.get('filter')] ? params.get('filter') : 'all';
  const [creating, setCreating] = useState(false);
  useEffect(() => { if (params.get('new') === '1') setCreating(true); }, [params]);
  const rows = items.filter(FILTERS[filter]);
  const open = (p) => { select(p.id); nav('/price-coach'); };

  const columns = [
    { key: 'name', header: t('col.product'), render: (p) => <><div className="cell-title">{p.name}</div><div className="cell-sub">{CATEGORIES[p.categoryId].group} · <Badge tone={p.status === 'live' ? 'green' : 'grey'}>{t(p.status === 'live' ? 'prod.live' : 'prod.draft')}</Badge>
      <Badge tone={p.a.model.source === 'own' ? 'green' : 'amber'}>{p.a.model.source === 'own' ? t('data.own', { n: p.orders }) : t('data.est', { n: Math.min(30, p.orders) })}</Badge></div></> },
    { key: 'price', header: t('col.price'), align: 'right', render: (p) => <b className="num">{inr(p.a.price)}</b> },
    { key: 'floor', header: t('col.floor'), align: 'right', render: (p) => <span className="num">{inr(p.a.floor)}</span> },
    { key: 'e', header: t('col.profit'), align: 'right', render: (p) => <b className={`num ${p.a.contribution < 0 ? 'neg' : 'pos'}`}>{p.a.contribution == null ? '—' : inrSigned(p.a.contribution)}</b> },
    { key: 'band', header: t('col.market'), render: (p) => <div style={{ minWidth: 160 }}><div className="tiny" style={{ fontWeight: 700, color: 'var(--green)' }}>{p.a.zone?.label}</div><ZoneBar buckets={p.a.demand.buckets} zone={p.a.zone} floor={p.a.floor} price={p.a.price} labels={false} t={t} /></div> },
    { key: 'status', header: t('col.status'), render: (p) => <StatusBadge status={p.a.status} /> },
    { key: 'go', header: '', render: (p) => <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); open(p); }}>{t('prod.review')}<ArrowRight size={13} aria-hidden /></Button> },
  ];
  return (
    <>
      <div className="page-head">
        <div><h1>{t('prod.title')}</h1><p>{t('prod.sub')}</p></div>
        <Button icon={Plus} onClick={() => setCreating((v) => !v)} data-testid="new-product">{t('coach.new')}</Button>
      </div>
      <div className="stack">
        {creating && <NewProductForm onDone={() => setCreating(false)} />}
        <Card flush title={t('prod.title')} subtitle={t('prod.count', { n: rows.length, total: items.length })}
              action={<div className="chips" role="group" aria-label="Filter">{Object.keys(FILTERS).map((k) => <button key={k} className={`chip ${filter === k ? 'on' : ''}`} aria-pressed={filter === k} onClick={() => setParams(k === 'all' ? {} : { filter: k })} data-testid={`filter-${k}`}>{t(`f.${k}`)}</button>)}</div>}>
          <Table columns={columns} rows={rows} rowKey="id" selectedKey={selectedId} onRowClick={open} empty={t('dash.allGood')} />
          <div style={{ padding: '4px 18px 16px' }}><ZoneLegend t={t} /></div>
        </Card>
      </div>
    </>
  );
}
