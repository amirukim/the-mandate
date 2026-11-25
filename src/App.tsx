import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import { useAuthStore } from "./stores/auth-store";
import { RequireCampaign } from "./components/RequireCampaign";
import { GameLayout } from "./layouts/GameLayout";
import { MainMenu } from "./pages/MainMenu";
import { NewGame } from "./pages/NewGame";
import { Login, Register } from "./pages/Auth";
import { CampaignSelect } from "./pages/CampaignSelect";
import { Office } from "./pages/Office";
import { HomeScreen } from "./components/ipad/HomeScreen";
import { Messages } from "./pages/Messages";
import { Briefing } from "./pages/Briefing";
import { Summary } from "./pages/Summary";
import { Cabinet } from "./pages/Cabinet";
import { Parliament } from "./pages/Parliament";
import { Parties } from "./pages/Parties";
import { FederalStateRelations } from "./pages/FederalState";
import { Diplomacy } from "./pages/Diplomacy";
import { Security } from "./pages/Security";
import { News } from "./pages/News";
import { History } from "./pages/History";
import { Saves } from "./pages/Saves";
import { Settings } from "./pages/Settings";
import { Fallen } from "./pages/Fallen";

/* Recharts is the heaviest dependency; load chart screens only when visited. */
const Economy = lazy(() =>
  import("./pages/Economy").then((m) => ({ default: m.Economy })),
);
const Overview = lazy(() =>
  import("./pages/Overview").then((m) => ({ default: m.Overview })),
);

export default function App() {
  const init = useAuthStore((s) => s.init);

  useEffect(() => {
    init();
  }, [init]);

  return (
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <Suspense
          fallback={
            <div className="min-h-screen bg-paper flex items-center justify-center">
              <p className="kicker">Loading the ledger</p>
            </div>
          }
        >
          <Routes>
          <Route path="/" element={<MainMenu />} />
          <Route path="/new" element={<NewGame />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/campaigns" element={<CampaignSelect />} />
          <Route
            path="/game"
            element={
              <RequireCampaign>
                <GameLayout />
              </RequireCampaign>
            }
          >
            <Route index element={<Navigate to="/game/home" replace />} />
            <Route path="home" element={<HomeScreen />} />
            <Route path="messages" element={<Messages />} />
            <Route path="office" element={<Office />} />
            <Route path="briefing" element={<Briefing />} />
            <Route path="summary" element={<Summary />} />
            <Route path="overview" element={<Overview />} />
            <Route path="cabinet" element={<Cabinet />} />
            <Route path="parliament" element={<Parliament />} />
            <Route path="economy" element={<Economy />} />
            <Route path="parties" element={<Parties />} />
            <Route path="states" element={<FederalStateRelations />} />
            <Route path="diplomacy" element={<Diplomacy />} />
            <Route path="security" element={<Security />} />
            <Route path="news" element={<News />} />
            <Route path="history" element={<History />} />
            <Route path="saves" element={<Saves />} />
            <Route path="settings" element={<Settings />} />
            <Route path="fallen" element={<Fallen />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </Suspense>
      </BrowserRouter>
    </MotionConfig>
  );
}
