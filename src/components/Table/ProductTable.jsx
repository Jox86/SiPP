// src/components/Table/ProductTable.jsx
import { useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Box, Typography, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Button
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';

export default function ProductTable({ products, onDelete, onEdit }) {
  const [editOpen, setEditOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);

  const handleEdit = (product) => {
    setCurrentProduct({ ...product });
    setEditOpen(true);
  };

  const handleSave = () => {
    onEdit(currentProduct);
    setEditOpen(false);
  };

  return (
    <>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Imagen</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Modelo</TableCell>
              <TableCell>Precio</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map(p => (
              <TableRow key={p.id}>
                <TableCell>
                  <Box
                    component="img"
                    src={p.image}
                    alt={p.name}
                    sx={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 1 }}
                  />
                </TableCell>
                <TableCell>{p.name}</TableCell>
                <TableCell>{p.model}</TableCell>
                <TableCell>${p.price}</TableCell>
                <TableCell>{p.description}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(p)} size="small">
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton onClick={() => onDelete(p.id)} size="small" color="error">
                    <Delete fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal de edición */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
        <DialogTitle>Editar Producto</DialogTitle>
        <DialogContent>
          <TextField
            label="Nombre"
            value={currentProduct?.name || ''}
            onChange={e => setCurrentProduct(prev => ({ ...prev, name: e.target.value }))}
            fullWidth
            margin="dense"
          />
          <TextField
            label="Modelo"
            value={currentProduct?.model || ''}
            onChange={e => setCurrentProduct(prev => ({ ...prev, model: e.target.value }))}
            fullWidth
            margin="dense"
          />
          <TextField
            label="Precio"
            type="number"
            value={currentProduct?.price || ''}
            onChange={e => setCurrentProduct(prev => ({ ...prev, price: e.target.value }))}
            fullWidth
            margin="dense"
          />
          <TextField
            label="URL de imagen"
            value={currentProduct?.image || ''}
            onChange={e => setCurrentProduct(prev => ({ ...prev, image: e.target.value }))}
            fullWidth
            margin="dense"
          />
          <TextField
            label="Descripción"
            multiline
            rows={3}
            value={currentProduct?.description || ''}
            onChange={e => setCurrentProduct(prev => ({ ...prev, description: e.target.value }))}
            fullWidth
            margin="dense"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained">Guardar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}