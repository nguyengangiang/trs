import { Navigate, Route, Routes } from "react-router-dom";
import { AppProvider, useApp } from "./script";
import Header from "./Header";
import SampleRequest from "./SampleRequest.tsx";
import Schedule from "./Schedule";
import Report from "./Report";
import Modal from "./Modal.tsx";
import EditModal from "./EditModal.tsx";

function Toast() {
  const { toast } = useApp();
  if (!toast.visible) return null;
  return (
    <div
      className={`toast ${toast.ok ? "tok" : "terr"}`}
      style={{ display: "flex" }}
    >
      {toast.message}
    </div>
  );
}

function AppShell() {
  const { modalNo, editOpen, closeEditModal, saveEdit } = useApp();

  return (
    <>
      <Header />

      <Routes>
        <Route path="/" element={<Navigate to="/request" replace />} />
        <Route
          path="/request"
          element={
            <div className="view on" id="vf">
              <SampleRequest />
            </div>
          }
        />
        <Route
          path="/schedule"
          element={
            <div className="view on" id="vs">
              <Schedule />
            </div>
          }
        />
        <Route
          path="/report"
          element={
            <div
              className="view on"
              id="vr"
              style={{ flexDirection: "column" }}
            >
              <Report />
            </div>
          }
        />
        <Route path="*" element={<Navigate to="/request" replace />} />
      </Routes>

      {modalNo != null && <Modal />}

      {editOpen && (
        <EditModal
          closeEditModal={closeEditModal}
          closeEditModalDirect={closeEditModal}
          saveEdit={saveEdit}
        />
      )}

      <Toast />
    </>
  );
}

function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}

export default App;
