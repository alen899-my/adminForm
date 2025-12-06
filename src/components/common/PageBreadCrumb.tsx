import Link from "next/link";
import React from "react";
import { Plus } from "lucide-react";

interface BreadcrumbProps {
  pageTitle: string;
}

const PageBreadcrumb: React.FC<BreadcrumbProps> = ({ pageTitle }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white">
        {pageTitle}
      </h2>

      {/* Add Lead Button */}
      <Link
        href="/add-lead"
        className="
          inline-flex items-center justify-center gap-2 
          w-full sm:w-auto
          px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors
          bg-blue-600 hover:bg-blue-700 text-white
          dark:bg-blue-600 dark:hover:bg-blue-500
        "
      >
        <Plus className="w-4 h-4" />
        Add New Lead
      </Link>
    </div>
  );
};

export default PageBreadcrumb;