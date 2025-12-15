// src/components/Dashboard/RecentOrdersTable.jsx
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, Typography, LinearProgress, Chip } from '@mui/material';
import { ShoppingCart, Build } from '@mui/icons-material';

export default function RecentOrdersTable({ orders }) {
  const getPriorityColor = (priority) => {
    if (priority === 'Alta') return 'error';
    if (priority === 'Media') return 'warning';
    return 'primary';
  };

  return (
    <TableContainer component={Paper} sx={{ maxHeight: 400, overflowY: 'auto' }}>
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Proyecto</TableCell>
            <TableCell>Tipo</TableCell>
            <TableCell>Estado</TableCell>
            <TableCell>Prioridad</TableCell>
            <TableCell>Progreso</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id} hover>
              <TableCell>{order.id}</TableCell>
              <TableCell>{order.projectName}</TableCell>
              <TableCell>
                {order.type === 'Compra' || order.type === 'TarjetaMovil' ? (
                  <ShoppingCart fontSize="small" color="primary" />
                ) : (
                  <Build fontSize="small" color="secondary" />
                )}
              </TableCell>
              <TableCell>
                <Chip
                  label={order.status}
                  size="small"
                  color={
                    order.status === 'Completado' ? 'success' :
                    order.status === 'En proceso' ? 'warning' : 'info'
                  }
                  sx={{ fontWeight: 600 }}
                />
              </TableCell>
              <TableCell>
                <Chip
                  label={order.priority}
                  size="small"
                  color={getPriorityColor(order.priority)}
                  variant="outlined"
                />
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={order.progress}
                    sx={{ width: '100%', height: 6, borderRadius: 3 }}
                  />
                  <Typography variant="body2">{order.progress}%</Typography>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}