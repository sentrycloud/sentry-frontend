import {BrowserRouter, Routes, Route} from "react-router-dom";
import CoreLayout from "./layouts/CoreLayout";
import Dashboard from "./views/Dashboard";
import Chart from "./views/Chart";
import Metric from "./views/Metric";
import Contact from "./views/Contact";
import Alarm from "./views/Alarm";
import NotFound from "./views/NotFound";

function App() {
  return (
    <BrowserRouter>
      <Routes>
          <Route path={"/"} element={<CoreLayout />}>
            <Route index element={<Metric />} />
            <Route path={"dashboard"} element={<Dashboard />} />
            <Route path={"chart"} element={<Chart />} />
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
