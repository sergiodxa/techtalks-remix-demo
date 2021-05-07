import { Outlet } from "react-router-dom";

export default function View() {
  return (
    <main>
      <h1>Articles</h1>
      <Outlet />
    </main>
  );
}
