"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SearchInput } from "./search-input";
import { useRouter } from "next/navigation";

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
    const router = useRouter();

    const handleSearch = (query: string, filters: { type: 'all' | 'topic' | 'interest'; value?: string }) => {
        const params = new URLSearchParams();
        if (query) params.set('q', query);
        if (filters.type !== 'all' && filters.value) {
            params.set(filters.type, filters.value);
        }
        onClose();
        router.push(`/search?${params.toString()}`);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-2xl bg-background/95 backdrop-blur-xl border-border/50 p-6 md:p-8 rounded-3xl shadow-2xl">
                <DialogHeader className="mb-4">
                    <DialogTitle className="text-2xl font-bold tracking-tight text-center">Search ReadMore</DialogTitle>
                </DialogHeader>
                <div className="py-2">
                    <SearchInput onSearch={handleSearch} autoFocus />
                </div>
            </DialogContent>
        </Dialog>
    );
}
