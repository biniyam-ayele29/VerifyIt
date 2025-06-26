"use client";

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, UserCheck, ShieldCheck, Phone, Mail, CheckCircle, XCircle } from 'lucide-react';

function VerifiedPageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const verificationId = searchParams.get('verification_id');
    const userIdentifier = searchParams.get('user_identifier');
    const phone = searchParams.get('phone');
    
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);

            if (!currentUser) {
                setLoading(false);
                setError("You must be logged in to view this page.");
                return;
            }

            if (!verificationId || !userIdentifier || !phone) {
                setLoading(false);
                setError("Missing verification details in the URL.");
                return;
            }

            if (currentUser.uid !== userIdentifier) {
                setLoading(false);
                setError("Verification data does not match the logged-in user.");
                return;
            }
            
            try {
                localStorage.setItem(`${currentUser.uid}-phoneVerified`, 'true');
                localStorage.setItem(`${currentUser.uid}-verifiedPhoneNumber`, phone);
            } catch (e) {
                console.error("Failed to write to localStorage", e);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, [verificationId, userIdentifier, phone]);

    const renderDetails = () => {
        if (loading) {
            return (
                <div className="flex justify-center items-center h-56">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
            );
        }

        if (error || !user) {
             return (
                <div className="text-center space-y-4">
                    <XCircle className="h-12 w-12 text-destructive mx-auto" />
                    <p className="text-destructive font-semibold">Verification Failed</p>
                    <p className="text-muted-foreground text-sm">{error || "An unknown error occurred."}</p>
                     <Button asChild variant="outline" className="w-full">
                        <Link href="/">
                            Go to Home
                        </Link>
                    </Button>
                </div>
             );
        }

        return (
            <div className="space-y-4 text-left">
                <div className="space-y-3 rounded-lg border bg-card p-4">
                    <div className="flex items-start">
                        <ShieldCheck className="h-5 w-5 mr-3 mt-1 shrink-0 text-accent" />
                        <div>
                            <p className="text-xs text-muted-foreground">Verification ID</p>
                            <p className="font-mono text-sm font-medium break-all">{verificationId}</p>
                        </div>
                    </div>
                    <div className="flex items-start">
                        <UserCheck className="h-5 w-5 mr-3 mt-1 shrink-0 text-accent" />
                        <div>
                            <p className="text-xs text-muted-foreground">User Identifier</p>
                            <p className="font-mono text-sm font-medium break-all">{userIdentifier}</p>
                        </div>
                    </div>
                    <div className="flex items-start">
                        <Phone className="h-5 w-5 mr-3 mt-1 shrink-0 text-accent" />
                         <div>
                            <p className="text-xs text-muted-foreground">Verified Phone</p>
                            <p className="font-medium">{phone}</p>
                        </div>
                    </div>
                    <div className="flex items-start">
                        <Mail className="h-5 w-5 mr-3 mt-1 shrink-0 text-accent" />
                        <div>
                            <p className="text-xs text-muted-foreground">Associated Email</p>
                            <p className="font-medium">{user.email}</p>
                        </div>
                    </div>
                </div>

                 <Button onClick={() => router.push('/')} className="w-full mt-6 bg-accent hover:bg-accent/90">
                    Continue to Dashboard
                 </Button>
            </div>
        );
    };


    return (
        <div className="min-h-screen w-full font-body bg-background">
            <main className="flex min-h-screen flex-col items-center justify-center p-4">
                <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,var(--tw-gradient-from),transparent)] from-accent/15" />
                <Card className="w-full max-w-md rounded-2xl shadow-xl border-t-4 border-accent overflow-hidden">
                    <CardHeader className="text-center items-center bg-card p-6">
                         <CheckCircle className="h-12 w-12 text-accent" />
                        <CardTitle className="text-3xl font-headline text-foreground mt-4">Verification Complete</CardTitle>
                        <CardDescription className="text-muted-foreground pt-1">
                            Your phone number has been successfully verified.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        {renderDetails()}
                    </CardContent>
                </Card>
                 <footer className="mt-8 text-center text-sm text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} VerifyIt. All rights reserved.</p>
                </footer>
            </main>
        </div>
    );
}

export default function VerifiedPage() {
    return (
        <Suspense>
            <VerifiedPageContent />
        </Suspense>
    )
}
