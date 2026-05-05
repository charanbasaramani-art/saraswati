import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Flower2 } from 'lucide-react';
import { SRAILogo } from '@/components/SRAILogo';

export const Footer = forwardRef<HTMLElement>((props, ref) => {
  return (
    <footer ref={ref} className="border-t border-border bg-card relative" {...props}>
      {/* Subtle heritage pattern */}
      <div className="absolute inset-0 heritage-pattern pointer-events-none" />
      
      <div className="container py-12 relative z-10">
        {/* Ornamental top border */}
        <div className="ornamental-divider mb-8">
          <Flower2 className="ornamental-divider-icon h-4 w-4 flex-shrink-0" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link to="/" className="inline-block">
              <SRAILogo size="md" />
            </Link>
            <p className="text-muted-foreground text-sm">
              Ancient wisdom empowering modern careers. Analyze resumes, detect skill gaps, and optimize your career with AI.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4 font-serif">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link></li>
              <li><Link to="/jobs" className="text-muted-foreground hover:text-foreground transition-colors">Job Listings</Link></li>
              <li><Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">About</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4 font-serif">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Resume Tips</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Career Guide</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Interview Prep</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4 font-serif">Connect</h4>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} SRAI – Saraswati Resume Artificial Intelligence. Ancient Wisdom Empowering Modern Careers — A CHARAN's Vision.</p>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = 'Footer';
