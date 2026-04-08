import { AuthHeader } from '@/components/AuthHeader';
import { ProfileSettings } from '@/components/ProfileSettings';

export default function SettingsPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <AuthHeader />
      <div className="p-4 md:p-8">
        <ProfileSettings />
      </div>
    </main>
  );
}
