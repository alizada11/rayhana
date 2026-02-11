import { motion } from "framer-motion";
import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import {
  SignInButton,
  SignOutButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/clerk-react";
import { useUserRole } from "@/hooks/useUserRole";

function LoginPage() {
  const { t } = useTranslation();
  const { data: me } = useUserRole();

  return (
    <div className="min-h-screen p-2 bg-gradient-to-br from-background via-background/95 to-muted/60 dark:from-background dark:via-background dark:to-muted/20 text-foreground transition-colors">
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            {/* Login Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-card text-card-foreground rounded-2xl shadow-xl shadow-primary/10 dark:shadow-primary/20 border border-border overflow-hidden transition-colors"
            >
              {/* Card Header */}
              <div className="bg-primary/10 dark:bg-primary/20 p-8 text-center transition-colors">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 dark:bg-primary/30 flex items-center justify-center">
                  <span className="text-2xl">🔐</span>
                </div>
                <h1 className="font-serif text-3xl font-bold text-primary">
                  {t("login_page.title", "Welcome Back")}
                </h1>
                <p className="text-muted-foreground mt-2">
                  {t("login_page.subtitle", "Sign in to access your account")}
                </p>
              </div>

              {/* Card Body */}
              <div className="p-8 bg-gradient-to-b from-card to-muted/40 dark:from-card dark:to-muted/10 transition-colors">
                {/* Clerk Authentication Buttons */}
                <div className="space-y-6">
                  {/* Signed Out State - Show Login Links */}
                  <SignedOut>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="space-y-4"
                    >
                      {/* Sign In Button */}
                      <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                        <Link
                          to="#"
                          className="block w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg text-center"
                        >
                          {t("login_page.sign_in", "Sign In")}
                        </Link>
                      </SignInButton>

                      {/* Sign Up Link */}
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-4">
                          {t(
                            "login_page.sign_up_prompt",
                            "Don't have an account?"
                          )}
                        </p>
                        <SignUpButton
                          mode="modal"
                          forceRedirectUrl="/dashboard"
                        >
                          <Link
                            to="#"
                            className="block w-full border-2 border-primary text-primary hover:bg-primary/5 font-semibold py-3 px-6 rounded-lg transition-all duration-300 text-center"
                          >
                            {t("login_page.sign_up", "Create Account")}
                          </Link>
                        </SignUpButton>
                      </div>
                    </motion.div>
                  </SignedOut>

                  {/* Signed In State - Show User Menu & Links */}
                  <SignedIn>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-center space-y-6"
                    >
                      {/* User Info */}
                      <div className="bg-secondary/10 rounded-xl p-6">
                        <div className="flex items-center justify-center gap-4 mb-4">
                          <UserButton
                            afterSignOutUrl="/"
                            appearance={{
                              elements: {
                                avatarBox: "w-12 h-12",
                              },
                            }}
                          />
                          <div className="text-left">
                            <h3 className="font-serif font-semibold text-lg text-foreground">
                              {t("login_page.welcome", "Welcome!")}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {t(
                                "login_page.access_granted",
                                "Full access granted"
                              )}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Navigation Links */}
                      <div className="space-y-4">
                        <SignOutButton>
                          <Link
                            to="#"
                            className="block w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg text-center"
                          >
                            {t("login_page.sign_out", "Sign Out")}
                          </Link>
                        </SignOutButton>

                        <div className="grid grid-cols-2 gap-3">
                          {me?.role === "admin" && (
                            <Link
                              to="/dashboard"
                              className="block bg-primary/10 hover:bg-primary/20 text-primary font-semibold py-3 px-4 rounded-lg transition-all duration-300 text-center"
                            >
                              {t("login_page.dashboard", "Dashboard")}
                            </Link>
                          )}
                          {me?.role === "guest" && (
                            <Link
                              to="/my-submissions"
                              className="block bg-primary/10 hover:bg-primary/20 text-primary font-semibold py-3 px-4 rounded-lg transition-all duration-300 text-center"
                            >
                              {t("login_page.guest_dashboard", "My Photos")}
                            </Link>
                          )}
                          <Link
                            to="/profile"
                            className="block bg-secondary/10 hover:bg-secondary/20 text-foreground font-semibold py-3 px-4 rounded-lg transition-all duration-300 text-center"
                          >
                            {t("login_page.profile", "Profile")}
                          </Link>
                        </div>

                        <Link
                          to="/"
                          className="block w-full border-2 border-primary text-primary hover:bg-primary/5 font-semibold py-3 px-6 rounded-lg transition-all duration-300 text-center"
                        >
                          {t("login_page.go_home", "Go to Home")}
                        </Link>
                      </div>
                    </motion.div>
                  </SignedIn>
                </div>
              </div>

              {/* Card Footer */}
              <div className="bg-muted/70 dark:bg-muted/20 px-8 py-4 border-t border-border transition-colors">
                <div className="flex justify-center space-x-6">
                  <Link
                    to="/help"
                    className="text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    {t("login_page.help", "Help")}
                  </Link>
                  <Link
                    to="/privacy"
                    className="text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    {t("login_page.privacy", "Privacy")}
                  </Link>
                  <Link
                    to="/terms"
                    className="text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    {t("login_page.terms", "Terms")}
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LoginPage;
