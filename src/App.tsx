import { BackgroundMusic } from './components/layout/BackgroundMusic';
import { PayrollPage } from './pages/PayrollPage';
import { MaintenancePage } from './pages/MaintenancePage';
import { MAINTENANCE_MODE } from './constants/maintenance';

export default function App() {
  if (MAINTENANCE_MODE) return <MaintenancePage />;

  return (
    <>
      <BackgroundMusic />
      <PayrollPage />
    </>
  );
}
