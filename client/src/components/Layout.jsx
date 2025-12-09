import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Layout() {
    const location = useLocation();

    const navItems = [
        { path: '/course-details', label: 'Student List Information', icon: FileText },
        { path: '/course-outcomes', label: 'Course Outcomes', icon: FileText },
        { path: '/question-paper', label: 'Question Paper', icon: FileText },
    ];

    return (
        <div className="flex h-screen bg-background text-foreground">
            {/* Sidebar */}
            <aside className="w-64 border-r border-border bg-card">
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-primary">LMS Tools</h1>
                </div>
                <nav className="px-4 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                                    isActive
                                        ? "bg-primary text-primary-foreground"
                                        : "hover:bg-accent hover:text-accent-foreground"
                                )}
                            >
                                <Icon size={20} />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto p-8">
                <Outlet />
            </main>
        </div>
    );
}
