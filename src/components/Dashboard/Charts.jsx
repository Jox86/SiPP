// components/Dashboard/Charts.js
import { Pie, Bar, Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title
} from 'chart.js'

// Registrar elementos necesarios en Chart.js
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title
)

export function PieChart({ data }) {
  return <Pie data={data} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
}

export function BarChart({ data }) {
  return <Bar data={data} options={{ responsive: true, plugins: { legend: { position: 'top' }, title: { display: true, text: 'Compras vs Servicios' } } }} />
}

export function LineChart({ data }) {
  return <Line data={data} options={{ responsive: true, plugins: { legend: { position: 'top' } }, scales: { y: { beginAtZero: true } } }} />
}