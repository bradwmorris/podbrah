import fs from "fs";
import { join } from "path";
import matter from "gray-matter";

export interface Post {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  content?: string;  // Added content as optional
  [key: string]: string | undefined;  // Modified to allow optional keys
}

// Assuming _posts is in the root directory, relative to process.cwd()
const postsDirectory = join(process.cwd(), "_posts");

export function getPostSlugs() {
  const slugs = fs.readdirSync(postsDirectory);
  console.log("Found slugs:", slugs);
  return slugs;
}

export function getPostBySlug(slug: string, fields: string[] = []): Post {
  const realSlug = slug.replace(/\.md$/, "");
  const fullPath = join(postsDirectory, `${realSlug}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  const items: Post = {
    slug: '',
    title: '',
    excerpt: '',
    date: '',
    content: '',
  };

  fields.forEach((field) => {
    if (field === "slug") {
      items[field] = realSlug;
    }
    if (field === "content") {
      items[field] = content;
    }
    if (typeof data[field] !== "undefined") {
      items[field] = data[field];
    }
  });

  console.log("Processed post:", items);
  return items;
}

export function getAllPosts(fields: string[] = []): Post[] {
  const slugs = getPostSlugs();
  const posts = slugs
    .map((slug) => getPostBySlug(slug, fields))
    .sort((post1, post2) => (post1.date > post2.date ? -1 : 1));
  console.log("All posts:", posts);
  return posts;
}
