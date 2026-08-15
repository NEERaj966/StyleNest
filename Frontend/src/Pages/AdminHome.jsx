import React, { useCallback, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import HeroSection from '../Componants/HeroSection'
import CardSection from '../Componants/CardSection'

const statusClassMap = {
  Placed: 'text-[#8f3d25]',
  Preparing: 'text-blue-700',
  Ready: 'text-emerald-700',
  Delivered: 'text-[#24211d]',
  Cancelled: 'text-rose-700',
}

const AdminHome = () => {
  const [isAdmin] = useState(false)
  const [menuItems, setMenuItems] = useState([])
  const [orders, setOrders] = useState([])
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false)
  const [dashboardError, setDashboardError] = useState('')

  const fetchDashboardData = useCallback(async () => {
    setIsLoadingDashboard(true)
    setDashboardError('')

    try {
      const token = localStorage.getItem('adminToken')

      const [menuRes, ordersRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_BASE_URL}/api/v1/foodcards/my`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        axios.get(`${import.meta.env.VITE_BASE_URL}/api/v1/orders/admin`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ])

      setMenuItems(Array.isArray(menuRes.data?.data) ? menuRes.data.data : [])
      setOrders(Array.isArray(ordersRes.data?.data) ? ordersRes.data.data : [])
    } catch (err) {
      console.log(err)
      setDashboardError(err?.response?.data?.message || 'Unable to load dashboard data.')
    } finally {
      setIsLoadingDashboard(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  const inventoryStats = useMemo(() => {
    const total = menuItems.length
    const inStockItems = menuItems.filter(
      (item) => Number(item.quantity ?? 0) > 0 && item.isAvailable !== false,
    ).length
    const outOfStockItems = menuItems.filter(
      (item) => Number(item.quantity ?? 0) <= 0 || item.isAvailable === false,
    ).length
    const lowStockItems = menuItems.filter((item) => {
      const qty = Number(item.quantity ?? 0)
      return qty > 0 && qty <= 5 && item.isAvailable !== false
    }).length
    const totalUnits = menuItems.reduce((sum, item) => sum + Number(item.quantity ?? 0), 0)
    const categories = new Set(menuItems.map((item) => item.category)).size
    return { total, inStockItems, outOfStockItems, lowStockItems, totalUnits, categories }
  }, [menuItems])

  const stockAlerts = useMemo(
    () =>
      menuItems
        .filter((item) => Number(item.quantity ?? 0) <= 5 || item.isAvailable === false)
        .sort((a, b) => Number(a.quantity ?? 0) - Number(b.quantity ?? 0))
        .slice(0, 4)
        .map((item) => ({
          id: item._id || item.id,
          name: item.name,
          level:
            Number(item.quantity ?? 0) <= 0 || item.isAvailable === false
              ? 'Out of stock'
              : `Low (${Number(item.quantity ?? 0)} left)`,
          levelClass:
            Number(item.quantity ?? 0) <= 0 || item.isAvailable === false
              ? 'text-rose-600'
              : 'text-[#8f3d25]',
        })),
    [menuItems],
  )

  const orderStats = useMemo(() => {
    const counts = orders.reduce((acc, order) => {
      const status = order.status || 'Placed'
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {})

    return {
      active: (counts.Placed || 0) + (counts.Preparing || 0) + (counts.Ready || 0),
      delivered: counts.Delivered || 0,
      cancelled: counts.Cancelled || 0,
    }
  }, [orders])

  const recentOrders = useMemo(() => orders.slice(0, 3), [orders])

  const topSellers = useMemo(() => {
    const soldMap = new Map()

    orders.forEach((order) => {
      if (order.status === 'Cancelled') {
        return
      }

      ;(order.items || []).forEach((item) => {
        const itemName = item.name || 'Unknown item'
        soldMap.set(itemName, (soldMap.get(itemName) || 0) + Number(item.quantity || 0))
      })
    })

    return [...soldMap.entries()]
      .map(([name, sold]) => ({ name, sold }))
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 3)
  }, [orders])

  return (
    <div className="bg-[#eee8de]">


      <HeroSection showAdmin={isAdmin} adminPortal />
      <CardSection title="Admin Product Cards" adminMode />

      <section className="bg-[#f8f4ec] py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {dashboardError && (
            <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
              <p className="text-sm font-semibold text-rose-700">{dashboardError}</p>
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-xl border border-[#d5cec2] bg-[#eee8de] p-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#746b61]">Inventory</p>
              <h3 className="mt-2 text-base font-semibold text-[#24211d]">Live inventory</h3>
              <p className="mt-2 text-sm text-[#5d554c]">
                Synced from menu quantity to show stock units and low-stock items.
              </p>
              <div className="mt-4 space-y-2 text-xs text-[#5d554c]">
                <div className="flex items-center justify-between rounded-xl bg-[#f8f4ec] px-3 py-2">
                  <span>Total menu items</span>
                  <span className="font-semibold text-[#24211d]">{inventoryStats.total}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-[#f8f4ec] px-3 py-2">
                  <span>Total units in stock</span>
                  <span className="font-semibold text-[#24211d]">{inventoryStats.totalUnits}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-[#f8f4ec] px-3 py-2">
                  <span>In stock items</span>
                  <span className="font-semibold text-emerald-700">{inventoryStats.inStockItems}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-[#f8f4ec] px-3 py-2">
                  <span>Low stock items</span>
                  <span className="font-semibold text-[#8f3d25]">{inventoryStats.lowStockItems}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-[#f8f4ec] px-3 py-2">
                  <span>Out of stock items</span>
                  <span className="font-semibold text-rose-700">{inventoryStats.outOfStockItems}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-[#f8f4ec] px-3 py-2">
                  <span>Categories</span>
                  <span className="font-semibold text-[#24211d]">{inventoryStats.categories}</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[#d5cec2] bg-[#eee8de] p-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#746b61]">Stock alerts</p>
              <h3 className="mt-2 text-base font-semibold text-[#24211d]">Items needing action</h3>
              <p className="mt-2 text-sm text-[#5d554c]">
                Alerts are based on quantity levels and refresh automatically.
              </p>
              <div className="mt-4 space-y-2 text-xs text-[#5d554c]">
                {isLoadingDashboard ? (
                  <div className="rounded-xl bg-[#f8f4ec] px-3 py-2 text-[#746b61]">Loading stock alerts...</div>
                ) : stockAlerts.length === 0 ? (
                  <div className="rounded-xl bg-[#f8f4ec] px-3 py-2 text-emerald-700">
                    No stock alerts. All menu items are available.
                  </div>
                ) : (
                  stockAlerts.map((item) => (
                    <div key={item.id} className="flex items-center justify-between rounded-xl bg-[#f8f4ec] px-3 py-2">
                      <span>{item.name}</span>
                      <span className={`font-semibold ${item.levelClass}`}>{item.level}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-xl border border-[#d5cec2] bg-[#eee8de] p-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#746b61]">Orders</p>
              <h3 className="mt-2 text-base font-semibold text-[#24211d]">Live order queue</h3>
              <p className="mt-2 text-sm text-[#5d554c]">
                Monitor current order load and open the full orders panel for updates.
              </p>
              <div className="mt-4 space-y-2 text-xs text-[#5d554c]">
                <div className="flex items-center justify-between rounded-xl bg-[#f8f4ec] px-3 py-2">
                  <span>Active queue</span>
                  <span className="font-semibold text-[#8f3d25]">{orderStats.active}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-[#f8f4ec] px-3 py-2">
                  <span>Delivered</span>
                  <span className="font-semibold text-emerald-700">{orderStats.delivered}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-[#f8f4ec] px-3 py-2">
                  <span>Cancelled</span>
                  <span className="font-semibold text-rose-700">{orderStats.cancelled}</span>
                </div>
              </div>
              <div className="mt-3 space-y-1 rounded-xl bg-[#f8f4ec] p-3">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-[#746b61]">Recent orders</p>
                {isLoadingDashboard ? (
                  <p className="text-xs text-[#746b61]">Loading orders...</p>
                ) : recentOrders.length === 0 ? (
                  <p className="text-xs text-[#746b61]">No orders placed yet.</p>
                ) : (
                  recentOrders.map((order) => {
                    const orderId = order._id || order.id
                    const shortId = String(orderId).slice(-6)
                    return (
                      <div key={orderId} className="flex items-center justify-between text-xs">
                        <span className="text-[#3e3730]">#{shortId}</span>
                        <span className={`font-semibold ${statusClassMap[order.status] || 'text-[#3e3730]'}`}>
                          {order.status || 'Placed'}
                        </span>
                      </div>
                    )
                  })
                )}
              </div>
              <Link
                to="/admin/orders"
                className="mt-3 inline-flex rounded-full border border-[#d5cec2] px-3 py-1.5 text-xs font-semibold text-[#3e3730] hover:bg-[#e5ded3]"
              >
                Open all orders
              </Link>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-[#d5cec2] bg-[#eee8de] p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#746b61]">Insights</p>
            <h3 className="mt-2 text-base font-semibold text-[#24211d]">Top sellers</h3>
            <p className="mt-2 text-sm text-[#5d554c]">Calculated from non-cancelled orders.</p>
            <div className="mt-4 space-y-2 text-xs text-[#5d554c]">
              {isLoadingDashboard ? (
                <div className="rounded-xl bg-[#f8f4ec] px-3 py-2 text-[#746b61]">Loading insights...</div>
              ) : topSellers.length === 0 ? (
                <div className="rounded-xl bg-[#f8f4ec] px-3 py-2 text-[#746b61]">No sales data yet.</div>
              ) : (
                topSellers.map((item) => (
                  <div key={item.name} className="flex items-center justify-between rounded-xl bg-[#f8f4ec] px-3 py-2">
                    <span>{item.name}</span>
                    <span className="font-semibold text-[#24211d]">{item.sold} sold</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-10 rounded-xl border border-amber-100 bg-[#f2e4dc]/70 px-6 py-5">
            <p className="text-sm font-semibold text-[#24211d]">Need to update new Fashion items?</p>
            <p className="mt-1 text-xs text-[#5d554c]">Schedule changes now and publish with one click.</p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AdminHome
