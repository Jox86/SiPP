import '../../styles/RecentProjectsTable.scss';

export default function RecentProjectsTable({ projects }) {
  const formatCurrency = (value) => 
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'CU' }).format(value)

  return (
    <div className="table-responsive">
      <table>
        <thead>
          <tr>
            <th>Proyecto</th>
            <th>Presupuesto</th>
            <th>Gastado</th>
            <th>% Usado</th>
          </tr>
        </thead>
        <tbody>
          {projects.map(project => {
            const percentUsed = project.budget > 0 
              ? Math.round((project.budgetSpent / project.budget) * 100)
              : 0
            
            return (
              <tr key={project.id}>
                <td>{project.name}</td>
                <td>{formatCurrency(project.budget)}</td>
                <td>{formatCurrency(project.budgetSpent)}</td>
                <td>
                  <div className="progress-bar">
                    <div 
                      className={`progress-fill ${percentUsed > 80 ? 'high' : percentUsed > 50 ? 'medium' : 'low'}`}
                      style={{ width: `${percentUsed}%` }}
                    >
                      {percentUsed}%
                    </div>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}