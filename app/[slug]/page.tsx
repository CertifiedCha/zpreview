import { notFound } from "next/navigation";
import { getBoard, getBoardSlugs } from "../../src/content";
import { PreviewClient } from "../../src/PreviewClient";
import { themes } from "../../src/theme";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const slugs = await getBoardSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  try {
    const board = await getBoard(slug);
    return {
      title: board.title,
      description: board.description,
    };
  } catch {
    return {
      title: "Lesson not found",
    };
  }
}

export default async function BoardPage({ params }: PageProps) {
  const { slug } = await params;

  try {
    const board = await getBoard(slug);
    return <PreviewClient board={board} theme={themes[board.themeId]} />;
  } catch {
    notFound();
  }
}
