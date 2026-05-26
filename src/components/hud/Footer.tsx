import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="py-10 border-t border-white/10 px-4 md:px-8 bg-blueprint-panel/40 relative z-10 text-center font-mono text-[11px] text-slate-500">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          © 2026 Hilmi Abdurrahman. Hak Cipta Dilindungi Undang-Undang.
        </div>
        <div className="flex gap-4">
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-cyber-cyan transition-colors"
          >
            LinkedIn
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-cyber-cyan transition-colors"
          >
            GitHub
          </a>
          <a
            href="https://arcgis.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-cyber-cyan transition-colors"
          >
            ArcGIS Online
          </a>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
