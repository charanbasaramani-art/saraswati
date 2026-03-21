import { ReactNode, forwardRef } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { ChatBot } from '../chatbot/ChatBot';

interface LayoutProps {
  children: ReactNode;
  showFooter?: boolean;
}

export const Layout = forwardRef<HTMLDivElement, LayoutProps>(
  ({ children, showFooter = true }, ref) => {
    return (
      <div ref={ref} className="min-h-screen flex flex-col bg-background relative overflow-hidden theme-transition parchment-bg">
        {/* Animated gradient orbs */}
        <div className="gradient-orb gradient-orb-1" />
        <div className="gradient-orb gradient-orb-2" />
        <div className="gradient-orb gradient-orb-3" />
        
        <Navbar />
        <main className="flex-1 relative z-10">
          {children}
        </main>
        {showFooter && <Footer />}
        
        <ChatBot />
      </div>
    );
  }
);

Layout.displayName = 'Layout';
