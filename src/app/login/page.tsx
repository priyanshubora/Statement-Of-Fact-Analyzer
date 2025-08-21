"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Anchor } from "lucide-react";
import { ClientOceanBackground } from "@/components/client-ocean-background";
import { ThemeToggle } from "@/components/theme-toggle";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSignIn = async ({ email, password }: z.infer<typeof formSchema>) => {
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/");
    } catch (e: any) {
      setError(e.message);
      toast({
        variant: "destructive",
        title: "Sign In Failed",
        description: e.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async ({ email, password }: z.infer<typeof formSchema>) => {
    setLoading(true);
    setError(null);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push("/");
    } catch (e: any) {
      setError(e.message);
       toast({
        variant: "destructive",
        title: "Sign Up Failed",
        description: e.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    const email = form.getValues("email");
    if (!email) {
      form.setError("email", { type: "manual", message: "Please enter your email to reset password."});
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: "Password Reset Email Sent",
        description: "If an account with that email exists, a password reset link has been sent to it.",
      });
    } catch (e: any) {
       setError(e.message);
       toast({
        variant: "destructive",
        title: "Password Reset Failed",
        description: e.message,
      });
    } finally {
        setLoading(false);
    }
  };

  return (
     <div className="relative min-h-screen w-full">
      <ClientOceanBackground />
       <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center p-4">
        <div className="flex items-center gap-3 mb-6">
            <div className="bg-primary p-2 rounded-md shadow-md">
              <Anchor className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-primary md:text-3xl">SOFA</h1>
        </div>
        <Tabs defaultValue="signin" className="w-full max-w-sm">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="signin">
            <Card className="bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Sign In</CardTitle>
                <CardDescription>
                  Enter your credentials to access your account.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSignIn)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="name@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Sign In
                    </Button>
                  </form>
                </Form>
                 <Button variant="link" size="sm" className="px-0 pt-4" onClick={handlePasswordReset} disabled={loading}>
                    Forgot your password?
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="signup">
            <Card className="bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Sign Up</CardTitle>
                <CardDescription>
                  Create an account to get started.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSignUp)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="name@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Sign Up
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}