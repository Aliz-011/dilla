import { Separator } from '@/components/ui/separator';
import { UpdateProfileForm } from './update-profile-form';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

const ProfilePage = async () => {
  return (
    <main className="flex-1 lg:max-w-2xl">
      <div className="space-y-6">
        <div>
          <h3 className="text-2xl font-bold tracking-tight">Profile</h3>
          <p className="text-sm text-muted-foreground">
            Manage your account settings and set e-mail preferences.
          </p>
        </div>
        <Separator />
        <div className="my-2">
          <Button
            variant="secondary"
            className="inline-flex items-center"
            size="sm"
            asChild
          >
            <Link href="/">
              <ChevronLeft /> Home
            </Link>
          </Button>
        </div>
        <UpdateProfileForm />
      </div>
    </main>
  );
};
export default ProfilePage;
