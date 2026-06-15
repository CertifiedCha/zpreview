import Link from "next/link";
import { getBoards } from "../src/content";

export default async function HomePage() {
  const boards = await getBoards();

  return (
    <main className="preview-index">
      <section className="preview-index-inner">
        <p className="preview-eyebrow">Static lesson previews</p>
        <h1>Published boards</h1>
        <div className="preview-list">
          {boards.length ? (
            boards.map(({ slug, board }) => (
              <Link key={slug} href={`/${slug}`} className="preview-list-item">
                <span>
                  <strong>{board.title}</strong>
                  <small>{board.pages.length} page{board.pages.length === 1 ? "" : "s"}</small>
                </span>
                <span aria-hidden>Open</span>
              </Link>
            ))
          ) : (
            <p className="preview-empty">Add board JSON files to <code>content/boards</code>, then build again.</p>
          )}
        </div>
      </section>
    </main>
  );
}
