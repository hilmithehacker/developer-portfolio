import fs from 'fs';
import path from 'path';

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
  author: string;
  contentHtml: string;
}

// Lokasi penyimpanan file blog markdown
const blogDirectory = path.join(process.cwd(), 'src/content/blog');

// Fungsi parse frontmatter sederhana
function parseFrontmatter(markdownContent: string) {
  const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---/;
  const match = markdownContent.match(frontmatterRegex);
  
  const metadata: Record<string, any> = {
    title: 'Untitled Post',
    date: '2026-01-01',
    excerpt: '',
    tags: [],
    author: 'Hilmi Abdurrahman'
  };

  let content = markdownContent;

  if (match) {
    const frontmatterBlock = match[1];
    content = markdownContent.replace(match[0], '').trim();

    // Pisahkan baris per baris
    const lines = frontmatterBlock.split('\n');
    for (const line of lines) {
      const parts = line.split(':');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join(':').trim().replace(/^['"]|['"]$/g, ''); // bersihkan tanda petik
        
        if (key === 'tags') {
          // Parse tag array: ["A", "B"]
          try {
            metadata[key] = JSON.parse(value);
          } catch {
            metadata[key] = value.split(',').map(t => t.trim());
          }
        } else {
          metadata[key] = value;
        }
      }
    }
  }

  return { metadata, content };
}

// Fungsi konversi sintaks Markdown dasar ke HTML murni (tanpa dependencies eksternal)
function renderMarkdownToHtml(markdownText: string): string {
  let html = '';
  const lines = markdownText.split('\n');
  let inList = false;

  for (let line of lines) {
    line = line.trim();

    // Lewati baris kosong
    if (line === '') {
      if (inList) {
        html += '</ul>\n';
        inList = false;
      }
      continue;
    }

    // Ubah format tulisan tebal **teks** menjadi <strong>teks</strong>
    line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Ubah format kode inline `code` menjadi <code>code</code>
    line = line.replace(/`(.*?)`/g, '<code class="bg-blueprint-panel border border-white/10 px-1 py-0.5 rounded text-cyber-cyan text-xs font-mono">$1</code>');

    // Judul Heading 1 (# Judul)
    if (line.startsWith('# ')) {
      if (inList) { html += '</ul>\n'; inList = false; }
      html += `<h1 class="font-display font-bold text-2xl md:text-3xl text-white mt-6 mb-4">${line.slice(2)}</h1>\n`;
    }
    // Judul Heading 2 (## Subjudul)
    else if (line.startsWith('## ')) {
      if (inList) { html += '</ul>\n'; inList = false; }
      html += `<h2 class="font-display font-bold text-xl md:text-2xl text-cyber-cyan mt-6 mb-3 border-b border-white/5 pb-1">${line.slice(3)}</h2>\n`;
    }
    // Judul Heading 3 (### Subjudul Kecil)
    else if (line.startsWith('### ')) {
      if (inList) { html += '</ul>\n'; inList = false; }
      html += `<h3 class="font-display font-bold text-lg text-white mt-4 mb-2">${line.slice(4)}</h3>\n`;
    }
    // List item (- Item) atau (* Item)
    else if (line.startsWith('- ') || line.startsWith('* ')) {
      if (!inList) {
        html += '<ul class="list-disc pl-5 my-3 flex flex-col gap-1 text-slate-350">\n';
        inList = true;
      }
      html += `<li>${line.slice(2)}</li>\n`;
    }
    // Paragraf biasa
    else {
      if (inList) { html += '</ul>\n'; inList = false; }
      html += `<p class="my-3 text-slate-300 leading-relaxed text-xs md:text-sm">${line}</p>\n`;
    }
  }

  if (inList) {
    html += '</ul>\n';
  }

  return html;
}

// Ambil daftar seluruh blog untuk halaman galeri blog
export function getAllBlogPosts(): BlogPost[] {
  // Buat folder jika belum ada (safety check)
  if (!fs.existsSync(blogDirectory)) {
    fs.mkdirSync(blogDirectory, { recursive: true });
    return [];
  }

  const fileNames = fs.readdirSync(blogDirectory);
  const allPostsData = fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map(fileName => {
      const slug = fileName.replace(/\.md$/, '');
      const fullPath = path.join(blogDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');

      const { metadata, content } = parseFrontmatter(fileContents);
      const contentHtml = renderMarkdownToHtml(content);

      return {
        slug,
        title: metadata.title,
        date: metadata.date,
        excerpt: metadata.excerpt,
        tags: metadata.tags,
        author: metadata.author,
        contentHtml
      };
    });

  // Urutkan artikel berdasarkan tanggal terbaru
  return allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1));
}

// Ambil data satu blog tertentu berdasarkan slug file
export function getBlogPostBySlug(slug: string): BlogPost | null {
  try {
    const fullPath = path.join(blogDirectory, `${slug}.md`);
    if (!fs.existsSync(fullPath)) return null;

    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { metadata, content } = parseFrontmatter(fileContents);
    const contentHtml = renderMarkdownToHtml(content);

    return {
      slug,
      title: metadata.title,
      date: metadata.date,
      excerpt: metadata.excerpt,
      tags: metadata.tags,
      author: metadata.author,
      contentHtml
    };
  } catch {
    return null;
  }
}
