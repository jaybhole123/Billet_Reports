import React, { useState, useEffect } from 'react';
import BilletsStock from './pages/BilletsStock';
import NormalMaterialPurchase from './pages/NormalMaterialPurchase';
import LsmFinishStock from './pages/LsmFinishStock';
import HeavyMillFinishStockKamDhenu from './pages/HeavyMillFinishStockKamDhenu';
import HeavyMillStockJindal from './pages/HeavyMillStockJindal';
import SheetStructureSaleTotalOutgoing from './pages/SheetStructureSaleTotalOutgoing';
import YesterdayIncoming from './pages/YesterdayIncoming';
import YesterdayOutgoing from './pages/YesterdayOutgoing';
import TotalOutgoing from './pages/TotalOutgoing';
import HeavyStructureProduction from './pages/HeavyStructureProduction';
import HeavyLightProduction from './pages/HeavyLightProduction';
import MisSheet from './pages/MisSheet';

import {
  BoxIcon,
  CartIcon,
  FactoryIcon,
  LayersIcon,
  BuildingIcon,
  FileSpreadsheetIcon,
  ArrowDownToLineIcon,
  ArrowUpFromLineIcon,
  TruckIcon,
  SettingsIcon,
  WrenchIcon,
  BarChartIcon,
  ShieldCheckIcon,
} from './components/Icons';

const navSections = [
  {
    group: 'Stock Management',
    items: [
      { id: 'billets-stock', label: 'Billets Stock (LSM & MSM)', Icon: BoxIcon, component: BilletsStock },
      { id: 'normal-material-purchase', label: 'Normal Material Purchase', Icon: CartIcon, component: NormalMaterialPurchase },
      { id: 'lsm-finish-stock', label: 'LSM Finish Stock', Icon: FactoryIcon, component: LsmFinishStock },
      { id: 'heavy-mill-finish-stock-kam-dhenu', label: 'Heavy Mill Finish (KamDhenu)', Icon: LayersIcon, component: HeavyMillFinishStockKamDhenu },
      { id: 'heavy-mill-stock-jindal', label: 'Heavy Mill Stock (Jindal)', Icon: BuildingIcon, component: HeavyMillStockJindal },
    ],
  },
  {
    group: 'Sales & Dispatch',
    items: [
      { id: 'sheet-structure-sale-total-outgoing', label: 'Sheet Structure Sale Outgoing', Icon: FileSpreadsheetIcon, component: SheetStructureSaleTotalOutgoing },
      { id: 'yesterday-incoming', label: 'Yesterday Incoming', Icon: ArrowDownToLineIcon, component: YesterdayIncoming },
      { id: 'yesterday-outgoing', label: 'Yesterday Outgoing', Icon: ArrowUpFromLineIcon, component: YesterdayOutgoing },
      { id: 'total-outgoing', label: 'Total Billate Outgoing', Icon: TruckIcon, component: TotalOutgoing },
    ],
  },
  {
    group: 'Plant Production',
    items: [
      { id: 'heavy-structure-production', label: 'Heavy Structure Production', Icon: SettingsIcon, component: HeavyStructureProduction },
      { id: 'heavy-light-production', label: 'Heavy Light Production', Icon: WrenchIcon, component: HeavyLightProduction },
    ],
  },
  {
    group: 'Executive MIS & Reports',
    items: [
      { id: 'mis-sheet', label: 'MIS Sheet (Consolidated)', Icon: BarChartIcon, component: MisSheet },
    ],
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    return hash || 'billets-stock';
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Clear initial dummy mock data from localStorage if not already cleared
    try {
      const isCleared = localStorage.getItem('dummy_data_cleared_v2');
      if (!isCleared) {
        localStorage.removeItem('bill_reg');
        localStorage.removeItem('wire_reg');
        localStorage.removeItem('sauda_reg');
        localStorage.removeItem('hmstock_jindal');
        localStorage.removeItem('hmstock2');
        localStorage.removeItem('hsm_rep');
        localStorage.removeItem('lsm_rep');
        localStorage.removeItem('billets_stock');
        localStorage.removeItem('material_purchase');
        localStorage.removeItem('lsm_finish_stock_v2');
        localStorage.removeItem('etl_table');
        localStorage.setItem('dummy_data_cleared_v2', 'true');
      }
    } catch (e) {}

    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        setActiveTab(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleSelectTab = (id) => {
    setActiveTab(id);
    window.location.hash = id;
    setSidebarOpen(false);
  };

  // Find currently selected item
  let activeItem = null;
  for (const group of navSections) {
    const found = group.items.find((item) => item.id === activeTab);
    if (found) {
      activeItem = found;
      break;
    }
  }

  // Fallback to first tab if not found
  const CurrentComponent = activeItem ? activeItem.component : navSections[0].items[0].component;
  const currentTitle = activeItem ? activeItem.label : navSections[0].items[0].label;

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`} id="sidebar">
        <div className="brand">
          <div className="brand-logo-wrap">
            <span className="brand-icon">
              <FactoryIcon size={22} color="#ffffff" />
            </span>
            <div className="brand-text">
              <span className="brand-name">HINDUSTAN DHAATU</span>
              <small className="brand-sub">Smart Plant System</small>
            </div>
          </div>
        </div>

        <div className="sidebar-scroll">
          {navSections.map((sec) => (
            <div key={sec.group} className="nav-group">
              <div className="group-title">{sec.group}</div>
              <ul className="nav">
                {sec.items.map((item) => {
                  const isActive = activeTab === item.id;
                  const ItemIcon = item.Icon;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        className={`nav-item-btn ${isActive ? 'active' : ''}`}
                        onClick={() => handleSelectTab(item.id)}
                      >
                        <span className="nav-item-icon">
                          {ItemIcon && <ItemIcon size={16} color={isActive ? '#c2410c' : '#fed7aa'} />}
                        </span>
                        <span className="nav-item-text">{item.label}</span>
                        {isActive && <span className="nav-active-pip" />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          <div className="plant-status-pill">
            <span className="status-dot-live" />
            <span>Plant Live System</span>
          </div>
        </div>
      </aside>

      {/* Mobile Backdrop */}
      <div
        className={`backdrop ${sidebarOpen ? 'show' : ''}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Main Content Area */}
      <main className="main">
        <div className="topbar">
          <button
            type="button"
            className="menu-btn"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            &#9776;
          </button>
          <span className="top-title">{currentTitle}</span>
        </div>

        <section className="page-container">
          <CurrentComponent />
        </section>
      </main>
    </div>
  );
}
