
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { ProjectList } from './pages/ProjectList';
import { ProjectDashboard } from './pages/ProjectDashboard';
import { CreatorList } from './pages/CreatorList';
import { Settings } from './pages/Settings';
import { FinanceHQ } from './pages/FinanceHQ';
import { ReportingHub } from './pages/ReportingHub';
import { ZendeskOutreach } from './pages/ZendeskOutreach';
import { Project, ZendeskMacro, User } from './types';
import { ZENDESK_MACROS, MOCK_PROJECTS, MOCK_USERS } from './constants';
import { ToastProvider, useToast } from './components/Toast';
import { NotificationProvider, useNotifications } from './components/NotificationHub';
import { CommandPalette } from './components/CommandPalette';
import { LoginPage, PendingApprovalPage } from './components/AuthPages';

// Define page types for simple state-based router
type Page = 'projects' | 'creators' | 'project_detail' | 'settings' | 'finance' | 'reports' | 'zendesk';

// Wrapper component to use hooks
const AppContent = () => {
  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [currentPage, setCurrentPage] = useState<Page>('projects');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  // Theme State
  const [isDark, setIsDark] = useState(false);

  // Command Palette State
  const [isCmdOpen, setIsCmdOpen] = useState(false);

  // Centralized Macro State
  const [macros, setMacros] = useState<ZendeskMacro[]>(ZENDESK_MACROS);

  const { addNotification } = useNotifications();
  const { addToast } = useToast();

  // Dark Mode Toggle
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Global Command Key
  useEffect(() => {
    if (!currentUser || currentUser.status !== 'Approved') return;

    const down = (e: KeyboardEvent) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey))) {
        e.preventDefault();
        setIsCmdOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [currentUser]);

  const handleUpdateMacro = (updatedMacro: ZendeskMacro) => {
    setMacros(prev => prev.map(m => m.id === updatedMacro.id ? updatedMacro : m));
    addNotification('success', 'Macro Updated', `${updatedMacro.title} has been updated.`);
  };

  const handleNavigate = (page: string, project?: Project) => {
    if (project) {
      setSelectedProject(project);
      setCurrentPage('project_detail');
    } else {
      setCurrentPage(page as Page);
      if (page !== 'project_detail') {
        setSelectedProject(null);
      }
    }
  };

  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
    setCurrentPage('project_detail');
  };

  // Auth Handlers
  const handleLogin = (googleUser: Partial<User>) => {
    // 1. Check if user exists in mock DB
    const existingUser = MOCK_USERS.find(u => u.email === googleUser.email);
    
    if (existingUser) {
        setCurrentUser(existingUser);
        addToast('success', 'Welcome Back', `Logged in as ${existingUser.name}`);
    } else {
        // 2. Register as new Pending user
        const newUser: User = {
            id: `u-${Date.now()}`,
            name: googleUser.name || 'Unknown',
            email: googleUser.email || 'unknown',
            role: 'Viewer',
            status: 'Pending',
            avatar: googleUser.avatar
        };
        setCurrentUser(newUser);
        addToast('info', 'Account Created', 'Please request admin approval to continue.');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleDevApprove = () => {
      if (currentUser) {
          const approvedUser = { ...currentUser, status: 'Approved' as const, role: 'Manager' as const };
          setCurrentUser(approvedUser);
          addToast('success', 'Approver Mode', 'You simulated admin approval.');
      }
  };

  // --- RENDER LOGIC BASED ON AUTH STATE ---

  // 1. Not Logged In
  if (!currentUser) {
      return <LoginPage onLogin={handleLogin} />;
  }

  // 2. Pending Approval
  if (currentUser.status === 'Pending') {
      return (
        <PendingApprovalPage 
            user={currentUser} 
            onLogout={handleLogout} 
            onDevApprove={handleDevApprove}
        />
      );
  }

  // 3. Authenticated & Approved App Content
  const renderContent = () => {
    switch (currentPage) {
      case 'projects':
        return <ProjectList onSelectProject={handleSelectProject} />;
      case 'project_detail':
        return selectedProject ? (
          <ProjectDashboard 
            project={selectedProject} 
            onBack={() => handleNavigate('projects')}
            macros={macros}
            onUpdateMacro={handleUpdateMacro}
          />
        ) : (
          <ProjectList onSelectProject={handleSelectProject} />
        );
      case 'creators':
        return <CreatorList macros={macros} />;
      case 'zendesk':
        return <ZendeskOutreach />;
      case 'finance':
        return <FinanceHQ />;
      case 'reports':
        return <ReportingHub />;
      case 'settings':
        return <Settings />;
      default:
        return <ProjectList onSelectProject={handleSelectProject} />;
    }
  };

  return (
    <Layout 
      currentPage={currentPage} 
      onNavigate={handleNavigate} 
      onSearchClick={() => setIsCmdOpen(true)}
      isDark={isDark}
      toggleTheme={() => setIsDark(!isDark)}
      projectName={selectedProject?.title}
    >
      {renderContent()}
      <CommandPalette 
        isOpen={isCmdOpen} 
        onClose={() => setIsCmdOpen(false)} 
        onNavigate={handleNavigate}
        projects={MOCK_PROJECTS}
      />
    </Layout>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </ToastProvider>
  );
}
