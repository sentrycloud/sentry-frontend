import {BrowserRouter, Routes, Route} from "react-router-dom";
import CoreLayout from "./layouts/CoreLayout";
import Dashboard from "./views/Dashboard";
import Metric from "./views/Metric";
import Contact from "./views/Contact";
import Alarm from "./views/Alarm";
import NotFound from "./views/NotFound";
import ChartDetail from "./views/Dashboard/ChartDetail";

function App() {
  return (
    <BrowserRouter>
      <Routes>
          <Route path={"/"} element={<CoreLayout />}>
            <Route index element={<Dashboard />} />
              <Route path={"dashboard"} element={<Dashboard />} />
              <Route path={"dashboard/:id"} element={<Dashboard />} />
              <Route path={"dashboard/:dashboardId/chart/:chartId"} element={<ChartDetail />} />
              <Route path={"metric"} element={<Metric />} />
              <Route path={"contact"} element={<Contact />} />
              <Route path={"alarm"} element={<Alarm />} />
          </Route>
          <Route path={"*"} element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
