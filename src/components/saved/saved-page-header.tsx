"use client";

import { FC } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { useFullScreen } from "@/context/full-screen-context";

type SavedPageHeaderProps = {
  title: string;
};

export const SavedPageHeader: FC<SavedPageHeaderProps> = ({ title }) => {
  const { isFullScreen, toggleFullScreen } = useFullScreen();

  return (
    <PageHeader
      title={title}
      isFullScreen={isFullScreen}
      toggleFullScreen={toggleFullScreen}
    />
  );
};
