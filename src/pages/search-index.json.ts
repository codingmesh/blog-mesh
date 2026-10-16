import { formatLabel, getAllWriting, postUrl } from '../lib/content';

/** Publication-filtered fallback when full-text search cannot load. */
export async function GET() {
  return Response.json(
    (await getAllWriting()).map((post) => ({
      title: post.data.title,
      description: post.data.description,
      tags: post.data.tags,
      format: `${formatLabel(post)}s`,
      url: postUrl(post),
    })),
  );
}
