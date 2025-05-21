import { useRoutes } from "react-router-dom";
import Bot from "./pages/Bot";
import AdvancedBot from "./pages/AdvancedBot";
import AuthLayout from "./layouts/AuthLayout";

import BotBoard from "./layouts/BotBoard";
import LoginPage from "./pages/LoginPage";

export const Router = () => {
  return useRoutes([
    {
      path: "/auth",
      element: <AuthLayout />,
      children: [{ path: "login", element: <LoginPage /> }],
    },
    {
      path: "/",
      element: <BotBoard />,
      children: [
        { path: "", element: <Bot /> },
        { path: "bot", element: <Bot /> },
        { path: "advanced-bot", element: <AdvancedBot /> },
      ],
    },
  ]);
};
