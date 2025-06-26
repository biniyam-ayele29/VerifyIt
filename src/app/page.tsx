"use client";

import { useState, useEffect } from 'react';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckCircle, XCircle, LogOut, Phone, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
      <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-76.2 74.3C309 100.8 280.7 96 248 96c-88.8 0-160.1 71.9-160.1 160.1s71.3 160.1 160.1 160.1c98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 26.9 3.9 41.4z"></path>
    </svg>
  );
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      setLoading(true);
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Error signing in with Google", error);
      let description = "Failed to sign in with Google. Please try again.";
      if (error.code === 'auth/unauthorized-domain') {
        description = "This domain is not authorized. Go to Firebase Console > Authentication > Settings and add 'localhost' to Authorized domains."
      }
      toast({
        title: "Authentication Error",
        description: description,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out", error);
      toast({
        title: "Sign Out Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleVerifyPhone = () => {
    if (user) {
      const verificationUrl = new URL('https://televerify.example.com/');
      const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;

      if (!clientId) {
        toast({
            title: "Configuration Error",
            description: "Client ID is missing. Please set NEXT_PUBLIC_CLIENT_ID in your .env.local file.",
            variant: "destructive",
        });
        return;
      }

      verificationUrl.searchParams.set('client_id', clientId);
      verificationUrl.searchParams.set('user_app_id', user.uid);
      window.location.href = verificationUrl.toString();
    }
  };

  const isVerified = !!user?.phoneNumber;

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-56">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      );
    }

    if (user) {
      return (
        <div className="space-y-6 text-center">
          <div className="flex flex-col items-center space-y-2">
            <Avatar className="h-20 w-20 border-2 border-primary">
              <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
              <AvatarFallback className="text-3xl font-headline">{user.displayName?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-xl font-headline">{user.displayName}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          
          <div className={`flex items-center p-3 rounded-lg border transition-colors ${isVerified ? 'bg-accent/10 border-accent/20' : 'bg-secondary'}`}>
             {isVerified ? (
              <CheckCircle className="h-5 w-5 mr-3 shrink-0 text-accent" />
            ) : (
              <XCircle className="h-5 w-5 mr-3 shrink-0 text-muted-foreground" />
            )}
            <div className="text-left">
              <p className={`font-semibold text-sm ${isVerified ? 'text-accent' : 'text-foreground'}`}>
                {isVerified ? 'Phone Verified' : 'Phone Not Verified'}
              </p>
              <p className="text-xs text-muted-foreground">
                {isVerified ? 'Your phone number has been successfully verified.' : 'Please complete phone verification.'}
              </p>
            </div>
          </div>

          {!isVerified && (
            <Button onClick={handleVerifyPhone} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground shadow-md transition-transform hover:scale-105">
              <Phone className="mr-2 h-4 w-4" /> Verify Your Phone
            </Button>
          )}
          
          <Button onClick={handleSignOut} variant="outline" className="w-full">
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center space-y-4 pt-4 text-center">
        <p className="text-muted-foreground">Please sign in to continue.</p>
        <Button onClick={handleGoogleSignIn} size="lg" className="w-full shadow-md transition-transform hover:scale-105 bg-primary text-primary-foreground hover:bg-primary/90">
          <GoogleIcon className="mr-2 h-5 w-5" />
          Sign In with Google
        </Button>
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full font-body">
      <main className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,var(--tw-gradient-from),transparent)] from-primary/15" />
        <Card className="w-full max-w-sm rounded-2xl shadow-xl border-t-4 border-primary overflow-hidden">
          <CardHeader className="text-center bg-card p-6">
            <CardTitle className="text-3xl font-headline text-foreground">VerifyIt</CardTitle>
            <CardDescription className="text-muted-foreground pt-1">
              Securely verify your phone number.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {renderContent()}
          </CardContent>
        </Card>
        <footer className="mt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} VerifyIt. All rights reserved.</p>
        </footer>
      </main>
    </div>
  );
}
