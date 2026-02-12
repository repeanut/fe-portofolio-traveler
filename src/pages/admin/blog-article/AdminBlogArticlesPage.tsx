import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye } from "lucide-react";
import AdminSidebar from "../../../components/admin/AdminSidebar";
import type { AdminSidebarItemKey } from "../../../components/admin/AdminSidebar";
import AdminHeader from "../../../components/admin/AdminHeader";
import AdminTableHeader from "../../../components/admin/AdminTableHeader";
import AdminTable from "../../../components/admin/AdminTable";
import type { Column } from "../../../components/admin/AdminTable";
import AdminModal, {
  type AdminModalField,
} from "../../../components/admin/AdminModal";
import SummernoteEditor from "../../../components/ui/SummernoteEditor";
import InitialShimmer from "../../../components/ui/InitialShimmer";
import { AdminTablePageSkeleton } from "../../../components/ui/skeletons";
import { useAdminToast } from "../../../hooks/useAdminToast";

interface BlogArticleItem extends Record<string, unknown> {
  id: number;
  cover: string;
  title: string;
  category: string;
  status: "publish" | "draft";
  content: string;
}

const BLOG_ARTICLES_STORAGE_KEY = "admin_blog_articles";

interface EditorModalProps {
  isOpen: boolean;
  initialTitle?: string;
  initialContent?: string;
  onClose: () => void;
  onSubmit: (content: string) => void;
}

const BlogEditorModal: React.FC<EditorModalProps> = ({
  isOpen,
  initialTitle,
  initialContent,
  onClose,
  onSubmit,
}) => {
  const [content, setContent] = useState(initialContent ?? "");

  useEffect(() => {
    if (!isOpen) return;
    const next = initialContent ?? "";
    const t = window.setTimeout(() => {
      setContent(next);
    }, 0);
    return () => window.clearTimeout(t);
  }, [initialContent, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="flex h-[80vh] w-full max-w-4xl flex-col rounded-2xl bg-white shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Write Article</h2>
            {initialTitle && (
              <p className="mt-0.5 text-xs text-slate-500">{initialTitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-3 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100"
          >
            Close
          </button>
        </div>

        {/* Editor content area */}
        <div className="flex-1 px-6 py-4 overflow-y-auto">
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <SummernoteEditor value={content} onChange={setContent} height={420} />
          </div>
        </div>

        {/* Footer buttons inside the card */}
        <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSubmit(content)}
            className="rounded-lg bg-blue-500 px-4 py-2 text-xs font-medium text-white shadow-xs hover:bg-blue-600"
          >
            Save Article
          </button>
        </div>
      </div>
    </div>
  );
};

const normalizeHtmlForPreview = (html: string) => {
  const raw = String(html ?? "");
  return raw.replace(/<img\b([^>]*?)\/>|<img\b([^>]*?)>/gi, (match, g1, g2) => {
    const attrs = String(g1 ?? g2 ?? "");
    const cleaned = attrs
      .replace(/\swidth\s*=\s*"[^"]*"/gi, "")
      .replace(/\sheight\s*=\s*"[^"]*"/gi, "")
      .replace(/\swidth\s*=\s*'[^']*'/gi, "")
      .replace(/\sheight\s*=\s*'[^']*'/gi, "");

    const hasStyle = /\sstyle\s*=\s*/i.test(cleaned);
    if (hasStyle) {
      return match.replace(
        /style\s*=\s*(["'])(.*?)\1/i,
        (_m, q, v) =>
          `style=${q}${String(v)};width:100% !important;max-width:100% !important;display:block;aspect-ratio:16/9;object-fit:cover;border-radius:1rem !important;${q}`
      );
    }

    const closing = match.endsWith("/>") ? " />" : ">";
    const core = match.startsWith("<img") ? "<img" : "<IMG";
    return `${core}${cleaned} style="width:100% !important;max-width:100% !important;display:block;aspect-ratio:16/9;object-fit:cover;border-radius:1rem !important;"${closing}`;
  });
};

interface PreviewModalProps {
  isOpen: boolean;
  article: BlogArticleItem | null;
  onClose: () => void;
}

const BlogPreviewModal: React.FC<PreviewModalProps> = ({ isOpen, article, onClose }) => {
  const normalizedHtml = useMemo(() => {
    if (!article) return "";
    return normalizeHtmlForPreview(article.content);
  }, [article]);

  if (!isOpen || !article) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="flex h-[86vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-blue-600">Preview</p>
            <h2 className="mt-1 truncate text-sm font-semibold text-slate-900">{article.title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
          >
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <article className="mx-auto max-w-3xl space-y-5">
            <header>
              <p className="text-xs font-medium text-sky-700">{article.category || "Uncategorized"}</p>
              <h1 className="mt-2 text-2xl md:text-3xl font-semibold text-slate-900">{article.title}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                <span>Admin</span>
                <span className="text-slate-300">|</span>
                <span>{new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}</span>
                <span className="text-slate-300">|</span>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${
                  article.status === "publish"
                    ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                    : "bg-amber-50 text-amber-700 ring-amber-200"
                }`}>
                  {article.status}
                </span>
              </div>
            </header>

            <div className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-100">
              <div className="aspect-[16/9] w-full">
                <img
                  src={article.cover || "/placeholder-image.png"}
                  alt={article.title}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder-image.png";
                  }}
                />
              </div>
            </div>

            <div
              className="prose prose-slate max-w-none prose-img:!block prose-img:!w-full prose-img:!max-w-full prose-img:aspect-video prose-img:object-cover prose-img:rounded-2xl prose-img:shadow-sm prose-img:border prose-img:border-slate-100"
              dangerouslySetInnerHTML={{ __html: normalizedHtml }}
            />
          </article>
        </div>
      </div>
    </div>
  );
};

const AdminBlogArticlesPage: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<AdminSidebarItemKey>("blog");
  const navigate = useNavigate();
  const toast = useAdminToast();

  const [articles, setArticles] = useState<BlogArticleItem[]>(() => {
    try {
      const raw = localStorage.getItem(BLOG_ARTICLES_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as unknown;
        if (Array.isArray(parsed)) {
          return parsed as BlogArticleItem[];
        }
      }
    } catch {
      // ignore
    }

    return [
      {
        id: 1,
        cover: "/placeholder-image.png",
        title: "Tips for Preparing a Trip to Bali",
        category: "Travel Tips",
        status: "publish",
        content: "Sample article content about traveling to Bali.",
      },
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem(BLOG_ARTICLES_STORAGE_KEY, JSON.stringify(articles));
    } catch {
      // ignore
    }
  }, [articles]);

  const [isMetaModalOpen, setIsMetaModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [previewArticle, setPreviewArticle] = useState<BlogArticleItem | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [pendingMeta, setPendingMeta] = useState<
    | {
        cover: string;
        title: string;
        category: string;
        status: "publish" | "draft";
      }
    | null
  >(null);

  const [editorTitle, setEditorTitle] = useState<string | undefined>(undefined);
  const [editorContent, setEditorContent] = useState<string>("");

  const columns: Column[] = useMemo(
    () => [
      { header: "Cover", accessor: "cover", type: "image" },
      { header: "Title", accessor: "title", type: "text" },
      { header: "Category", accessor: "category", type: "text" },
      { header: "Status", accessor: "status", type: "text" },
      {
        header: "Action",
        accessor: "action",
        type: "action",
        render: (_value, row) => (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                const id = row.id;
                const found = typeof id === "number" ? articles.find((a) => a.id === id) : null;
                if (!found) return;
                setPreviewArticle(found);
                setIsPreviewOpen(true);
              }}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-blue-700"
              title="Preview"
            >
              <Eye className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                const id = row.id;
                if (typeof id !== "number") return;
                const item = articles.find((a) => a.id === id);
                if (!item) return;
                setEditingId(id);
                setPendingMeta({
                  cover: item.cover,
                  title: item.title,
                  category: item.category,
                  status: item.status,
                });
                setEditorTitle(item.title);
                setEditorContent(item.content);
                setIsMetaModalOpen(true);
              }}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-blue-700"
              title="Edit"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => {
                const id = row.id;
                if (typeof id !== "number") return;
                try {
                  setArticles((prev) => prev.filter((a) => a.id !== id));
                  toast.success("Success", "Article deleted successfully");
                } catch {
                  toast.error("Error", "Failed to delete article");
                }
              }}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-red-700"
              title="Delete"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.92a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m-1.022.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.92a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165M9 5.25V3m0 0V2.25L9 2.25A2.25 2.25 0 0111.25 0h1.5A2.25 2.25 0 0115 2.25V3m-3 0v1.5H9m3 0V3m0 0H9m3 0H9" />
              </svg>
            </button>
          </div>
        ),
      },
    ],
    [articles, toast]
  );

  const metaFields: AdminModalField[] = useMemo(
    () => [
      {
        name: "cover",
        label: "Image Cover",
        type: "image",
        multiple: false,
      },
      {
        name: "title",
        label: "Title",
        type: "text",
        placeholder: "Article title",
      },
      {
        name: "category",
        label: "Category",
        type: "text",
        placeholder: "e.g. Travel, Tips, Story",
      },
      {
        name: "status",
        label: "Status",
        type: "radio",
        options: [
          { label: "Publish", value: "publish" },
          { label: "Draft", value: "draft" },
        ],
      },
    ],
    []
  );

  return (
    <InitialShimmer delayMs={850} skeleton={<AdminTablePageSkeleton titleWidthClassName="w-36" rows={6} />}>
      <div className="flex h-screen bg-slate-50 overflow-hidden overflow-x-hidden">
        <AdminSidebar
          active={activeMenu}
          onNavigate={(key) => {
            setActiveMenu(key);
            if (key === "dashboard") {
              navigate("/admin/dashboard");
            } else if (key === "chat") {
              navigate("/admin/chat");
            } else if (key === "landing") {
              navigate("/admin/landing/hero");
            } else if (key === "users") {
              navigate("/admin/users");
            } else if (key === "shop") {
              navigate("/admin/shop");
            } else if (key === "transactions") {
              navigate("/admin/transactions");
            } else if (key === "blog") {
              navigate("/admin/blog");
            }
          }}
        />

        <div className="flex min-w-0 flex-1 flex-col px-4 py-4 md:px-8 md:py-6 overflow-hidden">
          <AdminHeader title="Blog Articles" />

          <div className="flex-1 overflow-y-auto space-y-10 pr-1">
            <section>
              <AdminTableHeader
                placeholder="Search article..."
                onAddClick={() => {
                  setEditingId(null);
                  setPendingMeta(null);
                  setEditorContent("");
                  setEditorTitle(undefined);
                  setIsMetaModalOpen(true);
                }}
              />

              <AdminTable
                columns={columns}
                data={articles}
                currentPage={1}
                itemsPerPage={5}
                totalPages={1}
                onPageChange={() => {}}
                onItemsPerPageChange={() => {}}
              />
            </section>
          </div>
        </div>

        <BlogPreviewModal
          isOpen={isPreviewOpen}
          article={previewArticle}
          onClose={() => {
            setIsPreviewOpen(false);
            setPreviewArticle(null);
          }}
        />

        {/* Modal 1: article metadata */}
        <AdminModal
          isOpen={isMetaModalOpen}
          title={editingId ? "Edit Article" : "Add Article"}
          fields={metaFields}
          submitLabel="Continue"
          initialData={
            editingId != null && pendingMeta
              ? {
                  cover: [pendingMeta.cover],
                  title: pendingMeta.title,
                  category: pendingMeta.category,
                  status: pendingMeta.status,
                }
              : undefined
          }
          onClose={() => {
            setIsMetaModalOpen(false);
            setEditingId(null);
            setPendingMeta(null);
          }}
          onSubmit={(data) => {
            const coverList = (data.cover as string[] | undefined) ?? [];
            const cover = coverList[0] || "";
            const title = (data.title as string) || "";
            const category = (data.category as string) || "";
            const rawStatus = ((data.status as string) || "draft").toLowerCase();
            const status: "publish" | "draft" =
              rawStatus === "publish" ? "publish" : "draft";

            try {
              setPendingMeta({ cover, title, category, status });
              setEditorTitle(title);
              setIsMetaModalOpen(false);
              setIsEditorOpen(true);
              toast.success("Success", "Article metadata saved. Continue writing the content.");
            } catch {
              toast.error("Error", "Failed to save article metadata");
            }
          }}
        />

        {/* Modal 2: article content editor */}
        <BlogEditorModal
          isOpen={isEditorOpen}
          initialTitle={editorTitle}
          initialContent={editorContent}
          onClose={() => {
            setIsEditorOpen(false);
            setEditingId(null);
            setPendingMeta(null);
            setEditorContent("");
            setEditorTitle(undefined);
          }}
          onSubmit={(content) => {
            if (!pendingMeta) {
              setIsEditorOpen(false);
              return;
            }

            try {
              if (editingId != null) {
                setArticles((prev) =>
                  prev.map((item) =>
                    item.id === editingId
                      ? {
                          ...item,
                          cover: pendingMeta.cover || item.cover,
                          title: pendingMeta.title || item.title,
                          category: pendingMeta.category || item.category,
                          status: pendingMeta.status || item.status,
                          content,
                        }
                      : item
                  )
                );
                toast.success("Success", "Article updated successfully");
              } else {
                setArticles((prev) => {
                  const nextId = prev.length ? prev[prev.length - 1].id + 1 : 1;
                  return [
                    ...prev,
                    {
                      id: nextId,
                      cover: pendingMeta.cover,
                      title: pendingMeta.title,
                      category: pendingMeta.category,
                      status: pendingMeta.status,
                      content,
                    },
                  ];
                });
                toast.success("Success", "Article added successfully");
              }

              setIsEditorOpen(false);
              setEditingId(null);
              setPendingMeta(null);
              setEditorContent("");
              setEditorTitle(undefined);

              // Show success message
              if (pendingMeta.status === "publish") {
                toast.success("Success", "Article published successfully");
              } else {
                toast.success("Success", "Article saved as a draft");
              }
            } catch {
              toast.error("Error", "Failed to save article changes");
            }
          }}
        />
      </div>
    </InitialShimmer>
  );
};

export default AdminBlogArticlesPage;
