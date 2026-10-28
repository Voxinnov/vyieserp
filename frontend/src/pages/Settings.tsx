import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    User,
    UserCog,
    ArrowLeft
} from 'lucide-react';

interface SettingsItemProps {
    icon: React.ComponentType<any>;
    title: string;
    description: string;
    color: string;
    bgColor: string;
    onClick?: () => void;
}

const SettingsItem: React.FC<SettingsItemProps> = ({ icon: Icon, title, description, color, bgColor, onClick }) => {
    return (
        <div
            className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            onClick={onClick}
        >
            <div className={`p-3 rounded-lg ${bgColor} shrink-0`}>
                <Icon className={`w-6 h-6 ${color}`} />
            </div>
            <div className="ml-4">
                <h3 className="font-medium text-gray-900">{title}</h3>
                <p className="text-sm text-gray-500 mt-1">{description}</p>
            </div>
        </div>
    );
};

const SettingsSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
    return (
        <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">{title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {children}
            </div>
        </div>
    );
};

const Settings = () => {
    const navigate = useNavigate();

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex items-center mb-8">
                <button
                    onClick={() => navigate(-1)}
                    className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-gray-600" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <SettingsSection title="User">
                    <SettingsItem
                        icon={User}
                        title="Users"
                        description="Add or edit the users, user roles, password and more."
                        color="text-emerald-500"
                        bgColor="bg-emerald-50"
                        onClick={() => navigate('/users')}
                    />
                    <SettingsItem
                        icon={UserCog}
                        title="User Roles"
                        description="Create or edit the user roles and allow or restrict control of the dashboard..."
                        color="text-amber-500"
                        bgColor="bg-amber-50"
                        onClick={() => navigate('/user-roles')}
                    />
                </SettingsSection>
            </div>
        </div>
    );
};

export default Settings;
