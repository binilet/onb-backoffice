// Extracted Grid Component
import { Grid,Box } from '@mui/material';
const PatternGrid = ({ grid, editable, onCellClick, size = 50 }) => (
    <Grid container spacing={1} justifyContent="center">
      {grid?.map((row, rowIndex) => (
        <Grid container item key={rowIndex} spacing={1} justifyContent="center">
          {row?.map((cell, colIndex) => (
            <Grid item key={colIndex}>
              <Box
                onClick={() => editable && onCellClick(rowIndex, colIndex)}
                sx={{
                  width: size,
                  height: size,
                  backgroundColor: cell ? 'primary.main' : '#ffffff',
                  border: '2px solid',
                  borderColor: cell ? 'primary.dark' : 'grey.400',
                  borderRadius: editable?'8px':'none',
                  cursor: editable ? 'pointer' : 'default',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.3s ease, border-color 0.3s ease',
                  '&:hover': editable ? {
                    backgroundColor: cell ? 'primary.light' : 'grey.200',
                  } : {},
                }}
              />
            </Grid>
          ))}
        </Grid>
      ))}
    </Grid>
  );

  export default PatternGrid;