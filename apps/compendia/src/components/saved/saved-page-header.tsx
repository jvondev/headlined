"use client";

import { FC } from "react";
import { cn } from "@repo/lib/utils/utils";

type SavedPageHeaderProps = {
  title: string;
};

export const SavedPageHeader: FC<SavedPageHeaderProps> = ({ title }) => {
  return (
    <div className={cn("fixed top-0 left-0 right-0 z-20 transition-all duration-300 opacity-100 translate-y-0")}>
      <div className="container mx-auto px-2 md:px-4">
        <div className="flex flex-col py-2">
          <div className="relative flex justify-between items-center">
            {title && <h1 className="text-lg font-headline font-semibold absolute left-1/2 -translate-x-1/2">{title}</h1>}
          </div>
        </div>
      </div>
    </div>
  );
};
