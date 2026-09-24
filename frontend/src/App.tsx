import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import LeadListPage from './pages/LeadListPage';
import LeadDetailPage from './pages/LeadDetailPage';
import WebhookTestPage from './pages/WebhookTestPage';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<LeadListPage />} />
        <Route path="/leads/:id" element={<LeadDetailPage />} />
        <Route path="/webhook-test" element={<WebhookTestPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
