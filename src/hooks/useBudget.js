// src/hooks/useBudget.js
import { useState, useEffect } from 'react';

/**
 * Hook personalizado para gestionar el presupuesto en el sistema SiPP
 * Extrae datos reales de localStorage y calcula métricas clave
 */
export const useBudget = () => {
  const [budgetData, setBudgetData] = useState({
    totalBudget: 0,
    totalExpenses: 0,
    available: 0,
    projectsCount: 0,
    purchasesCount: 0,
    userExpenses: 0,
    monthlyExpenses: {}, // Gastos por mes
    categoryExpenses: {}, // Gastos por categoría
  });

  useEffect(() => {
    const loadBudgetData = () => {
      try {
        // Cargar proyectos
        const projectsRaw = localStorage.getItem('SiPP_projects');
        const projects = projectsRaw ? JSON.parse(projectsRaw) : [];

        // Cargar compras
        const purchasesRaw = localStorage.getItem('SiPP_purchases');
        const purchases = purchasesRaw ? JSON.parse(purchasesRaw) : [];

        // Calcular datos generales
        const totalBudget = projects.reduce((sum, p) => sum + (parseFloat(p.budget) || 0), 0);
        const totalExpenses = purchases.reduce((sum, p) => sum + p.total, 0);
        const available = Math.max(0, totalBudget - totalExpenses);

        // Calcular gastos por usuario (para dashboard personalizado)
        const userExpenses = purchases.reduce((sum, p) => sum + p.total, 0);

        // Calcular gastos mensuales (últimos 6 meses)
        const monthlyExpenses = {};
        const now = new Date();
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);

        purchases.forEach(purchase => {
          const purchaseDate = new Date(purchase.date);
          if (purchaseDate >= sixMonthsAgo) {
            const monthKey = purchaseDate.toISOString().slice(0, 7); // "2025-07"
            monthlyExpenses[monthKey] = (monthlyExpenses[monthKey] || 0) + purchase.total;
          }
        });

        // Calcular gastos por categoría
        const categoryExpenses = {};
        purchases.forEach(purchase => {
          purchase.items.forEach(item => {
            const category = item.category || 'Sin categoría';
            categoryExpenses[category] = (categoryExpenses[category] || 0) + (item.price * item.quantity);
          });
        });

        setBudgetData({
          totalBudget,
          totalExpenses,
          available,
          projectsCount: projects.length,
          purchasesCount: purchases.length,
          userExpenses,
          monthlyExpenses,
          categoryExpenses,
        });
      } catch (error) {
        console.error('Error al cargar datos de presupuesto:', error);
        setBudgetData({
          totalBudget: 0,
          totalExpenses: 0,
          available: 0,
          projectsCount: 0,
          purchasesCount: 0,
          userExpenses: 0,
          monthlyExpenses: {},
          categoryExpenses: {},
        });
      }
    };

    loadBudgetData();

    // Escuchar cambios en localStorage (cuando se añade una compra o proyecto)
    const handleStorage = (e) => {
      if (e.key === 'SiPP_purchases' || e.key === 'SiPP_projects') {
        loadBudgetData();
      }
    };

    window.addEventListener('storage', handleStorage);

    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return { budgetData };
};