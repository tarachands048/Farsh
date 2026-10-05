import meeshoTile from '../../assets/meesho-tile.png';

/**
 * Brand lock-up: the Meesho app tile (cropped from the official Meesho DICE S3 template provided with the case)
 * with the Farsh product name. No Meesho mark is redrawn or altered.
 */
export function BrandMark({ sub }) {
  return (
    <div className="brand">
      <img src={meeshoTile} alt="Meesho" width="42" height="42" className="brand-tile" />
      <div className="brand-text">
        <div className="brand-word">Farsh <span className="brand-hi" lang="hi">फ़र्श</span></div>
        {sub && <div className="brand-sub">{sub}</div>}
      </div>
    </div>
  );
}
