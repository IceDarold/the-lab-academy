
import * as React from 'react';
import { PanelGroup, Panel, PanelResizeHandle, PanelGroupProps } from 'react-resizable-panels';

// Безопасный storage-адаптер для предотвращения падений
const safeStorage = {
  getItem(key: string): string | null {
    try {
      const v = localStorage.getItem(key);
      if (v == null || v === '' || v === 'undefined' || v === 'null') return null;
      // Проверяем, что это валидный JSON, прежде чем вернуть
      JSON.parse(v);
      return v;
    } catch {
      // Если в localStorage мусор, игнорируем его
      console.warn(`[safeStorage] Removed invalid JSON from localStorage for key: ${key}`);
      localStorage.removeItem(key);
      return null;
    }
  },
  setItem(key: string, value: string) {
    try {
      // Сохраняем только валидный JSON
      JSON.parse(value);
      localStorage.setItem(key, value);
    } catch {
      console.error(`[safeStorage] Ignored attempt to save invalid JSON for key: ${key}`);
    }
  },
};

const ResizablePanelGroup: React.FC<PanelGroupProps> = ({ className, ...props }) => (
  <PanelGroup
    className={`flex h-full w-full data-[panel-group-direction=vertical]:flex-col ${className}`}
    // Если используется autoSaveId, автоматически подставляем безопасный storage
    storage={props.autoSaveId ? safeStorage : undefined}
    {...props}
  />
);

const ResizablePanel = Panel;

const ResizableHandle: React.FC<React.ComponentProps<typeof PanelResizeHandle> & { withHandle?: boolean }> = ({ withHandle, className, ...props }) => (
  <PanelResizeHandle
    className={`relative flex w-px items-center justify-center bg-gray-700 after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-500 focus-visible:ring-offset-1 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 [&[data-panel-group-direction=vertical]>div]:rotate-90 ${className}`}
    {...props}
  >
    {withHandle && (
      <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-gray-800 border-gray-600">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-2.5 w-2.5">
          <path d="M9 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>
          <path d="M9 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>
          <path d="M9 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>
          <path d="M15 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>
          <path d="M15 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>
          <path d="M15 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>
        </svg>
      </div>
    )}
  </PanelResizeHandle>
);

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
