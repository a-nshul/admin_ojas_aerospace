import Breadcrumb from '@/app/(DashboardLayout)/layout/shared/breadcrumb/Breadcrumb';
import PageContainer from '@/app/components/container/PageContainer';
import AppCard from '@/app/components/shared/AppCard';
import ChatsApp from '@/app/components/apps/chats/index';

const Users = () => {

  return (
    <PageContainer title="Chat" description="this is Chat">
      <Breadcrumb title="User" subtitle="User Data" />
      <AppCard>
        <ChatsApp />
      </AppCard>
    </PageContainer>
  );
};

export default Users;
