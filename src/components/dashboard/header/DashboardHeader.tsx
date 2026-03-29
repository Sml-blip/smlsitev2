'use client';

import { useState } from 'react';
import Logo from '@/components/logo/Logo';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import React from 'react';
import Notification from '../notificaton/Notification';
import DashboardMobileHeader from './DashboardMobileHeader';
import SeoAiChat from '@/components/dashboard/seo/SeoAiChat';

const DashboardHeader = () => {
  const [chatOpen, setChatOpen] = useState(false);
  const [preloadMsg, setPreloadMsg] = useState<string | undefined>();

  const handleOpenChat = (msg?: string) => {
    setPreloadMsg(msg);
    setChatOpen(true);
  };

  return (
    <>
      <header className="bg-white dark:bg-black shadow sticky top-0 left-0 right-0 z-50">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Notification onOpenChat={handleOpenChat} />
            <Button
              size={'sm'}
              variant={'destructive'}
              className="flex items-center gap-2"
            >
              <LogOut /> Exit
            </Button>
            <DashboardMobileHeader />
          </div>
        </div>
      </header>

      {/* SEO AI Chat — available on all dashboard pages */}
      <SeoAiChat
        open={chatOpen}
        onOpenChange={setChatOpen}
        preloadMessage={preloadMsg}
      />
    </>
  );
};

export default DashboardHeader;
