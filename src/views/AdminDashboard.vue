<template>
  <div class="admin-dashboard">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div>
        <h2 class="mb-0">Dashboard Admin</h2>
        <small class="text-muted">Tổng quan và thống kê theo ngày, tháng và năm</small>
      </div>
    </div>

    <div class="row g-3 mt-3">
      <div class="col-12 col-md-4">
        <div class="card shadow-sm h-100">
          <div class="card-body">
            <h6 class="card-subtitle mb-2 text-muted">Sản phẩm</h6>
            <div class="d-flex align-items-center justify-content-between">
              <div>
                <h3 class="mb-0">{{ counts.products }}</h3>
                <small class="text-muted">Tổng sản phẩm</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-12 col-md-4">
        <div class="card shadow-sm h-100">
          <div class="card-body">
            <h6 class="card-subtitle mb-2 text-muted">Đơn hàng</h6>
            <div class="d-flex align-items-center justify-content-between">
              <div>
                <h3 class="mb-0">{{ counts.orders }}</h3>
                <small class="text-muted">Tổng đơn hàng</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-12 col-md-4">
        <div class="card shadow-sm h-100">
          <div class="card-body">
            <h6 class="card-subtitle mb-2 text-muted">Khách hàng</h6>
            <div class="d-flex align-items-center justify-content-between">
              <div>
                <h3 class="mb-0">{{ counts.customers }}</h3>
                <small class="text-muted">Số điện thoại khác nhau</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-4">
      <h5 class="mb-3">Thống kê theo khoảng thời gian</h5>

      <div class="row g-3">
        <div class="col-12 col-md-4">
          <div class="card h-100 shadow-sm">
            <div class="card-body">
              <h6 class="card-subtitle mb-2 text-muted">Hôm nay</h6>
              <div class="d-flex justify-content-between align-items-end">
                <div>
                  <div class="h4 mb-0">{{ stats.orders.day }}</div>
                  <small class="text-muted">Đơn hàng</small>
                </div>
                <div class="text-end">
                  <div class="h5 mb-0 text-success">{{ formatCurrency(stats.revenue.day) }}</div>
                  <small class="text-muted">Doanh thu</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-md-4">
          <div class="card h-100 shadow-sm">
            <div class="card-body">
              <h6 class="card-subtitle mb-2 text-muted">Tháng này</h6>
              <div class="d-flex justify-content-between align-items-end">
                <div>
                  <div class="h4 mb-0">{{ stats.orders.month }}</div>
                  <small class="text-muted">Đơn hàng</small>
                </div>
                <div class="text-end">
                  <div class="h5 mb-0 text-success">{{ formatCurrency(stats.revenue.month) }}</div>
                  <small class="text-muted">Doanh thu</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-md-4">
          <div class="card h-100 shadow-sm">
            <div class="card-body">
              <h6 class="card-subtitle mb-2 text-muted">Năm nay</h6>
              <div class="d-flex justify-content-between align-items-end">
                <div>
                  <div class="h4 mb-0">{{ stats.orders.year }}</div>
                  <small class="text-muted">Đơn hàng</small>
                </div>
                <div class="text-end">
                  <div class="h5 mb-0 text-success">{{ formatCurrency(stats.revenue.year) }}</div>
                  <small class="text-muted">Doanh thu</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="mt-4">
    <h5 class="mb-3">Đồ thị doanh thu 12 tháng gần nhất</h5>

    <div class="card shadow-sm">
      <div class="card-body">
        <canvas id="revenueChart" ref="revenueCanvas"></canvas>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { supabase } from '@/supabase'
import { notifyError } from '@/stores/notifications'
import Chart from 'chart.js/auto'

const counts = ref({ products: 0, orders: 0, customers: 0 })

const stats = ref({
  orders: { day: 0, month: 0, year: 0 },
  revenue: { day: 0, month: 0, year: 0 }
})

const revenueCanvas = ref(null)
let revenueChart = null

const formatCurrency = (value) => {
  if (!value && value !== 0) return '₫0'
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value)
}

const loadCounts = async () => {
  try {
    const [p, o, phones] = await Promise.all([
      supabase.from('products').select('id', { count: 'exact', head: true }),
      supabase.from('orders').select('id', { count: 'exact', head: true }),
      supabase.from('orders').select('phone')
    ])

    if (p.error) throw p.error
    if (o.error) throw o.error
    if (phones.error) throw phones.error

    const uniquePhones = new Set((phones.data || []).map(i => i.phone).filter(Boolean))

    counts.value.products = p.count || 0
    counts.value.orders = o.count || 0
    counts.value.customers = uniquePhones.size
  } catch (err) {
    notifyError('Lỗi khi load dashboard: ' + (err.message || err))
  }
}

const periodRanges = () => {
  const now = new Date()

  const startDay = new Date(now)
  startDay.setHours(0, 0, 0, 0)
  const nextDay = new Date(startDay)
  nextDay.setDate(startDay.getDate() + 1)

  const startMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const nextMonth = new Date(startMonth.getFullYear(), startMonth.getMonth() + 1, 1)

  const startYear = new Date(now.getFullYear(), 0, 1)
  const nextYear = new Date(now.getFullYear() + 1, 0, 1)

  return {
    day: { start: startDay.toISOString(), end: nextDay.toISOString() },
    month: { start: startMonth.toISOString(), end: nextMonth.toISOString() },
    year: { start: startYear.toISOString(), end: nextYear.toISOString() }
  }
}

const loadStats = async () => {
  try {
    const ranges = periodRanges()

    const qDay = supabase.from('orders').select('id,total').gte('created_at', ranges.day.start).lt('created_at', ranges.day.end)
    const qMonth = supabase.from('orders').select('id,total').gte('created_at', ranges.month.start).lt('created_at', ranges.month.end)
    const qYear = supabase.from('orders').select('id,total').gte('created_at', ranges.year.start).lt('created_at', ranges.year.end)

    const [rDay, rMonth, rYear] = await Promise.all([qDay, qMonth, qYear])

    if (rDay.error) throw rDay.error
    if (rMonth.error) throw rMonth.error
    if (rYear.error) throw rYear.error

    const calc = (rows) => {
      const items = rows || []
      const ordersCount = items.length
      const revenue = items.reduce((s, it) => s + (Number(it.total) || 0), 0)
      return { ordersCount, revenue }
    }

    const d = calc(rDay.data)
    const m = calc(rMonth.data)
    const y = calc(rYear.data)

    stats.value.orders.day = d.ordersCount
    stats.value.revenue.day = d.revenue

    stats.value.orders.month = m.ordersCount
    stats.value.revenue.month = m.revenue

    stats.value.orders.year = y.ordersCount
    stats.value.revenue.year = y.revenue
  } catch (err) {
    notifyError('Lỗi khi load số liệu thống kê: ' + (err.message || err))
  }
}

const monthLabels = (count = 12) => {
  const labels = []
  const now = new Date()
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    labels.push(d.toLocaleString('vi-VN', { month: 'short', year: 'numeric' }))
  }
  return labels
}

const loadMonthlyRevenue = async () => {
  try {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth() - 11, 1)
    const res = await supabase.from('orders').select('total,created_at').gte('created_at', start.toISOString())
    if (res.error) throw res.error

    const rows = res.data || []
    const sums = {}
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0')
      sums[key] = 0
    }

    for (const r of rows) {
      const d = new Date(r.created_at)
      const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0')
      if (key in sums) sums[key] += Number(r.total) || 0
    }

    const labels = monthLabels(12)
    const data = Object.keys(sums).map(k => sums[k])

    renderRevenueChart(labels, data)
  } catch (err) {
    notifyError('Lỗi khi load dữ liệu doanh thu: ' + (err.message || err))
  }
}

const renderRevenueChart = (labels, data) => {
  if (!revenueCanvas.value) return
  const ctx = revenueCanvas.value.getContext('2d')
  if (revenueChart) {
    revenueChart.data.labels = labels
    revenueChart.data.datasets[0].data = data
    revenueChart.update()
    return
  }

  revenueChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Doanh thu (VND)',
          data,
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          tension: 0.3,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true }
      },
      scales: {
        y: {
          ticks: {
            callback: (val) => {
              return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(val)
            }
          }
        }
      }
    }
  })
}

onMounted(() => {
  loadCounts()
  loadStats()
  loadMonthlyRevenue()
})

onBeforeUnmount(() => {
  if (revenueChart) {
    revenueChart.destroy()
    revenueChart = null
  }
})
</script>
