"use client";

import { FC } from "react";
import { PageHeader } from "@/components/shared/page-header";

type SavedPageHeaderProps = {
  title: string;
};

export const SavedPageHeader: FC<SavedPageHeaderProps> = ({ title }) => {
  return (
    <PageHeader
      title={title}
    />
  );
};
