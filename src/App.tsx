import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/common/Layout';
import { HomePage } from './pages/HomePage';
import { FarmerConditionsPage } from './pages/farmer/FarmerConditionsPage';
import { FarmerAnalyzingPage } from './pages/farmer/FarmerAnalyzingPage';
import { FarmerResultPage } from './pages/farmer/FarmerResultPage';
import { ConsumerQuizPage } from './pages/consumer/ConsumerQuizPage';
import { ConsumerResultPage } from './pages/consumer/ConsumerResultPage';
import { AdminLikesPage } from './pages/AdminLikesPage';
import { AboutPage } from './pages/AboutPage';
import { MarketPage } from './pages/MarketPage';
import { ROUTES } from './lib/routes';

/**
 * 라우트 정의만 담당합니다.
 * 새 화면을 추가할 때는 해당 화면을 pages/에 만든 뒤
 * 이 파일에 <Route> 한 줄만 추가하면 됩니다.
 */
function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path={ROUTES.home} element={<HomePage />} />
        <Route path={ROUTES.farmerConditions} element={<FarmerConditionsPage />} />
        <Route path={ROUTES.farmerAnalyzing} element={<FarmerAnalyzingPage />} />
        <Route path={ROUTES.farmerResult} element={<FarmerResultPage />} />
        <Route path={ROUTES.consumerResult} element={<ConsumerResultPage />} />
        <Route path={ROUTES.consumer} element={<ConsumerQuizPage />} />
        <Route path={ROUTES.admin} element={<AdminLikesPage />} />
        <Route path={ROUTES.about} element={<AboutPage />} />
        <Route path={ROUTES.market} element={<MarketPage />} />
      </Route>
    </Routes>
  );
}

export default App;
