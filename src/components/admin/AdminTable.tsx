import React from "react";
import Skeleton from "../ui/Skeleton";

export interface Column {
  header: string;
  accessor: string;
  type?:
    | "text"
    | "image"
    | "svg"
    | "status"
    | "action"
    | "email"
    | "date"
    | "textarea"
    | "number"
    | "video"
    | "json";
  render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode;
}

interface AdminTableProps {
  columns: Column[];
  data: Array<Record<string, unknown> & { _id?: string; id?: string | number }>;
  onDelete?: (id?: string | number) => void;
  onEdit?: (id?: string | number) => void;
  onPreview?: (user: Record<string, unknown>) => void;
  onShowResult?: (user: Record<string, unknown>) => void;
  onCreate?: () => void;
  itemsPerPage?: number;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  isLoading?: boolean;
}

const AdminTable: React.FC<AdminTableProps> = ({
  columns,
  data,
  onDelete,
  onEdit,
  onPreview,
  onShowResult,
  onCreate,
  itemsPerPage = 5,
  currentPage = 1,
  totalPages,
  onPageChange,
  onItemsPerPageChange,
  isLoading = false,
}) => {
  // Debug logging
  console.log('📊 AdminTable received data:', data.length, 'items');
  console.log('📋 AdminTable data sample:', data[0]);
  console.log('📋 AdminTable columns:', columns.map(c => c.header));

  const computedTotalPages = Math.max(1, Math.ceil(data.length / itemsPerPage));
  const effectiveTotalPages =
    typeof totalPages === "number"
      ? Math.max(1, Math.max(totalPages, computedTotalPages))
      : computedTotalPages;
  const effectiveCurrentPage = Math.min(Math.max(1, currentPage), effectiveTotalPages);
  const startIndex = (effectiveCurrentPage - 1) * itemsPerPage;
  const paginatedData = data.slice(startIndex, startIndex + itemsPerPage);

  console.log('📄 Paginated data:', paginatedData.length, 'items');
  console.log('📄 Paginated data sample:', paginatedData[0]);

  const renderCell = (column: Column, row: Record<string, unknown>) => {
    if (column.render) {
      return column.render(row[column.accessor], row);
    }

    switch (column.type) {
      case "image":
        return (
          <div className="flex-shrink-0 h-12 w-12">
            <img
              className="h-12 w-12 rounded-lg object-cover border border-blue-200 shadow-sm"
              src={row[column.accessor] as string}
              alt=""
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/placeholder-image.png";
              }}
            />
          </div>
        );
      case "svg":
        return (
          <div className="flex-shrink-0 h-8 w-8 bg-gray-50 rounded-lg flex items-center justify-center">
            <img
              className="h-6 w-6 object-contain"
              src={row[column.accessor] as string}
              alt=""
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/placeholder-icon.png";
              }}
            />
          </div>
        );
      case "video":
        return (
          <div className="flex-shrink-0 h-8 w-8">
            <video
              className="h-8 w-8 rounded-lg object-cover"
              src={row[column.accessor] as string}
            />
          </div>
        );
      case "json":
        return (
          <div className="flex items-center p-2 bg-gray-50 rounded-lg">
            <svg
              className="w-4 h-4 text-gray-500 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-[11px] text-gray-600">
              {row[column.accessor] as string}
            </span>
          </div>
        );
      case "textarea":
        return (
          <div className="max-w-md text-[11px] text-slate-600">
            <p className="line-clamp-2 leading-relaxed">{row[column.accessor] as string}</p>
          </div>
        );
      case "action":
        return (
          <div className="flex items-center gap-2">
            {onPreview && (
              <button
                onClick={() => onPreview(row)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-green-100 hover:text-green-700 transition-all duration-200 transform hover:scale-105"
                title="Preview"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.036 12.322a1.012 1.012 0 010-.639c.247-.635.609-1.208 1.074-1.694C4.49 8.463 6.861 7.5 10 7.5s5.51.963 7.89 3.489c.465.486.827 1.059 1.074 1.694a1.012 1.012 0 010 .639c-.247.635-.609 1.208-1.074 1.694C15.51 15.537 13.139 16.5 10 16.5s-5.51-.963-7.89-3.489a6.842 6.842 0 01-1.074-1.694zM15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>
            )}
            {onShowResult && (
              <button
                onClick={() => onShowResult(row)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-blue-100 hover:text-blue-700 transition-all duration-200 transform hover:scale-105"
                title="Show Details"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                  />
                </svg>
              </button>
            )}
            {onEdit && (
              <button
                onClick={() => {
                  const rowId = (row as any)._id ?? (row as any).id;
                  onEdit(rowId);
                }}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-blue-100 hover:text-blue-700 transition-all duration-200 transform hover:scale-105"
                title="Edit"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 001.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                  />
                </svg>
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => {
                  const rowId = (row as any)._id ?? (row as any).id;
                  onDelete(rowId);
                }}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-red-100 hover:text-red-700 transition-all duration-200 transform hover:scale-105"
                title="Delete"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.774 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                  />
                </svg>
              </button>
            )}
          </div>
        );
      case "date":
        return (
          <div className="text-[11px] text-slate-600">
            {row[column.accessor] as string}
          </div>
        );
      default:
        return (
          <div className="text-xs text-slate-700 font-medium">
            {row[column.accessor] as string}
          </div>
        );
    }
  };

  return (
    <div className="rounded-2xl border border-slate-100 bg-white shadow-xs max-w-full overflow-hidden">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <div className="flex-1"></div>
        {onCreate && (
          <button
            onClick={onCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-[11px] font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            Tambah Data
          </button>
        )}
      </div>
      
      <div className="w-full max-w-full align-middle">
        <div className="relative w-full max-w-full overflow-x-auto overflow-y-visible">
          <table className="w-full min-w-[900px] md:min-w-0 table-fixed divide-y divide-blue-100">
            <thead className="bg-gradient-to-r from-blue-50 to-blue-100 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-blue-900 uppercase tracking-wider bg-blue-50 w-16">
                  No
                </th>
                {columns.map((column, index) => {
                  const isLongText =
                    ["description", "title"].includes(column.accessor) ||
                    column.type === "textarea";
                  const isAction = column.type === "action";
                  return (
                    <th
                      key={index}
                      className={`px-6 py-4 text-left text-xs font-bold text-blue-900 uppercase tracking-wider bg-blue-50${
                        isAction ? " w-32" : ""
                      }${
                        isLongText
                          ? " whitespace-normal break-words max-w-md"
                          : " truncate"
                      }`}
                    >
                      {column.header}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-blue-50">
              {isLoading
                ? Array.from({ length: itemsPerPage }).map((_, idx) => (
                    <tr key={idx}>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-blue-300 w-16">
                        <Skeleton className="h-4 w-6" rounded="rounded" />
                      </td>
                      {columns.map((col, cidx) => (
                        <td
                          key={cidx}
                          className={`px-6 py-4${
                            col.type === "action" ? " w-32" : ""
                          }${
                            ["description", "title"].includes(col.accessor) ||
                            col.type === "textarea"
                              ? " whitespace-normal break-words max-w-md"
                              : " whitespace-nowrap"
                          }`}
                        >
                          <Skeleton
                            className={`h-4 ${col.type === "action" ? "w-20" : "w-24"}`}
                            rounded="rounded"
                          />
                        </td>
                      ))}
                    </tr>
                  ))
                : paginatedData.length > 0
                  ? paginatedData.map((row, index) => (
                      <tr key={row._id || index} className="hover:bg-blue-50/50 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-blue-600 font-medium w-16">
                          {(effectiveCurrentPage - 1) * itemsPerPage + index + 1}
                        </td>
                        {columns.map((column, colIndex) => (
                          <td
                            key={colIndex}
                            className={`px-6 py-4 text-xs text-slate-700 font-medium${
                              column.type === "action" ? " w-32" : ""
                            }${
                              ["description", "title"].includes(column.accessor) ||
                              column.type === "textarea"
                                ? " whitespace-normal break-words max-w-md"
                                : " whitespace-nowrap"
                            }`}
                          >
                            {renderCell(column, row)}
                          </td>
                        ))}
                      </tr>
                    ))
                  : (
                      <tr>
                        <td
                          colSpan={columns.length + 1}
                          className="px-4 py-10 text-center text-sm text-slate-500"
                        >
                          No data found.
                        </td>
                      </tr>
                    )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-blue-100 bg-white">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-600 font-medium">Show result:</span>
          <select
            className="px-3 py-2 border border-blue-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange?.(Number(e.target.value))}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange?.(effectiveCurrentPage - 1)}
            disabled={effectiveCurrentPage === 1}
            className="p-2 rounded-lg hover:bg-blue-50 text-slate-500 disabled:opacity-50 transition-colors duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
          </button>
          {Array.from({ length: effectiveTotalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => onPageChange?.(page)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 transform hover:scale-105 ${
                effectiveCurrentPage === page
                  ? "bg-blue-600 text-white shadow-lg"
                  : "hover:bg-blue-50 text-slate-700"
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => onPageChange?.(effectiveCurrentPage + 1)}
            disabled={effectiveCurrentPage === effectiveTotalPages}
            className="p-2 rounded-lg hover:bg-blue-50 text-slate-500 disabled:opacity-50 transition-colors duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 4.5l7.5 7.5-7.5 7.5"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminTable;
