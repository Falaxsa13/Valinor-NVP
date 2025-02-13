import React, { useState, useEffect } from "react";
import {
  Menu,
  File,
  Save,
  FileInput,
  History,
  Printer,
  Share2,
  MoreHorizontal,
  Download,
  FileText,
  Settings,
  HelpCircle,
} from "lucide-react";

// FileMenu Component
const FileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { icon: <FileText size={16} />, label: "New", shortcut: "⌘N" },
    { icon: <FileInput size={16} />, label: "Open", shortcut: "⌘O" },
    { icon: <Save size={16} />, label: "Save", shortcut: "⌘S" },
    { icon: <Download size={16} />, label: "Download", shortcut: "⌘⇧S" },
    { icon: <Printer size={16} />, label: "Print", shortcut: "⌘P" },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded"
      >
        File
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white border rounded-md shadow-lg z-50">
          {menuItems.map((item, index) => (
            <button
              key={index}
              className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center justify-between"
              onClick={() => setIsOpen(false)}
            >
              <span className="flex items-center gap-2">
                {item.icon}
                {item.label}
              </span>
              <span className="text-xs text-gray-500">{item.shortcut}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// DocumentStats Component
interface Editor {
  state: {
    doc: {
      textContent: string;
    };
  };
}

const DocumentStats = ({ editor }: { editor: Editor }) => {
  const [stats, setStats] = useState({ words: 0, characters: 0 });

  useEffect(() => {
    if (editor) {
      const text = editor.state.doc.textContent;
      const words = text.trim().split(/\s+/).filter(Boolean).length;
      const characters = text.length;
      setStats({ words, characters });
    }
  }, [editor?.state.doc]);

  return (
    <div className="fixed bottom-4 right-4 text-sm text-gray-500">
      {stats.words} words {stats.characters} characters
    </div>
  );
};

// VersionHistory Component
const VersionHistory = () => {
  const [isOpen, setIsOpen] = useState(false);
  const versions = [
    { id: 1, date: new Date().toLocaleString(), author: "You" },
    {
      id: 2,
      date: new Date(Date.now() - 3600000).toLocaleString(),
      author: "You",
    },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded"
      >
        <History size={16} />
        Version history
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 w-80 bg-white border rounded-md shadow-lg z-50">
          <div className="p-3 border-b">
            <h3 className="font-medium">Version history</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {versions.map((version) => (
              <div
                key={version.id}
                className="p-3 hover:bg-gray-50 cursor-pointer border-b"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{version.author}</span>
                  <span className="text-xs text-gray-500">{version.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Main Menu Bar Component
interface MenuBarProps {
  editor: Editor;
}

const MenuBar = ({ editor }: MenuBarProps) => {
  return (
    <div className="flex items-center justify-between px-2 py-1 border-b bg-gray-50">
      <div className="flex items-center space-x-2">
        <FileMenu />
        <button className="px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded">
          Edit
        </button>
        <button className="px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded">
          View
        </button>
        <button className="px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded">
          Insert
        </button>
        <button className="px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded">
          Format
        </button>
        <button className="px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded">
          Tools
        </button>
      </div>

      <div className="flex items-center space-x-2">
        <VersionHistory />
        <button className="p-1 text-gray-700 hover:bg-gray-100 rounded">
          <Settings size={16} />
        </button>
        <button className="p-1 text-gray-700 hover:bg-gray-100 rounded">
          <HelpCircle size={16} />
        </button>
      </div>
    </div>
  );
};

export { MenuBar, DocumentStats, VersionHistory };
