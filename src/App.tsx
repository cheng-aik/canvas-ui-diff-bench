import React from 'react';

export default function App() {
  return (
    <div className="h-screen w-screen flex flex-col bg-zinc-950 text-zinc-100">
      <header className="h-12 border-b border-zinc-800 px-4 flex items-center justify-between">
        <span className="font-semibold text-sm">Canvas UI Diff Bench</span>
      </header>
      <main className="flex-1 flex overflow-hidden" />
    </div>
  );
}
