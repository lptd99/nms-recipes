import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { DataProvider } from "./hooks/useAppData";
import { CatalogPage } from "./pages/CatalogPage";
import { CookingPage } from "./pages/CookingPage";
import { CraftingPage } from "./pages/CraftingPage";
import { HomePage } from "./pages/HomePage";
import { ItemPage } from "./pages/ItemPage";
import { RefiningPage } from "./pages/RefiningPage";

export default function App() {
  return (
    <DataProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="refining" element={<RefiningPage />} />
            <Route path="cooking" element={<CookingPage />} />
            <Route path="crafting" element={<CraftingPage />} />
            <Route path="catalog/:category" element={<CatalogPage />} />
            <Route path="item/:id" element={<ItemPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </DataProvider>
  );
}
