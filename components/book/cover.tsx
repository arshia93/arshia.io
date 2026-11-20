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
        <p className="cover-subtitle foil">
          A short bio
        </p>
      </div>
    </div>
  )
}

/** Inside of the front board: plain patterned endpaper. */
export function Endpaper() {
  return (
    <div className="endpaper">
      <div className="endpaper-pattern" aria-hidden />
    </div>
  )
}
