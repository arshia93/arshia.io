/** Front board of the book: cloth binding with gold foil lettering. */
export function BookCover() {
  return (
    <div className="cover-art">
      <div className="cover-frame" aria-hidden />
      <div className="cover-content">
        <span className="cover-monogram foil" aria-hidden>
          A<span className="cover-monogram-amp">·</span>M
        </span>
        <p className="cover-title foil">
          Arshia
          <br />
          Moghaddam
        </p>
        <span className="cover-rule" aria-hidden />
        <p className="cover-subtitle foil">Product Builder</p>
      </div>
      <p className="cover-foot foil">arshia.io</p>
    </div>
  )
}

/** Inside of the front board: patterned endpaper with a bookplate. */
export function Endpaper() {
  return (
    <div className="endpaper">
      <div className="endpaper-pattern" aria-hidden />
      <div className="bookplate">
        <span className="bookplate-ex">Ex Libris</span>
        <span className="bookplate-rule" aria-hidden />
        <span className="bookplate-name">Arshia Moghaddam</span>
      </div>
    </div>
  )
}
