import React from 'react';
import { FaUser, FaLock } from 'react-icons/fa';

// Componentes básicos para el dashboard
export const Card = ({ title, value, subtitle, icon }) => (
  <div className="dashboard-card">
    <div className="card-icon">
      <i className={`fas ${icon}`}></i>
    </div>
    <div className="card-content">
      <h3>{title}</h3>
      <p className="card-value">{value}</p>
      <p className="card-subtitle">{subtitle}</p>
    </div>
  </div>
);

export const SimplePieChart = () => (
  <div className="chart-container">
    <h3>Distribución de solicitudes</h3>
    <div className="chart-placeholder pie-chart">
      <p>Gráfico de pastel mostraría aquí la distribución de tipos de solicitudes</p>
    </div>
  </div>
);

export const SimpleLineChart = () => (
  <div className="chart-container">
    <h3>Presupuesto gastado por mes</h3>
    <div className="chart-placeholder line-chart">
      <p>Gráfico de líneas mostraría aquí el presupuesto gastado por mes</p>
    </div>
  </div>
);

export const SimpleBarChart = () => (
  <div className="chart-container">
    <h3>Compras vs Servicios</h3>
    <div className="chart-placeholder bar-chart">
      <p>Gráfico de barras comparando compras y servicios</p>
    </div>
  </div>
);

export const SimpleTable = ({ columns, data }) => (
  <div className="table-container">
    <table>
      <thead>
        <tr>
          {columns.map((col, index) => (
            <th key={index}>{col}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {row.map((cell, cellIndex) => (
              <td key={cellIndex}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);