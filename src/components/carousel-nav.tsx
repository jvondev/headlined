"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import React from "react";
import { EmblaCarouselType } from "embla-carousel-react";

type CarouselItem = {
    name: string;
    type: "topic" | "interest" | "none";
    href: string;
    icon?: React.ForwardRefExoticComponent<Omit<any, "ref"> & React.RefAttributes<SVGSVGElement>>;
    isIconOnly?: boolean;
};

type CarouselNavProps = {
    emblaRef: (instance: HTMLElement | null) => void;
    emblaApi: EmblaCarouselType | undefined;
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

    return (
        <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex items-center">
                {allFilterItems.map((item, index) => {
                    const isActive = selectedIndex === index;

                    return (
                        <div key={item.name} className={cn("flex-[0_0_auto] mr-2 last:mr-0", {
                            "pl-4": index === 0,
                            "pr-4": index === allFilterItems.length - 1,
                        })}>
                            <Button
                                variant={isActive ? "secondary" : "outline"}
                                size={item.isIconOnly ? "icon" : "sm"}
                                onClick={() => onNavClick(index)}
                                className={cn("rounded-full", item.isIconOnly ? "" : "px-4")}
                            >
                                {item.icon && <item.icon className={cn("h-4 w-4", { "mr-2": !item.isIconOnly })} />}
                                {!item.isIconOnly && item.name}
                            </Button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}