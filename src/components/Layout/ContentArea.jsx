import Dashboard from '../../pages/Dashboard';
import Pedidos from '../../pages/Pedidos';
import Catalogo from '../../pages/Catalogo';
import Proyectos from '../../pages/Proyectos';
//import Usuarios from '../../pages/Usuarios';
import Reportes from '../../pages/Reportes';
import Perfil from '../../pages/PerfilUsuario';
//import CentroMensajes from '../../pages/CentroMensajes';
//mport Ayuda from '../../pages/Ayuda';
import '../../styles/ContentArea.scss'

export default function ContentArea({ activePage, projects, setProjects, currentUser }) {
  const renderContent = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard />;
      case 'pedidos': return <Pedidos />;
      case 'catalogo': return <Catalogo />;
      case 'proyectos': return <Proyectos projects={projects} setProjects={setProjects} currentUser={currentUser} />;
      case 'reportes': return <Reportes />;
      case 'perfil': return <Perfil />;
      default: return <Dashboard />;
    }
  };

  return <main className="content-area">{renderContent()}</main>;
}