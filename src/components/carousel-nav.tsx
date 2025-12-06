"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import React, { useState, useEffect } from "react";
import { UseEmblaCarouselType } from "embla-carousel-react";
import { DynamicIcon } from "@/components/dynamic-icon";
import Link from "next/link";
import { checkLicenseStatus } from "@/lib/license-manager";

type CarouselItem = {
    name: string;
    type: "topic" | "interest" | "none";
    href: string;
    icon?: string;
    isIconOnly?: boolean;
};

type CarouselNavProps = {
    emblaRef: (instance: HTMLElement | null) => void;
    emblaApi: UseEmblaCarouselType[1];
    allFilterItems: CarouselItem[];
    selectedIndex: number;
    onNavClick: (index: number) => void;
};

export function CarouselNav({
    emblaRef,
    emblaApi,
    allFilterItems,
    selectedIndex,
    onNavClick,
}: CarouselNavProps) {
    const pathname = usePathname();
    const [isPremium, setIsPremium] = useState(false);

    useEffect(() => {
        checkLicenseStatus().then(setIsPremium);
    }, []);

    useEffect(() => {
        if (emblaApi) {
            emblaApi.scrollTo(selectedIndex);
        }
    }, [emblaApi, selectedIndex]);

    return (
        <div className="flex items-center w-full pl-4">
            <Button variant="outline" className="mr-4 flex-shrink-0 font-bold text-md tracking-tight px-4 rounded-lg" asChild>
                <Link href={isPremium ? "/today" : "/support"}>
                    Headlined
                    {isPremium && <sup className="-ml-2 text-md">+</sup>}
                </Link>
            </Button>
            <div className="overflow-hidden flex-1" ref={emblaRef}>
                <div className="flex items-center">
                    {allFilterItems.map((item, index) => {
                        const isActive = selectedIndex === index;

                        return (
                            <div key={`${item.name}-${index}`} className={cn("flex-[0_0_auto] mr-3 last:mr-4", {
                                "pl-0": index === 0,
                            })}>
                                <Button
                                    variant={isActive ? "secondary" : "outline"}
                                    size={item.isIconOnly ? "icon" : "sm"}
                                    onClick={() => onNavClick(index)}
                                    className={cn("rounded-lg", item.isIconOnly ? "" : "px-4")}
                                >
                                    {item.icon && <DynamicIcon name={item.icon} className={cn("h-4 w-4", { "mr-2": !item.isIconOnly })} skeletonBgClass={isActive ? "bg-gray-300" : "bg-muted"} />}
                                    {!item.isIconOnly && item.name}
                                </Button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}