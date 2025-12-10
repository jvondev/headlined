"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { validateLicense as validateLicenseKey } from "@/lib/license-manager";
import { useRouter } from "next/navigation";

interface LicenseValidationModalProps {
    trigger?: React.ReactNode;
}

export function LicenseValidationModal({ trigger }: LicenseValidationModalProps) {
    const [key, setKey] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");
    const router = useRouter();

    const validateLicense = async () => {
        if (!key.trim()) return;

        setIsLoading(true);
        setStatus("idle");
        setErrorMessage("");

        try {
            const isValid = await validateLicenseKey(key.trim());

            if (!isValid) {
                throw new Error("Invalid license key");
            }

            setStatus("success");

        } catch (error: any) {
            console.error("Validation error:", error);
            setStatus("error");
            setErrorMessage(error.message || "Invalid license key. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="link" className="text-muted-foreground hover:text-primary">
                        Already have a license?
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Activate Headlined+</DialogTitle>
                    <DialogDescription>
                        Enter your license key from your purchase email to unlock premium features.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="license-key">License Key</Label>
                        <Input
                            id="license-key"
                            placeholder="Enter your license key"
                            value={key}
                            onChange={(e) => setKey(e.target.value)}
                            disabled={isLoading || status === "success"}
                        />
                    </div>

                    <AnimatePresence mode="wait">
                        {status === "error" && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md"
                            >
                                <AlertCircle className="w-4 h-4" />
                                <span>{errorMessage}</span>
                            </motion.div>
                        )}
                        {status === "success" && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-md border border-green-200"
                            >
                                <CheckCircle className="w-4 h-4" />
                                <span>License activated successfully! Welcome to Headlined+.</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="flex justify-end">
                        {status === "success" ? (
                            <Button className="w-full" onClick={() => router.push('/app/today')}>
                                Continue to Headlined
                            </Button>
                        ) : (
                            <Button
                                onClick={validateLicense}
                                disabled={isLoading || !key.trim()}
                                className="w-full"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Validating...
                                    </>
                                ) : (
                                    "Activate License"
                                )}
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
