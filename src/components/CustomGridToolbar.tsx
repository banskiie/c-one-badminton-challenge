import { Box, Button } from "@mui/material"
import { AddCircle as AddIcon } from "@mui/icons-material"
import {
  GridToolbarContainer,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridToolbarQuickFilter,
} from "@mui/x-data-grid"

export default (label: string, action: () => void) => {
  return (
    <GridToolbarContainer
      sx={{ display: "flex", justifyContent: "space-between" }}
    >
      <Box>
        <GridToolbarFilterButton />
        <GridToolbarDensitySelector />
        <Button
          onClick={action}
          startIcon={<AddIcon />}
          variant="text"
          size="small"
          disableElevation
          color="success"
        >
          Add {label}
        </Button>
      </Box>
      <Box>
        <GridToolbarQuickFilter />
      </Box>
    </GridToolbarContainer>
  )
}
