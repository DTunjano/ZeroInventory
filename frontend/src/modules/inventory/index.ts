// Domain
export { type InventoryStatusType, type InventoryProduct, type InventorySummary, calculateInventoryStatus, getInventoryStatusMeta } from './domain/inventory.models'

// Infrastructure
export { inventoryService } from './infrastructure/inventory.service'

// Application
export { useInventoryProducts, useInventorySummary } from './application/use-inventory'

// Components
export { StatCard } from './components/stat-card'
export { InventoryStatusBadge } from './components/inventory-status-badge'
export { InventoryTable } from './components/inventory-table'
export { InventoryFilterBar } from './components/inventory-filter-bar'

// Presentation
export { AdminInventoryPage } from './presentation/admin-inventory-page'
