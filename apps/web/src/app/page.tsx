'use client';

import Link from 'next/link';
import { Nav } from '@/components/Nav';
import { GitCommitVertical, Zap, Palette, BarChart3, ChevronRight, Info, Grid3x3, Layers, Eye, TrendingUp } from 'lucide-react';

function LandingContent() {
  return (
    <div className="min-h-screen bg-surface text-text">
      <Nav />

      <section className="py-20 sm:py-32 px-6 bg-linear-to-b from-surface via-surface to-surface-secondary">
        <div className="max-w-5xl mx-auto">
            <div className="max-w-3xl mx-auto text-center space-y-8">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight">
              Build Forms.{' '}
              <span className="text-primary">Fast.</span>
            </h1>

            <p className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto">
              A grid based canvas that lets you build forms the way you design UIs; precise, flexible, and embeddable.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
              <Link
              href="/how-it-works"
              aria-label="How it works"
              className="inline-flex w-full sm:w-auto items-center px-8 py-3 border border-border-subtle text-text rounded-xl font-semibold text-lg hover:bg-surface-secondary transition justify-center"
              >
              <Info className="w-5 h-5 mr-2" />
              How it works
              </Link>
              <Link
              href="/forms"
              className="inline-flex w-full sm:w-auto items-center px-8 py-3 bg-primary text-surface rounded-xl font-semibold text-lg hover:bg-primary-hover transition justify-center"
              >
              Start Building
              <ChevronRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
            </div>

          <div className="pt-20 sm:pt-28 px-6 grid sm:grid-cols-3 gap-12">
            <div className="text-center space-y-3">
              <div className="flex justify-center">
                <Zap className="w-10 h-10 text-primary" />
              </div>
              <h3 className="font-bold text-lg">Simple & Fast</h3>
              <p className="text-text-secondary text-sm">
                Drag, drop, done. Build forms in minutes.
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="flex justify-center">
                <Palette className="w-10 h-10 text-primary" />
              </div>
              <h3 className="font-bold text-lg">Your Style</h3>
              <p className="text-text-secondary text-sm">
                Customize everything to match your brand.
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="flex justify-center">
                <BarChart3 className="w-10 h-10 text-primary" />
              </div>
              <h3 className="font-bold text-lg">Collect & Analyze</h3>
              <p className="text-text-secondary text-sm">
                View responses, export data, get insights.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-28 px-6 bg-surface-secondary">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-black mb-4">
              This is not Just Forms.
            </h2>
            <p className="text-xl text-text-secondary">
              This is interface-level form design.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-surface border border-border rounded-2xl p-8 space-y-6 hover:border-primary transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                  <Grid3x3 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">The Canvas</h3>
                  <p className="text-text-secondary text-sm mb-4">
                    Drag components onto a grid. Snap to alignment. Resize with precision. Design forms like you design UIs.
                  </p>
                  <div className="bg-surface border border-border rounded-lg p-4 space-y-2">
                    <div className="h-8 bg-primary/5 border border-border-subtle rounded flex items-center px-3 hover:border-primary transition-colors">
                      <span className="text-xs text-text-secondary">Input field with snapping</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="h-8 bg-primary/5 border border-border-subtle rounded hover:border-primary transition-colors"></div>
                      <div className="h-8 bg-primary/5 border border-border-subtle rounded hover:border-primary transition-colors"></div>
                    </div>
                    <div className="h-12 bg-primary/5 border border-border-subtle rounded hover:border-primary transition-colors"></div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="h-8 bg-primary/5 border border-border-subtle rounded hover:border-primary transition-colors"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-surface border border-border rounded-2xl p-8 space-y-6 hover:border-primary transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                  <Layers className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Component Panel</h3>
                  <p className="text-text-secondary text-sm mb-4">
                    Pre-built components ready to drop. Text, checkboxes, dropdowns, file uploads—all styled and functional.
                  </p>
                  <div className="bg-surface border border-border rounded-lg p-3 space-y-2">
                    {['Text Input', 'Checkbox', 'Dropdown', 'File Upload'].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 px-3 py-2 bg-surface-secondary border border-border-subtle rounded text-xs hover:border-primary transition-colors cursor-pointer">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface border border-border rounded-2xl p-8 space-y-6 hover:border-primary transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                  <Eye className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Published Form</h3>
                  <p className="text-text-secondary text-sm mb-4">
                    One-click publish. Get a shareable link. Embed anywhere. Fully responsive and styled.
                  </p>
                  <div className="bg-surface border border-border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-secondary">form.nimbl.io/contact</span>
                      <div className="px-2 py-1 bg-primary/10 text-primary rounded">Live</div>
                    </div>
                    <div className="h-24 bg-primary/5 border border-border-subtle rounded flex items-center justify-center">
                      <span className="text-xs text-text-secondary">Your form preview</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface border border-border rounded-2xl p-8 space-y-6 hover:border-primary transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Response Dashboard</h3>
                  <p className="text-text-secondary text-sm mb-4">
                    Real-time responses. Filter, sort, export. See trends at a glance.
                  </p>
                  <div className="bg-surface border border-border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs mb-3">
                      <span className="font-semibold">156 responses</span>
                      <span className="text-text-secondary">Last 7 days</span>
                    </div>
                    {[60, 85, 40, 95].map((width, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-16 text-xs text-text-secondary">Entry {i + 1}</div>
                        <div className="flex-1 h-6 bg-primary/5 rounded-full overflow-hidden border border-border-subtle hover:border-primary transition-colors">
                          <div className="h-full bg-primary/30" style={{ width: `${width}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-6 px-6 border-t border-border-subtle text-text-secondary text-md">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2025 NIMBL</p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1">
              <GitCommitVertical className="w-5 h-5" />
              <span>v0.1.0</span>
            </div>
            <p>|</p>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-text transition-colors"
                aria-label="GitHub"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                  <path d="M9 19c-4.3 1.4 -4.3 -2.5 -6 -3m12 5v-3.5c0 -1 .1 -1.4 -.5 -2c2.8 -.3 5.5 -1.4 5.5 -6a4.6 4.6 0 0 0 -1.3 -3.2a4.2 4.2 0 0 0 -.1 -3.2s-1.1 -.3 -3.5 1.3a12.3 12.3 0 0 0 -6.2 0c-2.4 -1.6 -3.5 -1.3 -3.5 -1.3a4.2 4.2 0 0 0 -.1 3.2a4.6 4.6 0 0 0 -1.3 3.2c0 4.6 2.7 5.7 5.5 6c-.6 .6 -.6 1.2 -.5 2v3.5" />
                </svg>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-text transition-colors"
                aria-label="LinkedIn"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                  <path d="M8 11v5" />
                  <path d="M8 8v.01" />
                  <path d="M12 16v-5" />
                  <path d="M16 16v-3a2 2 0 1 0 -4 0" />
                  <path d="M3 7a4 4 0 0 1 4 -4h10a4 4 0 0 1 4 4v10a4 4 0 0 1 -4 4h-10a4 4 0 0 1 -4 -4z" />
                </svg>
              </a>
              <a
                href="https://instagram.com/geeked.out.loud"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-text transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                  <path d="M4 8a4 4 0 0 1 4 -4h8a4 4 0 0 1 4 4v8a4 4 0 0 1 -4 4h-8a4 4 0 0 1 -4 -4z" />
                  <path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
                  <path d="M16.5 7.5v.01" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function Landing() {
  return <LandingContent />;
}