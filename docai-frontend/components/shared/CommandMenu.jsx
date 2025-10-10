import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Command } from 'cmdk';
import { 
  Home, Upload, MessageSquare, Info, Settings, 
  FileText, Search, Moon, Sun, X 
} from 'lucide-react';

export const CommandMenu = ({ open, onOpenChange }) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  useEffect(() => {
    const down = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(true);
      }
      if (e.key === 'Escape') {
        onOpenChange(false);
      }
    };

    const handleOpenCommand = () => {
      onOpenChange(true);
    };

    document.addEventListener('keydown', down);
    window.addEventListener('open-command-menu', handleOpenCommand);
    return () => {
      document.removeEventListener('keydown', down);
      window.removeEventListener('open-command-menu', handleOpenCommand);
    };
  }, [onOpenChange]);

  const handleSelect = (callback) => {
    callback();
    onOpenChange(false);
    setSearch('');
  };

  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
  };

  const pages = [
    { icon: Home, label: 'Home', path: '/', keywords: 'home landing' },
    { icon: Upload, label: 'Upload Documents', path: '/upload', keywords: 'upload pdf file document' },
    { icon: MessageSquare, label: 'Chat', path: '/chat', keywords: 'chat conversation talk' },
    { icon: Info, label: 'About', path: '/about', keywords: 'about info information' },
    { icon: Settings, label: 'Settings', path: '/settings', keywords: 'settings preferences config' },
  ];

  const actions = [
    { icon: Moon, label: 'Toggle Dark Mode', action: toggleTheme, keywords: 'dark light theme mode' },
  ];

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
        onClick={() => onOpenChange(false)}
      />

      {/* Command Menu */}
      <div className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-2xl z-50 px-4">
        <Command 
          className="bg-white dark:bg-slate-900 border border-purple-300/50 dark:border-purple-500/30 rounded-2xl shadow-2xl overflow-hidden"
          shouldFilter={false}
        >
          {/* Search Input */}
          <div className="flex items-center border-b border-purple-300/50 dark:border-purple-500/30 px-4">
            <Search className="w-5 h-5 text-slate-600 dark:text-slate-400 mr-3" />
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Search for pages and actions..."
              className="flex-1 bg-transparent py-4 text-slate-900 dark:text-white placeholder:text-slate-600 dark:placeholder:text-slate-400 outline-none"
            />
            <button
              onClick={() => onOpenChange(false)}
              className="p-2 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            </button>
          </div>

          <Command.List className="max-h-[400px] overflow-y-auto p-2">
            <Command.Empty className="py-8 text-center text-sm text-slate-600 dark:text-slate-400">
              No results found.
            </Command.Empty>

            {/* Pages */}
            <Command.Group heading="Pages" className="text-xs font-semibold text-slate-600 dark:text-slate-400 px-2 py-2">
              {pages.map((page) => {
                const Icon = page.icon;
                return (
                  <Command.Item
                    key={page.path}
                    value={`${page.label} ${page.keywords}`}
                    onSelect={() => handleSelect(() => navigate(page.path))}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors data-[selected=true]:bg-purple-100 dark:data-[selected=true]:bg-purple-900/30"
                  >
                    <Icon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <span className="text-sm font-medium text-slate-900 dark:text-white">{page.label}</span>
                  </Command.Item>
                );
              })}
            </Command.Group>

            {/* Actions */}
            <Command.Group heading="Actions" className="text-xs font-semibold text-slate-600 dark:text-slate-400 px-2 py-2 mt-2">
              {actions.map((action, i) => {
                const Icon = action.icon;
                return (
                  <Command.Item
                    key={i}
                    value={`${action.label} ${action.keywords}`}
                    onSelect={() => handleSelect(action.action)}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors data-[selected=true]:bg-purple-100 dark:data-[selected=true]:bg-purple-900/30"
                  >
                    <Icon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <span className="text-sm font-medium text-slate-900 dark:text-white">{action.label}</span>
                  </Command.Item>
                );
              })}
            </Command.Group>
          </Command.List>

          {/* Footer */}
          <div className="border-t border-purple-300/50 dark:border-purple-500/30 px-4 py-3 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 rounded text-slate-900 dark:text-white font-mono">↑</kbd>
                <kbd className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 rounded text-slate-900 dark:text-white font-mono">↓</kbd>
                <span>Navigate</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 rounded text-slate-900 dark:text-white font-mono">↵</kbd>
                <span>Select</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 rounded text-slate-900 dark:text-white font-mono">Esc</kbd>
              <span>Close</span>
            </div>
          </div>
        </Command>
      </div>
    </>
  );
};

export default CommandMenu;